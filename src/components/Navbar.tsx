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

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

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

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      // Check immediately and on every re-render/resize/scroll
      checkScroll();
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [categories]);

  // Check scroll when fonts or layout might have fully loaded
  useEffect(() => {
    const timer = setTimeout(checkScroll, 500);
    return () => clearTimeout(timer);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 250;
      scrollContainerRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

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
      <div className="max-w-[1440px] mx-auto px-4 md:px-10 xl:px-20 flex items-center justify-between h-full gap-4 lg:gap-8">
        
        {/* MOBILE MENU BUTTON & LOGO */}
        <div className="flex items-center gap-3 lg:gap-0 shrink-0">
          <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden material-symbols-outlined text-primary">menu</button>
          <Link href="/" className="text-xl md:text-2xl lg:text-3xl font-extrabold text-primary uppercase tracking-tighter">
            {storeName}
          </Link>
        </div>
        
        {/* CATEGORIES */}
        <div className="hidden lg:flex flex-1 min-w-0 items-center justify-center relative h-full">
          {showLeftArrow && (
            <button 
              onClick={() => scroll('left')} 
              className="absolute left-0 z-10 p-1 bg-white/90 hover:bg-white text-gray-400 hover:text-black transition-colors rounded-full shadow-md flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
          )}
          
          <div 
            ref={scrollContainerRef} 
            className="flex items-center gap-8 overflow-x-auto hide-scrollbar scroll-smooth h-full px-4"
          >
            <Link href="/" className={`shrink-0 text-sm font-medium tracking-widest uppercase transition-all duration-300 relative py-2 flex flex-col items-center justify-center ${pathname === "/" ? "text-primary -translate-y-[3px]" : "text-secondary hover:text-primary"}`}>
              Inicio
              {pathname === "/" && <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-primary rounded-full"></span>}
            </Link>
            
            {categories.map((cat) => {
              const subs = subcategories.filter(s => s.category_id === cat.id);
              const isActive = pathname === `/category/${cat.slug}` || pathname.startsWith(`/category/${cat.slug}/`);
              
              return (
                <div key={cat.id} className="group/nav relative flex items-center h-full shrink-0">
                  <Link href={`/category/${cat.slug}`} className={`text-sm font-medium tracking-widest uppercase transition-all duration-300 relative py-2 flex flex-col items-center justify-center ${isActive ? "text-primary -translate-y-[3px]" : "text-secondary hover:text-primary"}`}>
                    {cat.name}
                    {isActive && <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-primary rounded-full"></span>}
                  </Link>
                  
                  {subs.length > 0 && (
                    <div className="absolute top-16 left-0 mt-2 w-48 bg-white border border-outline-variant shadow-lg opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-200 z-50 flex flex-col">
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

          {showRightArrow && (
            <button 
              onClick={() => scroll('right')} 
              className="absolute right-0 z-10 p-1 bg-white/90 hover:bg-white text-gray-400 hover:text-black transition-colors rounded-full shadow-md flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          )}
        </div>

        {/* ICONS */}
        <div className="flex items-center gap-3 md:gap-5 shrink-0">
          {isSearchOpen ? (
            <form onSubmit={handleSearchSubmit} className="flex items-center bg-surface-container rounded-full px-4 py-1 animate-in fade-in slide-in-from-right-4 duration-300">
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Buscar..." 
                className="bg-transparent text-sm outline-none w-32 lg:w-48 xl:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                onBlur={() => {
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

      {/* MOBILE DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] flex lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative w-4/5 max-w-sm bg-surface h-full shadow-xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between p-4 border-b border-outline-variant">
              <span className="font-extrabold text-primary text-xl uppercase tracking-tighter">{storeName}</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="material-symbols-outlined text-primary">close</button>
            </div>
            <div className="p-4 border-b border-outline-variant">
              <form onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                  setIsMobileMenuOpen(false);
                  setSearchQuery("");
                }
              }} className="flex items-center bg-surface-container rounded-full px-4 py-2">
                <input 
                  type="text" 
                  placeholder="Buscar..." 
                  className="bg-transparent text-sm outline-none flex-1"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="material-symbols-outlined text-primary text-[18px]">search</button>
              </form>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className={`text-sm font-medium tracking-widest uppercase py-3 border-b border-outline-variant ${pathname === "/" ? "text-primary" : "text-secondary"}`}>Inicio</Link>
              {categories.map(cat => (
                <div key={cat.id} className="flex flex-col">
                  <Link href={`/category/${cat.slug}`} onClick={() => setIsMobileMenuOpen(false)} className={`text-sm font-medium tracking-widest uppercase py-3 border-b border-outline-variant ${pathname.includes(cat.slug) ? "text-primary" : "text-secondary"}`}>{cat.name}</Link>
                  {subcategories.filter(s => s.category_id === cat.id).map(sub => (
                    <Link key={sub.id} href={`/category/${cat.slug}?sub=${sub.slug}`} onClick={() => setIsMobileMenuOpen(false)} className="text-xs text-secondary pl-4 py-2 border-b border-outline-variant border-dashed hover:text-primary uppercase tracking-widest">
                      - {sub.name}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-outline-variant">
              <Link href="/account" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 py-2 text-primary hover:text-secondary uppercase text-sm font-medium tracking-widest"><span className="material-symbols-outlined">person</span> Mi cuenta</Link>
              <Link href="/account/favorites" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 py-2 text-primary hover:text-secondary uppercase text-sm font-medium tracking-widest"><span className="material-symbols-outlined">favorite</span> Favoritos</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
