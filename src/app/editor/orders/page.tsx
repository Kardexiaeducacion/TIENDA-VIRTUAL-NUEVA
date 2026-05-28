import Link from "next/link";
import Image from "next/image";

const orders = [
  { id: "#ORD-88219", customer: "Isabella Sterling", date: "Oct 24, 2024", status: "Shipped", statusStyle: "bg-secondary-container text-on-secondary-container", amount: "$1,240.00" },
  { id: "#ORD-88218", customer: "Marcus Vane", date: "Oct 24, 2024", status: "Pending", statusStyle: "bg-tertiary-container text-on-tertiary", amount: "$450.50" },
  { id: "#ORD-88217", customer: "Sofia Loren", date: "Oct 23, 2024", status: "Delivered", statusStyle: "bg-surface-container-highest text-on-background", amount: "$3,100.00" },
  { id: "#ORD-88216", customer: "Julian Pierce", date: "Oct 23, 2024", status: "Shipped", statusStyle: "bg-secondary-container text-on-secondary-container", amount: "$890.00" },
  { id: "#ORD-88215", customer: "Elena Rossi", date: "Oct 22, 2024", status: "Delivered", statusStyle: "bg-surface-container-highest text-on-background", amount: "$2,450.00" },
  { id: "#ORD-88214", customer: "Dominic Thorne", date: "Oct 22, 2024", status: "Canceled", statusStyle: "bg-error-container text-on-error-container", amount: "$120.00" },
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
        <Link key={item.label} href={item.href}
          className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-semibold transition-all ${
            active === item.label ? "bg-primary text-on-primary font-bold" : "text-on-surface-variant hover:bg-surface-container-high"
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
          <p className="text-sm font-bold">Alex Chen</p>
          <p className="text-xs text-secondary">Store Manager</p>
        </div>
      </div>
    </div>
  </aside>
);

export default function OrdersPage() {
  return (
    <div className="bg-background text-on-background min-h-screen flex font-sans">
      <AdminNav active="Orders" />
      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* HEADER */}
        <header className="h-20 bg-surface border-b border-outline-variant flex items-center justify-between px-20 sticky top-0 z-40">
          <div className="flex items-center gap-8">
            <h2 className="text-2xl font-bold text-primary uppercase tracking-tighter">Orders</h2>
            <div className="hidden md:flex relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary" style={{ fontSize: "20px" }}>search</span>
              <input className="pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant w-80 focus:outline-none focus:border-primary text-base" placeholder="Search orders, customers..." type="text" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 text-sm font-semibold text-secondary hover:text-primary transition-colors">
              <span className="material-symbols-outlined">filter_list</span>
              <span>Filters</span>
            </button>
            <button className="bg-primary text-on-primary px-6 py-2.5 text-sm font-semibold hover:bg-primary-container transition-all">Export CSV</button>
          </div>
        </header>

        <div className="flex-1 max-w-[1440px] mx-auto w-full px-20 py-12">
          {/* FILTER TABS */}
          <section className="grid grid-cols-12 gap-8 mb-6">
            <div className="col-span-8 flex items-center gap-4 border-b border-outline-variant pb-2">
              {["All Orders", "Pending", "Shipped", "Delivered"].map((tab, i) => (
                <button key={tab} className={`text-sm font-semibold px-4 py-2 transition-colors ${i === 0 ? "border-b-2 border-primary text-primary" : "text-secondary hover:text-primary"}`}>{tab}</button>
              ))}
            </div>
            <div className="col-span-4 flex items-center justify-end">
              <div className="flex items-center gap-2 border border-outline-variant px-3 py-2 bg-surface-container-lowest">
                <span className="material-symbols-outlined text-secondary" style={{ fontSize: "18px" }}>calendar_today</span>
                <span className="text-xs font-semibold">Oct 01 - Oct 31, 2024</span>
              </div>
            </div>
          </section>

          {/* ORDERS TABLE */}
          <div className="bg-surface-container-lowest border border-outline-variant">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container border-b border-outline-variant">
                  {["Order ID", "Customer Name", "Date", "Status", "Total Amount", "Actions"].map((h, i) => (
                    <th key={h} className={`px-6 py-4 text-sm font-semibold text-primary uppercase tracking-wider ${i === 5 ? "text-right" : ""}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-base">
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-5 font-bold">{order.id}</td>
                    <td className="px-6 py-5">{order.customer}</td>
                    <td className="px-6 py-5 text-secondary">{order.date}</td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${order.statusStyle}`}>{order.status}</span>
                    </td>
                    <td className="px-6 py-5 font-bold">{order.amount}</td>
                    <td className="px-6 py-5 text-right">
                      <button className="border border-primary px-4 py-1.5 text-xs font-semibold hover:bg-primary hover:text-on-primary transition-all">Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* PAGINATION */}
            <div className="px-6 py-4 bg-surface-container border-t border-outline-variant flex items-center justify-between">
              <p className="text-xs text-secondary">Showing 1 to 6 of 1,248 orders</p>
              <div className="flex items-center gap-2">
                <button className="p-2 text-secondary opacity-30" disabled><span className="material-symbols-outlined">chevron_left</span></button>
                {[1, 2, 3].map((n) => (
                  <button key={n} className={`w-8 h-8 flex items-center justify-center text-sm font-semibold ${n === 1 ? "bg-primary text-on-primary" : "text-secondary hover:text-primary"}`}>{n}</button>
                ))}
                <span className="text-secondary mx-1">...</span>
                <button className="w-8 h-8 flex items-center justify-center text-sm font-semibold text-secondary hover:text-primary">208</button>
                <button className="p-2 text-secondary hover:text-primary"><span className="material-symbols-outlined">chevron_right</span></button>
              </div>
            </div>
          </div>

          {/* INSIGHT CARDS */}
          <section className="grid grid-cols-12 gap-8 mt-20">
            <div className="col-span-4 p-8 border border-outline-variant bg-surface-container-low flex flex-col justify-between h-64">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-secondary mb-2">Total Volume</p>
                <h3 className="text-5xl font-bold text-primary">$482k</h3>
              </div>
              <p className="text-base text-secondary">+12.4% from last month</p>
            </div>
            <div className="col-span-4 relative group overflow-hidden h-64 border border-outline-variant">
              <Image alt="Order processing" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbLZF699osRLLNuQ3lt2A3caWvhje95BLDUJIICmOLc2oiUEpxaToHntCxgVXA42QdTYah_Z91f1QNy2j8aimvxm4sNGzbeUyM9mmd2_3JFT5vHv4tlzL7AJem_vM5Up5MuzFFLs8SdDjmjXkPwXomNlvThhGC4hvvGhDcyhX5Xz6T_kyAlQv7C4OFVBJx2ly_LK9H-G1SZ3Mrjtat7z4njgQdt1pSOd7F_oaFbP-Ov-eMD37FSvVppG3xUECTaHAKTgdprZ7Hp3HZ" fill className="object-cover grayscale group-hover:scale-105 transition-transform duration-700" unoptimized />
              <div className="absolute inset-0 bg-primary/40 flex items-end p-8">
                <div className="text-on-primary">
                  <p className="text-xs font-bold uppercase">Logistics Insight</p>
                  <h3 className="text-2xl font-semibold leading-tight">Avg. Delivery Time: 2.4 Days</h3>
                </div>
              </div>
            </div>
            <div className="col-span-4 p-8 border border-outline-variant bg-primary text-on-primary flex flex-col justify-between h-64">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-2">Active Shipments</p>
                <h3 className="text-5xl font-bold">142</h3>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <span className="material-symbols-outlined">local_shipping</span>
                <span>Track all carriers</span>
              </div>
            </div>
          </section>
        </div>

        {/* FOOTER */}
        <footer className="bg-surface-container border-t border-outline-variant w-full py-20 mt-auto">
          <div className="max-w-[1440px] mx-auto px-20 grid grid-cols-12 gap-8">
            <div className="col-span-4">
              <h2 className="text-3xl font-bold text-primary uppercase tracking-tighter mb-4">Cloe</h2>
              <p className="text-xs text-secondary">High-end administrative interface for the modern luxury retail ecosystem.</p>
            </div>
            {[
              { title: "Resources", links: ["Help Center", "API Docs", "System Status"] },
              { title: "Company", links: ["Privacy", "Terms", "Contact"] },
            ].map((col) => (
              <div key={col.title} className="col-span-2 col-start-auto">
                <h4 className="text-sm font-semibold mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((l) => <li key={l}><a href="#" className="text-xs text-secondary hover:text-primary transition-colors">{l}</a></li>)}
                </ul>
              </div>
            ))}
            <div className="col-span-12 mt-12 pt-8 border-t border-outline-variant flex justify-between items-center">
              <p className="text-xs text-secondary">© 2024 Cloe. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
