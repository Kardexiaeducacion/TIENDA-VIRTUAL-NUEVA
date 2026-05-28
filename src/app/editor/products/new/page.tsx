"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const AdminNav = ({ active }: { active: string }) => (
  <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-low border-r border-outline-variant flex flex-col z-50">
    <div className="px-8 mb-10 pt-8">
      <h1 className="text-2xl font-extrabold text-primary tracking-tighter">CLOE</h1>
      <p className="text-xs text-on-surface-variant uppercase tracking-widest mt-1">Management Suite</p>
    </div>
    <nav className="flex-1 px-4 space-y-1">
      {[
        { label: "Dashboard", icon: "dashboard", href: "/editor" },
        { label: "Products", icon: "inventory_2", href: "/editor/products/new" },
        { label: "Orders", icon: "shopping_cart", href: "/editor/orders" },
        { label: "Settings", icon: "settings", href: "/editor/settings" },
      ].map((item) => (
        <Link key={item.label} href={item.href}
          className={`flex items-center gap-3 px-4 py-3 transition-all duration-200 text-sm font-semibold ${
            active === item.label
              ? "text-primary font-bold border-r-2 border-primary bg-surface-container-highest"
              : "text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
    <div className="px-8 mt-auto pb-6 pt-6 border-t border-outline-variant flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container text-xs font-bold">JD</div>
      <div>
        <p className="text-sm font-bold">Admin Profile</p>
        <p className="text-[10px] text-on-surface-variant">Global Manager</p>
      </div>
    </div>
  </aside>
);

export default function NewProductPage() {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [length, setLength] = useState(0);
  const [activeSize, setActiveSize] = useState("S");
  const volumetricWeight = ((width * height * length) / 5000).toFixed(2);

  return (
    <div className="flex min-h-screen bg-surface text-on-surface font-sans">
      <AdminNav active="Products" />

      <main className="ml-64 flex-1 bg-surface">
        {/* HEADER */}
        <header className="h-20 border-b border-outline-variant bg-surface sticky top-0 z-30 px-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/editor" className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary transition-colors">arrow_back</Link>
            <h2 className="text-2xl font-semibold">Create New Product</h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-6 py-2 border border-primary text-sm font-semibold hover:bg-surface-container transition-all">Draft</button>
            <button className="px-6 py-2 bg-primary text-on-primary text-sm font-semibold hover:bg-primary-container transition-all">Publish Product</button>
          </div>
        </header>

        <div className="max-w-[1200px] mx-auto py-20 px-8 space-y-6">
          <form className="grid grid-cols-12 gap-8">
            {/* LEFT COLUMN */}
            <div className="col-span-8 space-y-6">
              {/* GENERAL INFO */}
              <section className="bg-surface-container-lowest p-8 border border-outline-variant">
                <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-6">General Information</h3>
                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-on-surface-variant">Product Name</label>
                    <input className="w-full border border-outline-variant bg-surface p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-base transition-all" placeholder="e.g. Silk Evening Gown 2024" type="text" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-on-surface-variant">Category</label>
                      <select className="w-full border border-outline-variant bg-surface p-3 focus:outline-none focus:border-primary text-base appearance-none">
                        <option>Handbags</option><option>Shoes</option><option>Accessories</option><option>New Arrivals</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-on-surface-variant">Base Price (USD)</label>
                      <input className="w-full border border-outline-variant bg-surface p-3 focus:outline-none focus:border-primary text-base" placeholder="0.00" type="number" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-on-surface-variant">Global Stock</label>
                      <input className="w-full border border-outline-variant bg-surface p-3 focus:outline-none focus:border-primary text-base" placeholder="0" type="number" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-on-surface-variant">Product Description</label>
                    <div className="border border-outline-variant overflow-hidden">
                      <div className="bg-surface-container flex gap-2 p-2 border-b border-outline-variant">
                        {["format_bold", "format_italic", "list", "link"].map((icon) => (
                          <button key={icon} className="p-1 hover:bg-surface-container-highest" type="button">
                            <span className="material-symbols-outlined text-sm">{icon}</span>
                          </button>
                        ))}
                      </div>
                      <textarea className="w-full bg-surface p-4 focus:outline-none text-base" placeholder="Describe the craftsmanship and material heritage..." rows={6} />
                    </div>
                  </div>
                </div>
              </section>

              {/* VARIANTS */}
              <section className="bg-surface-container-lowest p-8 border border-outline-variant">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Variants &amp; Inventory</h3>
                  <button className="flex items-center gap-1 text-xs font-bold text-primary hover:underline" type="button">
                    <span className="material-symbols-outlined text-sm">add</span> Add Variant
                  </button>
                </div>
                <div className="overflow-x-auto border border-outline-variant">
                  <table className="w-full text-left">
                    <thead className="bg-surface-container-high border-b border-outline-variant">
                      <tr>
                        {["Color", "Size", "Stock", "SKU", "Action"].map((h) => (
                          <th key={h} className="p-4 text-xs font-bold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {[
                        { color: "Midnight Black", size: "S", stock: 12, sku: "CL-24-MB-S" },
                        { color: "Midnight Black", size: "M", stock: 8, sku: "CL-24-MB-M" },
                      ].map((row) => (
                        <tr key={row.sku} className="hover:bg-surface transition-colors">
                          <td className="p-4 flex items-center gap-2">
                            <div className="w-4 h-4 bg-black border border-outline" />
                            <span className="text-base">{row.color}</span>
                          </td>
                          <td className="p-4 text-base">{row.size}</td>
                          <td className="p-4">
                            <input className="w-20 border border-outline-variant bg-surface p-1 text-center text-base" defaultValue={row.stock} type="number" />
                          </td>
                          <td className="p-4 text-on-surface-variant font-mono text-xs uppercase">{row.sku}</td>
                          <td className="p-4">
                            <button className="text-on-surface-variant hover:text-error" type="button">
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* SIZING */}
              <section className="bg-surface-container-lowest p-8 border border-outline-variant">
                <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-6">Sizing Detail (cm)</h3>
                <div className="grid grid-cols-4 gap-8">
                  <div className="col-span-1 border-r border-outline-variant pr-6">
                    <p className="text-xs font-bold text-on-surface-variant mb-4 uppercase tracking-tight">Selected Size</p>
                    <div className="space-y-2">
                      {["S", "M", "L"].map((size) => (
                        <button key={size} onClick={() => setActiveSize(size)} type="button"
                          className={`w-full text-left p-3 text-sm font-semibold transition-colors ${activeSize === size ? "bg-primary text-on-primary" : "hover:bg-surface-container"}`}
                        >
                          Size {size === "S" ? "Small" : size === "M" ? "Medium" : "Large"} ({size})
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-3 grid grid-cols-3 gap-6">
                    {["Chest (Pecho)", "Waist (Cintura)", "Hips (Cadera)"].map((label) => (
                      <div key={label} className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-on-surface-variant">{label}</label>
                        <input className="w-full border border-outline-variant bg-surface p-3 text-base" placeholder="0.0" type="number" />
                      </div>
                    ))}
                    <div className="col-span-3 mt-4">
                      <div className="border border-dashed border-outline-variant p-10 flex flex-col items-center justify-center bg-surface cursor-pointer hover:bg-surface-container-low transition-colors">
                        <span className="material-symbols-outlined text-4xl mb-2 text-on-surface-variant">straighten</span>
                        <p className="text-sm font-bold">Upload Visual Size Guide</p>
                        <p className="text-xs text-on-surface-variant">PDF, JPG or PNG (Max 5MB)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN */}
            <div className="col-span-4 space-y-6">
              {/* GALLERY */}
              <section className="bg-surface-container-lowest p-8 border border-outline-variant">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Product Gallery</h3>
                  <span className="text-xs text-on-surface-variant">0/15 Images</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="aspect-square border border-dashed border-outline-variant flex items-center justify-center bg-surface cursor-pointer hover:border-primary group transition-all">
                    <span className="material-symbols-outlined group-hover:scale-110 transition-transform">add_a_photo</span>
                  </div>
                  <div className="aspect-square bg-surface-variant border border-outline-variant relative overflow-hidden group">
                    <Image alt="Product" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWdSmFrbnlxiBB02he1u08J50_7gFNGik3BKAJ05OkQ6tE11FEfSBCKWECrrroOf3N2nCafvQ_G5WUcCk-YUsv-SRYghEMdlAdIPL7Q2PL3M5eno17aBWxiSGx9kZcJiDPdZ5H57-GJIKMs6Q2bkGD0rO7_VEI8h5kdVujFtc477xiCYnlSACzQAJTvT5a_UJZYsqVfWSFSxQrBpvMvJLUytEZ1WXJHuAeTJkTGgTM6fpRbqSZIqRBi_ijDCGBbzDGP_CovqN-fYCd" fill className="object-cover grayscale" unoptimized />
                  </div>
                  {[...Array(4)].map((_, i) => <div key={i} className="aspect-square bg-surface-variant border border-outline-variant" />)}
                </div>
                <p className="text-xs text-on-surface-variant mt-4 leading-relaxed">Drag to reorder. First image is primary cover.</p>
              </section>

              {/* VOLUMETRIC WEIGHT */}
              <section className="bg-surface-container-lowest p-8 border border-outline-variant">
                <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-6">Volumetric Weight Calculator</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-on-surface-variant">Width (cm)</label>
                      <input className="border border-outline-variant p-2 text-base" placeholder="0" type="number" onChange={(e) => setWidth(Number(e.target.value))} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-on-surface-variant">Height (cm)</label>
                      <input className="border border-outline-variant p-2 text-base" placeholder="0" type="number" onChange={(e) => setHeight(Number(e.target.value))} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-on-surface-variant">Length (cm)</label>
                    <input className="border border-outline-variant p-2 text-base" placeholder="0" type="number" onChange={(e) => setLength(Number(e.target.value))} />
                  </div>
                  <div className="mt-6 pt-6 border-t border-outline-variant">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs font-bold uppercase text-on-surface-variant">Calculated Weight</p>
                        <p className="text-2xl font-bold">{volumetricWeight} kg</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-on-surface-variant">Indeli Ind. Standard</p>
                        <p className="text-[10px] text-on-surface-variant">Factor: 5000</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* INVENTORY SETTINGS */}
              <section className="bg-surface-container-lowest p-8 border border-outline-variant">
                <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Inventory Settings</h3>
                <div className="space-y-4">
                  {["Track global inventory", "Allow backorders", "Taxable product"].map((label) => (
                    <label key={label} className="flex items-center gap-3 cursor-pointer">
                      <input className="w-4 h-4 border-primary text-primary focus:ring-0" type="checkbox" />
                      <span className="text-base">{label}</span>
                    </label>
                  ))}
                </div>
              </section>
            </div>
          </form>
        </div>

        {/* FOOTER */}
        <footer className="mt-20 border-t border-outline-variant bg-surface py-20 px-20">
          <div className="grid grid-cols-4 gap-8">
            <div className="col-span-2">
              <h4 className="text-2xl font-extrabold tracking-tighter text-primary mb-4">CLOE</h4>
              <p className="text-base text-on-surface-variant max-w-sm">Authority in luxury commerce management. Precision-built for the modern fashion ecosystem.</p>
              <p className="text-xs text-on-surface-variant mt-8 uppercase tracking-widest">© 2024 CLOE Luxury E-commerce. All rights reserved.</p>
            </div>
            {[
              { title: "Resources", links: ["Support", "Shipping", "Privacy Policy"] },
              { title: "System", links: ["Terms of Service", "Newsletter"] },
            ].map((col) => (
              <div key={col.title} className="flex flex-col gap-4">
                <span className="text-xs font-bold uppercase tracking-widest">{col.title}</span>
                {col.links.map((l) => <a key={l} href="#" className="text-xs text-on-surface-variant hover:text-primary transition-all">{l}</a>)}
              </div>
            ))}
          </div>
        </footer>
      </main>
    </div>
  );
}
