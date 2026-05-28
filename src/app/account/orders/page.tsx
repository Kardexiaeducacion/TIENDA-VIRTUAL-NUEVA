import Link from "next/link";
import Image from "next/image";

const AccountNav = ({ active }: { active: string }) => (
  <div className="sticky top-28 flex flex-col space-y-4">
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-primary">Account</h2>
      <p className="text-base text-secondary">Manage your preferences</p>
    </div>
    <nav className="flex flex-col space-y-1">
      {[
        { label: "Profile Details", icon: "person", href: "/account" },
        { label: "My Orders", icon: "shopping_bag", href: "/account/orders" },
        { label: "Wishlist", icon: "favorite", href: "/account/favorites" },
        { label: "Addresses", icon: "location_on", href: "#" },
        { label: "Settings", icon: "settings", href: "#" },
      ].map((item) => (
        <Link key={item.label} href={item.href}
          className={`flex items-center space-x-3 p-3 text-sm font-semibold transition-all ${
            active === item.label ? "bg-primary text-on-primary rounded-lg" : "text-on-surface-variant hover:bg-surface-container-high rounded-lg"
          }`}
        >
          <span className="material-symbols-outlined">{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
    <div className="pt-6">
      <button className="flex items-center space-x-3 p-3 text-error text-sm font-semibold hover:bg-error-container/10 transition-colors w-full rounded-lg">
        <span className="material-symbols-outlined">logout</span>
        <span>Sign Out</span>
      </button>
    </div>
  </div>
);

const orders = [
  {
    date: "Oct 12, 2023", total: "$1,240.00", id: "CLO-882194",
    status: "Delivered", statusStyle: "bg-green-100 text-green-800",
    statusIcon: "check_circle",
    product: "Iconic Heritage Tote",
    description: "Italian-crafted grain leather tote with signature gold-plated hardware and detachable strap.",
    color: "Obsidian Black", size: "Medium", price: "$1,240.00",
    actions: ["View Invoice", "Reorder"],
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBth0OZ3Ma9mcUc3Z_yl4rg0EbBNFEeAnG1VxN-WlZ3mmjobZAwwmwYZ4m6CZ0m2ef7H1oW6tsAnEq05D4K4-ydV6jKjV0nUymx_zKQEi_EYz2jTgFchen7l8-9dnDcif3BnRV1j2CvAD5hKmScCLzh0YvZchRQhGkpb-hWgX4Ymt1evxC3YGbsu2pP4EIF-68vDCcwUDSMpuM-gx2Jl1lphoA8H9Fo8URU902_WXOFMXDJfNo_cqy7c_yQyYQW7rM4FRpH82zqmiGn",
  },
  {
    date: "Nov 04, 2023", total: "$450.00", id: "CLO-900341",
    status: "In Transit", statusStyle: "bg-blue-100 text-blue-800",
    statusIcon: "local_shipping",
    product: "Velvet Point Pumps",
    description: "Sophisticated 85mm stiletto pumps featuring a tapered toe and cushioned silk-lined interior.",
    color: "Midnight Navy", size: "38 EU", price: "$450.00",
    actions: ["Track Package", "Order Details"],
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDRjT4eAGcLH_FiDA-paFC-tjSr32NcDgHkqG54HFsVHymOamLzGhCK38BBNrccWxIFCzoP8IRFHYO6hswHvftPhKy409-lRnic2lYZM6VgAf3o95dIZ8dQzI--m7wBUudF94pMZZXiZ0waof0qsBjDxv4dz6s_q06e4YPSQSctaYcTzEfF3ObRTkNVjSEqKrgU3Eo5BygWox3tVb_n3IhzFLixosaWReY-2Qyyi_XDc8034KSsQlj9riHrP_UxKJHNPLDFB0t8jHgl",
  },
  {
    date: "Sep 15, 2023", total: "$85.00", id: "CLO-775612",
    status: "Returned", statusStyle: "bg-red-100 text-red-800",
    statusIcon: "keyboard_return",
    product: "Solid Gold Link Necklace",
    description: "14k gold-plated recycled brass chain with a minimalist toggle clasp closure.",
    color: "Gold", size: "18 inch", price: "$85.00",
    actions: ["Return Policy", "Reorder"],
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCsa3g_Yl2MIh6Jvg97L3HTv0ASnCEv1zfJ-5m4HwZKOhwlJgX4FTxFsIMLyX0prw3kDVapYs6No8KYwffrh6hiM-YhinhGtb57p7DVW3bIZK7cy6oxnq5Qxn-3XKcWXVVrIwY1KrNp1ZqrKMW3qAyooXTepcfPli6a0OlL_0FnB1nBaPyzAD3wViOhCZCASfDlojTzZuA-oS7e0hf_3Ny36leU7Y9xUFg8uqC5s_MpxeL_MQ4a9YpRXWvxCQi4L07E3W3c6u2wWn3c",
  },
];

export default function MyOrdersPage() {
  return (
    <div className="bg-background text-on-background font-sans">
      {/* NAV */}
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
          {/* ACCOUNT SIDEBAR */}
          <aside className="col-span-3">
            <AccountNav active="My Orders" />
          </aside>

          {/* ORDERS SECTION */}
          <section className="col-span-9">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-4xl font-bold text-primary">Order History</h1>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input className="pl-10 pr-4 py-2 border border-outline-variant bg-surface rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-base w-64" placeholder="Search orders..." type="text" />
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary">search</span>
                </div>
                <button className="flex items-center space-x-2 border border-outline-variant px-4 py-2 rounded-lg hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined">filter_list</span>
                  <span className="text-sm font-semibold">Filter</span>
                </button>
              </div>
            </div>

            {orders.map((order) => (
              <div key={order.id} className={`bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden mb-6 hover:shadow-sm transition-shadow ${order.status === "Returned" ? "opacity-80" : ""}`}>
                <div className="bg-surface-container px-6 py-4 flex items-center justify-between border-b border-outline-variant">
                  <div className="flex items-center space-x-12">
                    {[
                      { label: "Order Placed", value: order.date },
                      { label: "Total Amount", value: order.total },
                      { label: "Order #", value: order.id },
                    ].map((info) => (
                      <div key={info.label}>
                        <p className="text-xs text-secondary uppercase font-semibold">{info.label}</p>
                        <p className="text-sm font-semibold">{info.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className={`flex items-center ${order.statusStyle} px-3 py-1 rounded-full space-x-1`}>
                    <span className="material-symbols-outlined text-[16px]">{order.statusIcon}</span>
                    <span className="text-sm font-semibold">{order.status}</span>
                  </div>
                </div>
                <div className="p-6 flex items-start justify-between">
                  <div className="flex space-x-6">
                    <div className="relative w-32 h-32 flex-shrink-0">
                      <Image alt={order.product} src={order.img} fill className="object-cover border border-outline-variant rounded-lg" unoptimized />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h3 className="text-lg font-bold text-primary">{order.product}</h3>
                      <p className="text-base text-secondary mt-1 max-w-md leading-relaxed">{order.description}</p>
                      <div className="mt-4 flex space-x-6">
                        <p className="text-sm font-semibold text-primary"><span className="text-secondary font-normal">Color:</span> {order.color}</p>
                        <p className="text-sm font-semibold text-primary"><span className="text-secondary font-normal">Size:</span> {order.size}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-4">
                    <p className="text-xl font-bold">{order.price}</p>
                    <div className="flex space-x-3">
                      <button className="px-6 py-2 border border-primary text-primary text-sm font-semibold hover:bg-surface transition-colors rounded-lg">{order.actions[0]}</button>
                      <button className="px-6 py-2 bg-primary text-on-primary text-sm font-semibold hover:bg-primary-container transition-all rounded-lg">{order.actions[1]}</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* CONTINUE SHOPPING */}
            <div className="mt-12 text-center p-12 border-2 border-dashed border-outline-variant rounded-xl bg-surface-container-low">
              <p className="text-xl text-secondary mb-4">Looking for something else?</p>
              <Link href="/handbags" className="inline-block px-8 py-3 bg-primary text-on-primary text-sm font-semibold hover:bg-primary-container transition-all rounded-lg">
                Continue Shopping
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full py-20 bg-surface-container border-t border-outline-variant">
        <div className="max-w-[1440px] mx-auto px-20 grid grid-cols-12 gap-8">
          <div className="col-span-4 flex flex-col space-y-6">
            <Link href="/" className="text-3xl font-bold text-primary uppercase tracking-tighter">Cloe</Link>
            <p className="text-base text-secondary max-w-xs leading-relaxed">Curating high-end essentials for the modern wardrobe with an unwavering commitment to quality and timeless design.</p>
          </div>
          {[
            { title: "Shop", links: ["New Arrivals", "Best Sellers", "Collection", "Sale"] },
            { title: "Support", links: ["Help Center", "Shipping", "Returns", "Contact"] },
          ].map((col) => (
            <div key={col.title} className="col-span-2 flex flex-col space-y-4">
              <h4 className="text-sm font-semibold text-primary uppercase">{col.title}</h4>
              <nav className="flex flex-col space-y-2">
                {col.links.map((l) => <a key={l} href="#" className="text-sm text-secondary hover:text-primary transition-colors">{l}</a>)}
              </nav>
            </div>
          ))}
          <div className="col-span-4 flex flex-col space-y-4">
            <h4 className="text-sm font-semibold text-primary uppercase">Newsletter</h4>
            <p className="text-base text-secondary">Join our circle for exclusive early access and updates.</p>
            <form className="flex space-x-2">
              <input className="flex-grow border-b-2 border-primary bg-transparent py-2 focus:outline-none text-base" placeholder="email@example.com" type="email" />
              <button className="text-sm font-semibold text-primary border-b-2 border-primary py-2 hover:opacity-70 transition-opacity" type="submit">Subscribe</button>
            </form>
          </div>
          <div className="col-span-12 pt-6 flex flex-col md:flex-row items-center justify-between border-t border-outline-variant">
            <p className="text-sm text-secondary">© 2024 Cloe. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              {["Privacy", "Terms", "Accessibility"].map((l) => <a key={l} href="#" className="text-sm text-secondary hover:text-primary">{l}</a>)}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
