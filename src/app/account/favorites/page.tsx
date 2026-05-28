import Link from "next/link";
import Image from "next/image";

const wishlist = [
  {
    name: "Cloe x Betty White Satchel", price: "$895.00", color: "White", size: "One Size",
    img: "https://lh3.googleusercontent.com/aida/ADBb0ugnY6c6sM1iHryqO0UA7CrazbWiclbZ-RlI_YnhIKor2qSsgiImvaE01NM0IL3dm0AoQKBOF9ZDh62DPldKSPRlRk9SrGkDCSPzz7NONd_KXompPTaH5Pt0aLxjqYpsbPgEMv6izweYzBrac74Mj-YAWFDM9qCyQK_Bc_noyx5uATDz2H5Cds8SQ6GUPK4rSgTxoB3wdOU6FgbIZx0r4GgqD8KryaLo3xitmEY6Me8VBfG_Y_mT2gKljD4W",
  },
  {
    name: "Modern Top Handle Bag", price: "$495.00", color: "Charcoal", size: "One Size",
    img: "https://lh3.googleusercontent.com/aida/ADBb0uis7azS51WqBjstzhX5o_oLcUldqe_P2_q1GwipjIsmJl3JhP8z76yoGpuJiW1Yp9zNxHaFBW6WdS_EsUvPi5aoOEW1O3-jtdoUQTpO0mJnq13qxcfUj7DsmGfPWw7mizExI8UPOCGwRAkYRQMF2UoP37xqzfISXQoJkuqkzcZqwbo0nmtjy3ZhnjcuDYV4T-ADrESc6jQRgUtkKvxUP8O3Nv52fXFJ9ahezhnegr55uiUKjs85RoDXonlN",
  },
  {
    name: "Luxe Charm Keyring", price: "$45.00", color: "Silver", size: "One Size",
    img: "https://lh3.googleusercontent.com/aida/ADBb0uj_fTD_OOrWfu1JL-xzC26MivraWGMoUPCYuSORArNGFjvViUz6re7pFhmmIjWLsC3Gbsdvd5y7zCChkLy0ZPh5iVJrDAH6zLxTC57wV-SDKXslLLUy3-91RxZAm3cjXfL00Q-2UqbxvwIb_QvVuD1UzVV7Tt8zyPn6dLLBPreVTDrNpeYb_e-n8-fVZpR-zL7FVndZT-DwbIaFcCll-YAEVm5vBZ8vEkXPUBFiuoja3Ra0G643SiPTvW4",
  },
];

export default function FavoritesPage() {
  return (
    <div className="bg-background text-on-background font-sans min-h-screen">
      <header className="fixed top-0 w-full h-20 bg-surface border-b border-outline-variant z-50">
        <div className="max-w-[1440px] mx-auto px-20 h-full flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="text-3xl font-extrabold text-primary uppercase tracking-tighter">Cloe</Link>
            <nav className="hidden md:flex items-center space-x-8">
              {["New Arrivals", "Handbags", "Shoes", "Accessories", "Sale"].map((item) => (
                <Link key={item} href="#" className="text-sm font-semibold text-secondary hover:text-primary transition-colors uppercase tracking-wider">{item}</Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/account" className="material-symbols-outlined text-primary">person</Link>
            <button className="material-symbols-outlined text-primary">favorite</button>
            <div className="relative">
              <button className="material-symbols-outlined text-primary">shopping_cart</button>
              <span className="absolute -top-1 -right-1 bg-primary text-on-primary text-[10px] w-4 h-4 rounded-full flex items-center justify-center">2</span>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-40 pb-20 max-w-[1440px] mx-auto px-20">
        <div className="grid grid-cols-12 gap-8">
          <aside className="col-span-3">
            <div className="sticky top-28 flex flex-col space-y-4">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-primary">Account</h2>
                <p className="text-base text-secondary">Manage your preferences</p>
              </div>
              <nav className="flex flex-col space-y-1">
                {[
                  { label: "Profile Details", icon: "person", href: "/account" },
                  { label: "My Orders", icon: "shopping_bag", href: "/account/orders" },
                  { label: "Wishlist", icon: "favorite", href: "/account/favorites", active: true },
                  { label: "Addresses", icon: "location_on", href: "#" },
                  { label: "Settings", icon: "settings", href: "#" },
                ].map((item) => (
                  <Link key={item.label} href={item.href}
                    className={`flex items-center space-x-3 p-3 text-sm font-semibold transition-all rounded-lg ${
                      item.active ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    <span className="material-symbols-outlined">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          <section className="col-span-9">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-4xl font-bold text-primary">My Wishlist</h1>
              <p className="text-sm text-secondary">{wishlist.length} saved items</p>
            </div>

            <div className="grid grid-cols-3 gap-8">
              {wishlist.map((item) => (
                <div key={item.name} className="group border border-outline-variant bg-surface-container-lowest hover:border-primary transition-colors">
                  <div className="relative aspect-square overflow-hidden bg-surface-container">
                    <Image alt={item.name} src={item.img} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                    <button className="absolute top-4 right-4 w-8 h-8 bg-white/80 flex items-center justify-center hover:bg-white transition-colors">
                      <span className="material-symbols-outlined text-error text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-bold text-primary mb-1 group-hover:underline">{item.name}</h3>
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-sm text-secondary">{item.price}</p>
                      <p className="text-xs text-secondary">{item.color} · {item.size}</p>
                    </div>
                    <button className="w-full py-3 bg-primary text-on-primary text-xs font-semibold uppercase tracking-widest hover:bg-primary-container transition-colors">
                      Add to Bag
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-16 p-12 border-2 border-dashed border-outline-variant rounded-xl bg-surface-container-low text-center">
              <span className="material-symbols-outlined text-5xl text-secondary mb-4 block">explore</span>
              <p className="text-xl text-secondary mb-4">Discover more pieces to love</p>
              <Link href="/handbags" className="inline-block px-8 py-3 bg-primary text-on-primary text-sm font-semibold hover:bg-primary-container transition-all rounded-lg">
                Continue Shopping
              </Link>
            </div>
          </section>
        </div>
      </main>

      <footer className="w-full py-20 bg-surface-container border-t border-outline-variant">
        <div className="max-w-[1440px] mx-auto px-20 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary uppercase tracking-tighter">Cloe</Link>
          <p className="text-sm text-secondary">© 2024 Cloe. All rights reserved.</p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Help"].map((l) => <a key={l} href="#" className="text-sm text-secondary hover:text-primary transition-colors">{l}</a>)}
          </div>
        </div>
      </footer>
    </div>
  );
}
