"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import FavoriteButton from "@/components/FavoriteButton";

export default function HomePage() {
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [banners, setBanners] = useState<Record<string, Record<string, unknown>>>({});
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const { data: prodData } = await supabase.from("products").select("*").order("created_at", { ascending: false }).limit(4);
      if (prodData) setProducts(prodData);

      const { data: banData } = await supabase.from("banners").select("*");
      if (banData) {
        const banObj = banData.reduce((acc: Record<string, Record<string, unknown>>, curr: Record<string, unknown>) => {
          acc[curr.section as string] = curr;
          return acc;
        }, {});
        setBanners(banObj);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-background text-on-background font-sans">


      <main className="mt-20">
        {/* HERO */}
        <section className="relative w-full h-[90vh] overflow-hidden bg-surface-container">
          <div className="absolute inset-0">
            <Image
              alt={banners['hero']?.title as string || "Campaign Hero"}
              src={banners['hero']?.image_url as string || "https://lh3.googleusercontent.com/aida/ADBb0ui2sG7W4QW_Ljn_heyx-0-p7qNeJm6B-6JnxUbYdWEdkY7Zskp4lA4lsye2Vzeb6I-JyvyxEOkcY8Bpht9cRqNipnV0JSE8UnV45g7Prlm6ENDG8UWeD9tTaOsdmcX_N1_UfKMQ__ybTxv8wW7QuTN10axNgkD1A11zw_jtGdEEybg3V_aYRzCPZ2sR5qoUSTdvvTmuF1kUf7j5OvdZScqPbipqF4aau9kgQOtH1LoRijE1mPM3jU9Qzuwh"}
              fill className="object-cover object-center" unoptimized priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-transparent" />
          </div>
          <div className="relative h-full max-w-[1440px] mx-auto px-20 flex flex-col justify-center items-start">
            <div className="max-w-2xl">
              <span className="text-sm font-semibold text-primary tracking-[0.2em] uppercase mb-4 block">{banners['hero']?.subtitle as string || "Summer Clearance"}</span>
              <h1 className="text-7xl lg:text-8xl font-extrabold text-error leading-none mb-6 tracking-tighter">{banners['hero']?.title as string || "LAST CHANCE"}</h1>
              <p className="text-xl text-on-surface mb-12 max-w-md leading-relaxed">
                Final reductions on our most coveted collections. Once they&apos;re gone, they&apos;re gone forever.
              </p>
              <Link href={(banners['hero']?.link_url as string) || "/handbags"} className="inline-block bg-primary text-white px-10 py-4 text-sm font-semibold hover:bg-primary-container transition-colors uppercase tracking-widest">
                {banners['hero']?.link_text as string || "SHOP NOW"}
              </Link>
            </div>
          </div>
        </section>

        {/* SHOP BY CATEGORY */}
        <section className="max-w-[1440px] mx-auto px-20 py-20">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-sm font-semibold text-secondary uppercase tracking-widest block mb-2">Collections</span>
              <h2 className="text-4xl font-bold tracking-tight">Shop by Category</h2>
            </div>
            <Link href="/handbags" className="text-sm font-semibold border-b border-primary pb-1 hover:text-secondary hover:border-secondary transition-all">
              View All Categories
            </Link>
          </div>
          <div className="grid grid-cols-12 gap-8">
            {/* Handbags - Large */}
            <Link href="/handbags" className="col-span-12 md:col-span-8 group cursor-pointer overflow-hidden border border-outline-variant">
              <div className="relative h-[600px] overflow-hidden">
                <Image
                  alt="Premium Handbags Collection"
                  src={banners['category_handbags']?.image_url as string || "https://lh3.googleusercontent.com/aida/ADBb0ugjbPyixeRauJe0OfGwmJdqgCnX56IqvPi5JiTtdLvDvexhkoOfZ36Xr42zEkMIAU4jgLHboIyk3jFUTizTaeptdsTj2a4CI9mmF7x5UNj4JBcqQE83GZo6eyuX4YFr6Tfk0D9Y1HaK9JvvRPZ5AwhPpR5FdGiNYrmX08ZCvPb_IzZfR-TDZ0DgvRMMUWncPgH1AlXpFE9hjMrqgjCqZTmNPACcpaNo0eaD9GBC7tqy94iYRV8SfGjigmM9"}
                  fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-300" />
                <div className="absolute bottom-10 left-10 text-white">
                  <h3 className="text-3xl font-semibold mb-2">{banners['category_handbags']?.title as string || "Handbags"}</h3>
                  <p className="text-sm font-semibold opacity-80 group-hover:opacity-100 transition-opacity">{banners['category_handbags']?.subtitle as string || "Discover Iconic Silhouettes"}</p>
                </div>
              </div>
            </Link>
            {/* Stacked Side */}
            <div className="col-span-12 md:col-span-4 flex flex-col gap-8">
              <div className="group cursor-pointer border border-outline-variant flex-1 overflow-hidden">
                <div className="relative h-[284px] overflow-hidden">
                  <Image
                    alt="Durable Designer Luggage"
                    src={banners['category_luggage']?.image_url as string || "https://lh3.googleusercontent.com/aida/ADBb0uhc8GHbds5co_BPboOA41MvSYlGWiz3-S2jDikp7i9ez_pr9LacPUzeNv_pGP_CK8l3btrH8Ow1zffApzbqQhjjkHVIbLU4Qv9Y8pxmRHc4-nXN0pbmXzUx9yiJi4mCBuc3F9Aw5MpMNsk9VYV175Hney7iq__3VQxdr_z_6CK6UJ2AIc_tOOcE18fewEPciyKER-Al4UuBvThkX-i6rHgTyns-fcs7YqA-DxzENeE2IXPar3ZXIBPb4N0"}
                    fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                  <div className="absolute bottom-6 left-6">
                    <h3 className="text-2xl font-semibold text-white mb-1">{banners['category_luggage']?.title as string || "Luggage"}</h3>
                    <span className="text-xs font-semibold text-white/80 uppercase">{banners['category_luggage']?.subtitle as string || "Travel in Style"}</span>
                  </div>
                </div>
              </div>
              <div className="group cursor-pointer border border-outline-variant flex-1 overflow-hidden bg-surface-container-low">
                <div className="relative h-[284px] flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-full h-full absolute inset-0 opacity-20">
                    <Image
                      alt="Luxury Accessories"
                      src={banners['category_accessories']?.image_url as string || "https://lh3.googleusercontent.com/aida/ADBb0uj_fTD_OOrWfu1JL-xzC26MivraWGMoUPCYuSORArNGFjvViUz6re7pFhmmIjWLsC3Gbsdvd5y7zCChkLy0ZPh5iVJrDAH6zLxTC57wV-SDKXslLLUy3-91RxZAm3cjXfL00Q-2UqbxvwIb_QvVuD1UzVV7Tt8zyPn6dLLBPreVTDrNpeYb_e-n8-fVZpR-zL7FVndZT-DwbIaFcCll-YAEVm5vBZ8vEkXPUBFiuoja3Ra0G643SiPTvW4"}
                      fill className="object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110" unoptimized
                    />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-semibold text-primary mb-2">{banners['category_accessories']?.title as string || "Accessories"}</h3>
                    <p className="text-base text-secondary mb-4">{banners['category_accessories']?.subtitle as string || "The finishing touch for every look."}</p>
                    <span className="inline-block px-4 py-2 border border-primary text-xs font-semibold hover:bg-primary hover:text-white transition-colors">{banners['category_accessories']?.link_text as string || "EXPLORE"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LIMITED EDITION */}
        <section className="relative w-full min-h-[600px] flex items-center bg-surface-container overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              alt="Whimsical Limited Edition"
              src={banners['limited_edition']?.image_url as string || "https://lh3.googleusercontent.com/aida/ADBb0ugCvuL3sSd2ER-Tf66oGRNrOBGuaInCYGxlud7suG51GxsXeCoCxAgExKoXXVLhwB9CVQ7rtnkdjrmCgMZvbm8Z37RSuQEwSmrPaj99rToyyPTYrjnMi8QijNgqtH0KgKb6G_GOtg4TTFO8nP03HlB2Paq0VmrFKqFr2iW6vWMuTw5ZnRGCpGV-Ou1x5P8ZvR7yez3-0aojdQ84ck_aR3C41LcvLCtoTL09P4-H5-Q2Ci9c3PaNZUiXyWKD"}
              fill className="object-cover" unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-l from-white/60 via-transparent to-transparent" />
          </div>
          <div className="relative z-10 max-w-[1440px] mx-auto px-20 flex justify-end w-full">
            <div className="max-w-xl bg-white/80 backdrop-blur-md p-20 border border-outline-variant shadow-lg">
              <h2 className="text-5xl font-bold leading-tight mb-4">{banners['limited_edition']?.title as string || "Whimsical Limited Edition"}</h2>
              <p className="text-xl text-secondary mb-8 leading-relaxed">
                {banners['limited_edition']?.subtitle as string || "Experience our latest collaboration featuring playful icons and timeless artistry. A fusion of nostalgic charm and modern luxury craft."}
              </p>
              <div className="flex gap-4">
                <Link href={(banners['limited_edition']?.link_url as string) || "/handbags"} className="bg-primary text-white px-8 py-4 text-sm font-semibold hover:bg-primary-container transition-all uppercase tracking-widest">{banners['limited_edition']?.link_text as string || "Shop Collection"}</Link>
                <button className="border border-primary text-primary px-8 py-4 text-sm font-semibold hover:bg-primary hover:text-white transition-all uppercase tracking-widest">Learn More</button>
              </div>
            </div>
          </div>
        </section>

        {/* TRENDING NOW */}
        <section className="max-w-[1440px] mx-auto px-20 py-20">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold tracking-tight">Trending Now</h2>
            <div className="flex gap-2">
              <button className="w-10 h-10 flex items-center justify-center border border-outline hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="w-10 h-10 flex items-center justify-center border border-outline hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <Link href={`/product/${product.id}`} key={product.id} className="group">
                <div className="aspect-[3/4] relative overflow-hidden bg-surface-container-low mb-3">
                  <Image
                    alt={product.name as string}
                    src={(product.images as string[])?.[0] || "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800"}
                    fill className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized
                  />
                  <FavoriteButton productId={product.id as string} />
                  <button className="absolute bottom-0 left-0 right-0 bg-primary/90 text-white py-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 text-xs font-semibold tracking-widest">
                    QUICK ADD
                  </button>
                </div>
                <h4 className="text-sm font-semibold text-primary mb-1">{product.name}</h4>
                <p className="text-base text-secondary mb-2">${Number(product.price).toFixed(2)}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* JOIN THE LIST */}
        <section className="bg-surface-container-low py-20 border-t border-b border-outline-variant">
          <div className="max-w-[1440px] mx-auto px-20">
            <div className="grid grid-cols-12 items-center gap-8">
              <div className="col-span-12 lg:col-span-6">
                <h2 className="text-4xl font-bold mb-4">Join the List</h2>
                <p className="text-xl text-secondary leading-relaxed">Subscribe to receive exclusive access to new arrivals, private events, and editorial content.</p>
              </div>
              <div className="col-span-12 lg:col-span-6">
                <form className="flex flex-col sm:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
                  <input
                    className="flex-grow bg-transparent border-b-2 border-primary py-4 px-2 outline-none text-base focus:border-secondary transition-colors"
                    placeholder="Email Address" required type="email"
                  />
                  <button className="bg-primary text-white px-10 py-4 text-sm font-semibold hover:bg-primary-container transition-colors uppercase tracking-widest whitespace-nowrap" type="submit">
                    Subscribe
                  </button>
                </form>
                <p className="text-xs text-secondary mt-4">By signing up, you agree to our <a className="underline" href="#">Privacy Policy</a>.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-surface-container py-20 border-t border-outline-variant">
        <div className="max-w-[1440px] mx-auto px-20 grid grid-cols-12 gap-8 mb-20">
          <div className="col-span-12 md:col-span-3">
            <Link href="/" className="text-2xl font-bold text-primary uppercase mb-6 block tracking-tighter">Cloe</Link>
            <p className="text-base text-secondary mb-6 pr-4 leading-relaxed">High-end accessories and luggage for the modern world. Precision craft meets timeless elegance.</p>
            <div className="flex gap-3">
              {["public", "camera", "video_library"].map((icon) => (
                <a key={icon} href="#" className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-outline-variant hover:border-primary transition-colors">
                  <span className="material-symbols-outlined text-xl">{icon}</span>
                </a>
              ))}
            </div>
          </div>
          {[
            { title: "Shop", links: ["All Handbags", "Travel Gear", "Shoes", "Limited Edition", "Sale"] },
            { title: "Company", links: ["Our Story", "Sustainability", "Store Locator", "Journal"] },
            { title: "Support", links: ["Contact Us", "Shipping", "Returns", "FAQ"] },
            { title: "Account", links: ["Login / Register", "Order Status", "Wishlist", "Gift Cards"] },
          ].map((col) => (
            <div key={col.title} className="col-span-6 md:col-span-2">
              <h5 className="text-sm font-semibold text-primary mb-6 uppercase tracking-widest">{col.title}</h5>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}><a href="#" className="text-sm text-secondary hover:text-primary transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-[1440px] mx-auto px-20 pt-8 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-sm text-secondary">© 2024 Cloe. All rights reserved.</span>
          <div className="flex gap-8">
            {["Privacy", "Terms", "Help", "Contact"].map((l) => (
              <a key={l} href="#" className="text-sm text-secondary hover:text-primary transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
