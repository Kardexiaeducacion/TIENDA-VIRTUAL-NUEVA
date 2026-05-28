"use client";
import Link from "next/link";
import Image from "next/image";

const products = [
  { id: 1, name: "Cloe x Betty White Satchel", price: "$895.00", badge: "New", badgeColor: "bg-primary text-on-primary", img: "https://lh3.googleusercontent.com/aida/ADBb0ugnY6c6sM1iHryqO0UA7CrazbWiclbZ-RlI_YnhIKor2qSsgiImvaE01NM0IL3dm0AoQKBOF9ZDh62DPldKSPRlRk9SrGkDCSPzz7NONd_KXompPTaH5Pt0aLxjqYpsbPgEMv6izweYzBrac74Mj-YAWFDM9qCyQK_Bc_noyx5uATDz2H5Cds8SQ6GUPK4rSgTxoB3wdOU6FgbIZx0r4GgqD8KryaLo3xitmEY6Me8VBfG_Y_mT2gKljD4W" },
  { id: 2, name: "Cloe x Betty Black Tote", price: "$1,120.00", badge: null, badgeColor: "", img: "https://lh3.googleusercontent.com/aida/ADBb0uhhBPrdBT2O2iizwUAa-mlv4nZU_lCBVNZYH0z6XG8OKWOocpGH8pU2vvdn6Kzy2vgQwhlxMNvC57BmntSTweGWild2BGgRD6iWqp4a1d-19Q3JXEWfsUKzTvqDesIUhq6GAbTmXzNPsF60Ff_zYxfqGpK62EwMVKrtIMi5hSpPMa6tdUSQXihWCgsKRxfWa491rpJ82sgILAjWXxsNc6oOnC9iKE_Jc-2h4_A-TKmkwG14SkGyvHFEqmwx" },
  { id: 3, name: "Essential Leather Tote", price: "$550.00", badge: null, badgeColor: "", img: "https://lh3.googleusercontent.com/aida/ADBb0uhwvYLdyI49qUO8v-0AlxU2gTSrRFuqaiwkTPimFq_PHGIf8eLuq0BqdYsvASD9WOCXFu438saspVResTgu-FAA_nJk0vhRWd2HeTAR0puSHKH3iaOItlz7u8GJdlP_Fq5sa4D4uIjiYXzOK-Y1ezJTgcyII2wqJZvGKrBLMHWUQtcXH380l9CMwslQNFyLsR5JgZv5DOZxk4YxT1sMk9loHtETPR-rqWsXZTj1dHUA2xhy8tZ3uCf2CDuy" },
  { id: 4, name: "Modern Top Handle Bag", price: "$495.00", originalPrice: "$720.00", badge: "Sale", badgeColor: "bg-error text-on-error", img: "https://lh3.googleusercontent.com/aida/ADBb0uis7azS51WqBjstzhX5o_oLcUldqe_P2_q1GwipjIsmJl3JhP8z76yoGpuJiW1Yp9zNxHaFBW6WdS_EsUvPi5aoOEW1O3-jtdoUQTpO0mJnq13qxcfUj7DsmGfPWw7mizExI8UPOCGwRAkYRQMF2UoP37xqzfISXQoJkuqkzcZqwbo0nmtjy3ZhnjcuDYV4T-ADrESc6jQRgUtkKvxUP8O3Nv52fXFJ9ahezhnegr55uiUKjs85RoDXonlN" },
];

const AdminNav = ({ active }: { active: string }) => (
  <aside className="fixed left-0 top-0 h-full w-64 bg-surface border-r border-outline-variant flex flex-col z-50">
    <div className="px-4 py-6 border-b border-outline-variant mb-4">
      <h1 className="text-2xl font-extrabold text-primary">Admin Center</h1>
      <p className="text-xs text-secondary mt-1">Manage Cloe Store</p>
    </div>
    <nav className="flex-1 space-y-1 px-2">
      {[
        { label: "Dashboard", icon: "dashboard", href: "/editor" },
        { label: "Products", icon: "inventory_2", href: "/editor/products/new" },
        { label: "Orders", icon: "shopping_bag", href: "/editor/orders" },
        { label: "Q&A", icon: "forum", href: "/editor/qa" },
        { label: "Settings", icon: "settings", href: "/editor/settings" },
      ].map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={`flex items-center gap-3 px-4 py-3 rounded transition-all text-sm font-semibold ${
            active === item.label
              ? "bg-primary text-on-primary"
              : "text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
    <div className="p-4 border-t border-outline-variant">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center">
          <span className="material-symbols-outlined text-on-secondary-container" style={{ fontSize: "20px" }}>person</span>
        </div>
        <div>
          <p className="text-sm font-bold">Alex Thorne</p>
          <p className="text-xs text-secondary">Senior Editor</p>
        </div>
      </div>
    </div>
  </aside>
);

export default function HandbagsPage() {
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
                  {["Totes", "Satchels", "Clutches", "Crossbody"].map((cat, i) => (
                    <li key={cat}>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input defaultChecked={i === 0} className="border-outline text-primary focus:ring-primary" type="checkbox" />
                        <span className="text-sm font-semibold group-hover:text-primary transition-colors">{cat}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-6">Price</h3>
                <div className="space-y-2">
                  <input className="w-full accent-black bg-surface-container h-1" type="range" />
                  <div className="flex justify-between text-xs text-secondary">
                    <span>$0</span><span>$1500+</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-6">Color</h3>
                <div className="flex flex-wrap gap-3">
                  {["#000000", "#ba1a1a", "#ffffff", "#c7c6c6", "#7e7576"].map((color) => (
                    <button key={color} className="w-8 h-8 border border-outline-variant hover:ring-1 hover:ring-offset-2 hover:ring-primary transition-all" style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
              <button className="w-full py-3 bg-primary text-on-primary text-sm font-semibold uppercase tracking-widest hover:bg-primary-container transition-colors">Apply Filters</button>
            </div>
          </aside>

          {/* PRODUCT GRID */}
          <div className="col-span-9">
            <div className="flex justify-between items-center mb-8">
              <span className="text-xs text-secondary uppercase tracking-wide">Showing 24 of 142 products</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-primary uppercase">Sort by:</span>
                <select className="border-none bg-transparent text-sm font-semibold text-primary focus:ring-0 cursor-pointer outline-none">
                  <option>Newest Arrivals</option>
                  <option>Price: High to Low</option>
                  <option>Price: Low to High</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-x-8 gap-y-16">
              {products.map((product) => (
                <Link href={`/product/${product.id}`} key={product.id} className="group cursor-pointer">
                  <div className="relative aspect-[3/4] overflow-hidden bg-surface-container mb-3">
                    {product.badge && (
                      <span className={`absolute top-4 left-4 z-10 ${product.badgeColor} text-xs font-semibold px-3 py-1 uppercase tracking-tight`}>{product.badge}</span>
                    )}
                    <Image alt={product.name} src={product.img} fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />
                    <div className="absolute bottom-0 left-0 w-full bg-white/90 backdrop-blur-sm py-4 text-center text-sm font-semibold uppercase tracking-widest translate-y-full group-hover:translate-y-0 transition-transform duration-300 hover:bg-primary hover:text-on-primary">
                      Quick View
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-primary mb-1">{product.name}</h4>
                  <div className="flex items-center gap-2">
                    {product.originalPrice && <span className="text-sm text-secondary line-through">{product.originalPrice}</span>}
                    <span className={`text-sm font-semibold ${product.originalPrice ? "text-error" : "text-secondary"}`}>{product.price}</span>
                  </div>
                </Link>
              ))}
            </div>
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

export { AdminNav };
