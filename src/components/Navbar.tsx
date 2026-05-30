"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

type Category = { id: string; name: string; slug: string };
type Subcategory = { id: string; category_id: string; name: string; slug: string };

import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { totalItems } = useCart();
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data: cats } = await supabase.from("categories").select("*").order("name");
      const { data: subs } = await supabase.from("subcategories").select("*").order("name");
      if (cats) setCategories(cats);
      if (subs) setSubcategories(subs);
    }
    fetchData();
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
          <Link href="/" className="text-3xl font-extrabold text-primary uppercase tracking-tighter">Cloe</Link>
          <div className="hidden lg:flex items-center gap-8 relative">
            <Link href="/" className={`text-sm font-semibold tracking-widest uppercase transition-colors ${pathname === "/" ? "text-primary border-b-2 border-primary pb-2" : "text-secondary hover:text-primary"}`}>Inicio</Link>
            
            {categories.map((cat) => {
              const subs = subcategories.filter(s => s.category_id === cat.id);
              const isActive = pathname.startsWith(`/category/${cat.slug}`);
              
              return (
                <div key={cat.id} className="group relative">
                  <Link href={`/category/${cat.slug}`} className={`text-sm font-semibold tracking-widest uppercase transition-colors py-8 ${isActive ? "text-primary border-b-2 border-primary" : "text-secondary hover:text-primary"}`}>
                    {cat.name}
                  </Link>
                  
                  {subs.length > 0 && (
                    <div className="absolute top-12 left-0 mt-2 w-48 bg-white border border-outline-variant shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col">
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
          <Link href="/account" className="material-symbols-outlined text-primary hover:text-secondary transition-colors">person</Link>
          <Link href="/account/favorites" className="material-symbols-outlined text-primary hover:text-secondary transition-colors">favorite</Link>
          <Link href="/cart" className="relative">
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
