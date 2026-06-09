"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function HandbagsPage() {
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["Totes"]);
  const [maxPrice, setMaxPrice] = useState<number>(1500);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase.from("products").select("*").neq("is_active", false).order("created_at", { ascending: false });
      if (data) setProducts(data);
    }
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredProducts = products.filter(product => {
    // Check categories
    const catMatch = selectedCategories.length === 0 || selectedCategories.some(cat => 
      (product.name as string)?.toLowerCase().includes(cat.toLowerCase()) ||
      (product.description as string)?.toLowerCase().includes(cat.toLowerCase())
    );
    // Check price
    const priceMatch = (Number(product.price) || 0) <= maxPrice;
    // Check colors
    const colorNames: Record<string, string> = {
      "#000000": "black", "#ba1a1a": "red", "#ffffff": "white", "#c7c6c6": "grey", "#7e7576": "brown"
    };
    const colMatch = selectedColors.length === 0 || selectedColors.some(c => 
      (product.name as string)?.toLowerCase().includes(colorNames[c] || "") ||
      (product.features as any)?.color?.toLowerCase() === colorNames[c]
    );

    return catMatch && priceMatch && colMatch;
  });

  const handleCategoryToggle = (cat: string) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const handleColorToggle = (color: string) => {
    setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);
  };

  return (
    <div className="bg-background text-on-background font-sans min-h-screen">
      {/* NAV */}
      <nav className="fixed top-0 w-full h-20 bg-surface border-b border-outline-variant z-50">
        <div className="max-w-[1440px] mx-auto px-20 h-full flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="text-3xl font-extrabold text-primary uppercase tracking-tighter">Cloe</Link>
            <div className="hidden md:flex gap-8 ml-8">
              {["New Arrivals", "Handbags", "Shoes", "Accessories", "Sale"].map((item) => (
                <Link key={item} href="#" className={`text-sm font-semibold uppercase tracking-wider transition-colors ${item === "Handbags" ? "text-primary border-b-2 border-primary pb-1" : "text-secondary hover:text-primary"}`}>{item}</Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="relative hidden lg:flex items-center">
              <input className="bg-surface-container-low border-none outline-none py-2 px-4 w-48 text-sm" placeholder="Search..." type="text" />
              <span className="material-symbols-outlined absolute right-2 text-secondary text-xl">search</span>
            </div>
            <Link href="/account" className="material-symbols-outlined hover:text-secondary transition-colors">person</Link>
            <button className="material-symbols-outlined hover:text-secondary transition-colors">favorite</button>
            <div className="relative">
              <button className="material-symbols-outlined hover:text-secondary transition-colors">shopping_cart</button>
              <span className="absolute -top-2 -right-2 bg-primary text-on-primary text-[10px] w-4 h-4 flex items-center justify-center rounded-full">2</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-20 min-h-screen">
        {/* HERO TITLE */}
        <section className="max-w-[1440px] mx-auto px-20 py-20">
          <div className="border-b border-outline-variant pb-6">
            <h1 className="text-6xl font-bold text-primary uppercase mb-3 tracking-tighter">Handbags</h1>
            <p className="text-xl text-secondary max-w-2xl leading-relaxed">Discover our curated collection of luxury handbags, from editorial collaborations to essential daily totes. Crafted for the modern sophisticate.</p>
          </div>
        </section>

        {/* PRODUCT LISTING */}
        <section className="max-w-[1440px] mx-auto px-20 grid grid-cols-12 gap-8 mb-20">
          {/* SIDEBAR */}
          <aside className="col-span-3 border-r border-outline-variant pr-8 sticky top-28 h-fit">
            <div className="space-y-10">
              <div>
                <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-6">Category</h3>
                <ul className="space-y-3">
                  {["Totes", "Satchels", "Clutches", "Crossbody"].map((cat) => (
                    <li key={cat}>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          checked={selectedCategories.includes(cat)} 
                          onChange={() => handleCategoryToggle(cat)}
                          className="border-outline text-primary focus:ring-primary w-4 h-4 rounded-sm" 
                          type="checkbox" 
                        />
                        <span className="text-sm font-semibold group-hover:text-primary transition-colors">{cat}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-6">Price</h3>
                <div className="space-y-2">
                  <input 
                    className="w-full accent-black bg-surface-container h-1 cursor-pointer" 
                    type="range" 
                    min="0" 
                    max="3000" 
                    step="50"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                  />
                  <div className="flex justify-between text-xs text-secondary font-semibold mt-2">
                    <span>$0</span><span>${maxPrice}{maxPrice >= 3000 ? "+" : ""}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-6">Color</h3>
                <div className="flex flex-wrap gap-3">
                  {["#000000", "#ba1a1a", "#ffffff", "#c7c6c6", "#7e7576"].map((color) => (
                    <button 
                      key={color} 
                      onClick={() => handleColorToggle(color)}
                      className={`w-8 h-8 border transition-all ${selectedColors.includes(color) ? "ring-2 ring-offset-2 ring-primary border-transparent" : "border-outline-variant hover:ring-1 hover:ring-offset-2 hover:ring-primary"}`} 
                      style={{ backgroundColor: color }} 
                    />
                  ))}
                </div>
              </div>
              <button 
                onClick={() => setIsFiltering(true)}
                className="w-full py-3 bg-primary text-on-primary text-sm font-semibold uppercase tracking-widest hover:bg-primary-container transition-colors"
              >
                {isFiltering ? "Filters Applied" : "Apply Filters"}
              </button>
            </div>
          </aside>

          {/* PRODUCT GRID */}
          <div className="col-span-9">
            <div className="flex justify-between items-center mb-8">
              <span className="text-xs text-secondary uppercase tracking-wide">Showing {filteredProducts.length} of {products.length} products</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-primary uppercase">Sort by:</span>
                <select className="border-none bg-transparent text-sm font-semibold text-primary focus:ring-0 cursor-pointer outline-none">
                  <option>Newest Arrivals</option>
                  <option>Price: High to Low</option>
                  <option>Price: Low to High</option>
                </select>
              </div>
            </div>
            
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-surface-container-low border border-outline-variant">
                <span className="material-symbols-outlined text-4xl text-secondary mb-4">search_off</span>
                <h3 className="text-xl font-bold text-primary mb-2">No products found</h3>
                <p className="text-secondary text-sm">Try adjusting your filters to see more results.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-x-8 gap-y-16">
                {filteredProducts.map((product) => (
                <Link href={`/product/${product.id}`} key={product.id} className="group cursor-pointer">
                  <div className="relative aspect-[3/4] overflow-hidden bg-surface-container mb-3">
                    <Image alt={product.name} src={product.images?.[0] || "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800"} fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />
                    <div className="absolute bottom-0 left-0 w-full bg-white/90 backdrop-blur-sm py-4 text-center text-sm font-semibold uppercase tracking-widest translate-y-full group-hover:translate-y-0 transition-transform duration-300 hover:bg-primary hover:text-on-primary">
                      Quick View
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-primary mb-1">{product.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-secondary">${Number(product.price).toFixed(2)}</span>
                  </div>
                </Link>
              ))}
            </div>
            )}
          </div>
        </section>

        {/* EDITORIAL BANNER */}
        <section className="max-w-[1440px] mx-auto px-20 mb-20">
          <div className="relative h-[500px] w-full overflow-hidden flex items-center group">
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500 z-10" />
            <Image alt="The Art of Carrying" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgAA5p5MNPqaLW2_U5qENetd6WUpA2s2iOlOw4x0UuDd_sUBnGmZ2faLy96LHUGC1tuuhIqw906i7AZggnKc94G6_dVG_Pp0e_5TM5S8HOqKhTG77cgz3aeAeFLswB6kvnPdIfWa6oNzJajHIgtJyLiadHyRRkyBwcW73X7erewGGDvDPqlLMdM79FyF8XwQEF33VSTkOf6aK3m4irmkuAJgDEYO8RVI6yzgAi2NTl8IWCcCAnpuPr6-kG6WjLdqkvAUdOGs9Zj_X9" fill className="object-cover transition-transform duration-[2000ms] group-hover:scale-105" unoptimized />
            <div className="relative z-20 px-20 text-white max-w-2xl">
              <span className="text-sm font-semibold uppercase tracking-[0.3em] mb-4 block">Limited Collection</span>
              <h2 className="text-6xl font-bold leading-none mb-6">The Art of Carrying</h2>
              <p className="text-xl mb-8 opacity-90 leading-relaxed">Explore our exclusive collaboration with contemporary artists, where fashion meets functional sculpture.</p>
              <button className="bg-white text-black py-4 px-10 text-sm font-semibold uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-300">Explore Collection</button>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="w-full py-20 bg-surface-container border-t border-outline-variant">
        <div className="max-w-[1440px] mx-auto px-20 grid grid-cols-12 gap-8">
          <div className="col-span-4">
            <Link href="/" className="text-2xl font-bold text-primary uppercase block mb-6 tracking-tighter">Cloe</Link>
            <p className="text-sm text-secondary max-w-xs mb-8 leading-relaxed">Authoritative editorial design meets luxury fashion.</p>
            <div className="flex gap-6">
              {["public", "share", "alternate_email"].map((icon) => (
                <span key={icon} className="material-symbols-outlined text-secondary cursor-pointer hover:text-primary transition-colors">{icon}</span>
              ))}
            </div>
          </div>
          {[
            { title: "Shop", links: ["New Arrivals", "Bags", "Shoes", "Sale"] },
            { title: "Company", links: ["Our Story", "Careers", "Boutiques", "Sustainability"] },
          ].map((col) => (
            <div key={col.title} className="col-span-2">
              <h5 className="text-sm font-semibold text-primary uppercase tracking-widest mb-6">{col.title}</h5>
              <ul className="space-y-3">
                {col.links.map((l) => <li key={l}><a href="#" className="text-sm text-secondary hover:text-primary transition-colors">{l}</a></li>)}
              </ul>
            </div>
          ))}
          <div className="col-span-4">
            <h5 className="text-sm font-semibold text-primary uppercase tracking-widest mb-6">Join the Journal</h5>
            <p className="text-xs text-secondary mb-4">Receive weekly editorial insights and early access to new collections.</p>
            <div className="flex">
              <input className="flex-grow bg-white border border-outline-variant px-4 py-3 text-sm outline-none focus:border-primary" placeholder="Email Address" type="email" />
              <button className="bg-primary text-on-primary px-8 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-primary-container transition-colors">Subscribe</button>
            </div>
          </div>
          <div className="col-span-12 pt-8 flex flex-col md:flex-row justify-between border-t border-outline-variant mt-4">
            <p className="text-sm text-secondary mb-4 md:mb-0">© 2024 Cloe. All rights reserved.</p>
            <div className="flex gap-8">
              {["Privacy", "Terms", "Help", "Contact"].map((l) => <a key={l} href="#" className="text-sm text-secondary hover:text-primary transition-colors">{l}</a>)}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
