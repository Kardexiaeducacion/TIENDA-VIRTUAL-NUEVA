"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

type Category = { id: string; name: string; slug: string };
type Subcategory = { id: string; category_id: string; name: string; slug: string };

import { useCart } from "@/context/CartContext";
import { useStoreInfo } from "@/context/StoreInfoContext";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { totalItems } = useCart();
  const { storeName } = useStoreInfo();
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id || null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUserId(session?.user?.id || null);
    });

    async function fetchData() {
      const { data: cats } = await supabase.from("categories").select("*").order("name");
      const { data: subs } = await supabase.from("subcategories").select("*").order("name");
      if (cats) setCategories(cats);
      if (subs) setSubcategories(subs);
    }
    fetchData();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  // Hide Navbar in editor, login, register, etc.
  if (pathname.startsWith("/editor") || pathname === "/login" || pathname === "/register") {
    return null;
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <nav className="fixed top-0 w-full h-20 bg-surface border-b border-outline-variant z-50 transition-all duration-200">
      <div className="max-w-[1440px] mx-auto px-20 flex items-center justify-between h-full">
        <div className="flex items-center gap-10">
          <Link href="/" className="text-3xl font-extrabold text-primary uppercase tracking-tighter">{storeName}</Link>
          <div className="hidden lg:flex items-center gap-8 relative h-full">
            <Link href="/" className={`text-sm font-medium tracking-widest uppercase transition-all duration-300 relative py-2 flex flex-col items-center justify-center ${pathname === "/" ? "text-primary -translate-y-[3px]" : "text-secondary hover:text-primary"}`}>
              Inicio
              {pathname === "/" && <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-primary rounded-full"></span>}
            </Link>
            
            {categories.map((cat) => {
              const subs = subcategories.filter(s => s.category_id === cat.id);
              const isActive = pathname === `/category/${cat.slug}` || pathname.startsWith(`/category/${cat.slug}/`);
              
              return (
                <div key={cat.id} className="group relative flex items-center h-full">
                  <Link href={`/category/${cat.slug}`} className={`text-sm font-medium tracking-widest uppercase transition-all duration-300 relative py-2 flex flex-col items-center justify-center ${isActive ? "text-primary -translate-y-[3px]" : "text-secondary hover:text-primary"}`}>
                    {cat.name}
                    {isActive && <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-primary rounded-full"></span>}
                  </Link>
                  
                  {subs.length > 0 && (
                    <div className="absolute top-16 left-0 mt-2 w-48 bg-white border border-outline-variant shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col">
                      {subs.map(sub => (
                        <Link key={sub.id} href={`/category/${cat.slug}?sub=${sub.slug}`} className="px-4 py-3 text-sm text-secondary hover:text-primary hover:bg-surface-container transition-colors uppercase tracking-widest">
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-5">
          {isSearchOpen ? (
            <form onSubmit={handleSearchSubmit} className="flex items-center bg-surface-container rounded-full px-4 py-1 animate-in fade-in slide-in-from-right-4 duration-300">
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Buscar productos, ID, categorías..." 
                className="bg-transparent text-sm outline-none w-48 lg:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                onBlur={() => {
                  // Pequeño delay para permitir el click en el botón de buscar
                  setTimeout(() => setIsSearchOpen(false), 200);
                }}
              />
              <button type="submit" className="material-symbols-outlined text-primary text-sm hover:text-secondary">search</button>
            </form>
          ) : (
            <button onClick={() => { setIsSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 100); }} className="material-symbols-outlined text-primary hover:text-secondary transition-colors">search</button>
          )}
          <NotificationBell userId={userId} />
          <Link href="/account" aria-label="Mi cuenta" className="material-symbols-outlined text-primary hover:text-secondary transition-colors">person</Link>
          <Link href="/account/favorites" aria-label="Mis favoritos" className="material-symbols-outlined text-primary hover:text-secondary transition-colors">favorite</Link>
          <Link href="/cart" className="relative" aria-label="Ver carrito">
            <button className="material-symbols-outlined text-primary hover:text-secondary transition-colors">shopping_cart</button>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
