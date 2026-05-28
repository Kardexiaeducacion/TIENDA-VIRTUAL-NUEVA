import Image from "next/image";

export default function EditorDashboard() {
  return (
    <div className="bg-[#f9f9f9] text-[#1a1c1c] min-h-screen" style={{ fontFamily: "'Manrope', sans-serif" }}>
      {/* SIDE NAV BAR */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-[#f9f9f9] border-r border-[#cfc4c5] flex flex-col z-50">
        <div className="px-4 py-6 border-b border-[#cfc4c5] mb-4">
          <h1 className="text-[32px] font-extrabold leading-tight text-[#000000]">Admin Center</h1>
          <p className="text-[12px] text-[#5e5e5e] mt-1">Manage Cloe Store</p>
        </div>
        <nav className="flex-1 space-y-2 px-2">
          {/* Dashboard Active */}
          <a className="flex items-center gap-3 px-4 py-3 rounded bg-[#000000] text-white font-bold" href="#">
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            <span className="text-[14px] font-semibold tracking-wide">Dashboard</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded text-[#4c4546] hover:bg-[#e8e8e8] transition-all" href="#">
            <span className="material-symbols-outlined text-[20px]">inventory_2</span>
            <span className="text-[14px] font-semibold tracking-wide">Products</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded text-[#4c4546] hover:bg-[#e8e8e8] transition-all" href="#">
            <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
            <span className="text-[14px] font-semibold tracking-wide">Orders</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded text-[#4c4546] hover:bg-[#e8e8e8] transition-all" href="#">
            <span className="material-symbols-outlined text-[20px]">settings</span>
            <span className="text-[14px] font-semibold tracking-wide">Settings</span>
          </a>
        </nav>
        <div className="p-4 border-t border-[#cfc4c5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#e2e2e2] overflow-hidden border border-[#cfc4c5] flex-shrink-0">
              <Image
                alt="User profile"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDE-KKr1Cq7vDBdJKEcZf3gFEgtKYlWiKbN7lOMhafReYdOdy-lMjJu85rPmOkaBvIszT0yJ6a-aoMDdD_4HZQoHsD8o-H7BSP4y4aXZCeOdrwFvTKYrH1ZKHNFy98YPVqwIUkLAhldyTkwr2AI8gWz6u9bAQv6zGvJt18hN0MuWHBm4VeqxUJk4U5NatWt4hOdcBOePpFiXcZ3s3J3q06yes_gKvFeqABacJiyOXbfOSMlYNHc-PjV6qiLjp_U9k8hPsRxl89ots17"
                width={40}
                height={40}
                unoptimized
              />
            </div>
            <div>
              <p className="text-[14px] font-bold">Alex Thorne</p>
              <p className="text-[12px] text-[#5e5e5e]">Senior Editor</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="ml-64 min-h-screen pb-20">
        {/* HEADER / TOP BAR */}
        <header className="h-20 bg-[#f9f9f9] border-b border-[#cfc4c5] flex items-center justify-between px-20 sticky top-0 z-40">
          <div className="flex flex-col">
            <nav className="flex items-center gap-2 mb-1">
              <span className="text-[12px] text-[#5e5e5e]">Control Center</span>
              <span className="material-symbols-outlined text-[12px] text-[#5e5e5e]">chevron_right</span>
              <span className="text-[12px] text-[#000000] font-bold">Dashboard</span>
            </nav>
            <h2 className="text-[32px] font-semibold leading-tight tracking-tight">Global Performance Overview</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 border border-[#7e7576] px-4 py-2 cursor-pointer hover:bg-[#f3f3f3] transition-colors">
              <span className="material-symbols-outlined text-[16px]">calendar_today</span>
              <span className="text-[14px] font-semibold uppercase tracking-wider">Oct 12 - Nov 12, 2024</span>
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </div>
            <button className="bg-[#000000] text-white px-6 py-2.5 text-[14px] font-semibold uppercase tracking-widest hover:bg-[#333] transition-all">
              Export Report
            </button>
          </div>
        </header>

        {/* CONTENT CONTAINER */}
        <div className="max-w-[1440px] w-full mx-auto px-20 pt-20">
          {/* KEY METRICS SECTION */}
          <section className="grid grid-cols-4 gap-8 mb-20">
            {/* Card 1: Revenue */}
            <div className="p-8 border border-[#cfc4c5] bg-white flex flex-col justify-between h-48 hover:border-[#000000] transition-all group">
              <div className="flex items-start justify-between">
                <span className="text-[14px] font-semibold uppercase text-[#5e5e5e] group-hover:text-[#000000] transition-colors">Total Revenue</span>
                <span className="material-symbols-outlined text-[#5e5e5e]">payments</span>
              </div>
              <div>
                <p className="text-[40px] font-extrabold leading-none mb-2">$124,500</p>
                <p className="text-[12px] text-[#000000] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  <span>+12.4% FROM LAST MONTH</span>
                </p>
              </div>
            </div>
            {/* Card 2: Orders */}
            <div className="p-8 border border-[#cfc4c5] bg-white flex flex-col justify-between h-48 hover:border-[#000000] transition-all group">
              <div className="flex items-start justify-between">
                <span className="text-[14px] font-semibold uppercase text-[#5e5e5e] group-hover:text-[#000000] transition-colors">Orders</span>
                <span className="material-symbols-outlined text-[#5e5e5e]">shopping_cart</span>
              </div>
              <div>
                <p className="text-[40px] font-extrabold leading-none mb-2">450</p>
                <p className="text-[12px] text-[#000000] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  <span>+8.2% INCREMENTAL GROWTH</span>
                </p>
              </div>
            </div>
            {/* Card 3: Active Items */}
            <div className="p-8 border border-[#cfc4c5] bg-white flex flex-col justify-between h-48 hover:border-[#000000] transition-all group">
              <div className="flex items-start justify-between">
                <span className="text-[14px] font-semibold uppercase text-[#5e5e5e] group-hover:text-[#000000] transition-colors">Active Items</span>
                <span className="material-symbols-outlined text-[#5e5e5e]">inventory</span>
              </div>
              <div>
                <p className="text-[40px] font-extrabold leading-none mb-2">1,200</p>
                <p className="text-[12px] text-[#5e5e5e]">GLOBAL INVENTORY STATUS</p>
              </div>
            </div>
            {/* Card 4: Q&A Inquiries */}
            <div className="p-8 border border-[#cfc4c5] bg-white flex flex-col justify-between h-48 hover:border-[#000000] transition-all group">
              <div className="flex items-start justify-between">
                <span className="text-[14px] font-semibold uppercase text-[#5e5e5e] group-hover:text-[#000000] transition-colors">Q&A Inquiries</span>
                <span className="material-symbols-outlined text-[#5e5e5e]">forum</span>
              </div>
              <div>
                <p className="text-[40px] font-extrabold leading-none mb-2">12</p>
                <p className="text-[12px] text-[#ba1a1a] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">priority_high</span>
                  <span>3 URGENT RESPONSES NEEDED</span>
                </p>
              </div>
            </div>
          </section>

          {/* PERFORMANCE MATRIX & SALES TABLE */}
          <section className="grid grid-cols-12 gap-8">
            {/* Performance Matrix */}
            <div className="col-span-8 p-8 border border-[#cfc4c5] bg-white h-[440px] flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-[32px] font-semibold leading-tight tracking-tight">Performance Matrix</h3>
                  <p className="text-[16px] text-[#5e5e5e]">Revenue velocity over the last 30 operational days.</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-[#000000] inline-block"></span>
                    <span className="text-[12px] uppercase tracking-tight">Current Period</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 border border-[#7e7576] inline-block"></span>
                    <span className="text-[12px] uppercase tracking-tight text-[#5e5e5e]">Baseline</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 relative flex items-end justify-between px-2 gap-4">
                <div className="absolute inset-0 border-b border-l border-[#cfc4c5]"></div>
                <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none">
                  <div className="border-t border-dashed border-[#cfc4c5] w-full"></div>
                  <div className="border-t border-dashed border-[#cfc4c5] w-full"></div>
                  <div className="border-t border-dashed border-[#cfc4c5] w-full"></div>
                </div>
                <div className="relative flex-1 bg-[#1b1b1b] h-[40%] group transition-all hover:bg-[#000000]"></div>
                <div className="relative flex-1 bg-[#1b1b1b] h-[55%] group transition-all hover:bg-[#000000]"></div>
                <div className="relative flex-1 bg-[#000000] h-[85%] group">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#000000] text-white text-[12px] px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Peak</div>
                </div>
                <div className="relative flex-1 bg-[#1b1b1b] h-[65%] group transition-all hover:bg-[#000000]"></div>
                <div className="relative flex-1 bg-[#1b1b1b] h-[45%] group transition-all hover:bg-[#000000]"></div>
                <div className="relative flex-1 bg-[#1b1b1b] h-[70%] group transition-all hover:bg-[#000000]"></div>
                <div className="relative flex-1 bg-[#1b1b1b] h-[60%] group transition-all hover:bg-[#000000]"></div>
                <div className="relative flex-1 bg-[#1b1b1b] h-[90%] group transition-all hover:bg-[#000000]"></div>
              </div>
            </div>

            {/* Recent Sales Table */}
            <div className="col-span-4 p-8 border border-[#cfc4c5] bg-white h-[440px] flex flex-col">
              <div className="mb-6">
                <h3 className="text-[32px] font-semibold leading-tight">Recent Sales</h3>
                <p className="text-[12px] text-[#5e5e5e] uppercase tracking-widest mt-1">Live Feed</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-[#7e7576] sticky top-0 bg-white">
                    <tr>
                      <th className="pb-3 text-[12px] uppercase text-[#5e5e5e]">Customer</th>
                      <th className="pb-3 text-[12px] uppercase text-[#5e5e5e] text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#cfc4c5]">
                    {[
                      { name: "Julien V.", product: "Silk Handbag • #4592", amount: "$1,240.00" },
                      { name: "Sophia M.", product: "Velvet Pumps • #4591", amount: "$840.00" },
                      { name: "Marcus K.", product: "Cashmere Scarf • #4590", amount: "$320.00" },
                      { name: "Elena R.", product: "Leather Tote • #4589", amount: "$2,100.00" },
                    ].map((row) => (
                      <tr key={row.name} className="group cursor-pointer">
                        <td className="py-4">
                          <p className="text-[14px] font-bold group-hover:text-[#000000] transition-colors">{row.name}</p>
                          <p className="text-[12px] text-[#5e5e5e]">{row.product}</p>
                        </td>
                        <td className="py-4 text-right">
                          <p className="text-[14px] font-bold">{row.amount}</p>
                          <p className="text-[12px] text-[#626262]">Paid</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="w-full mt-6 py-3 border border-[#7e7576] text-[14px] font-semibold uppercase tracking-widest hover:bg-[#eeeeee] transition-colors">
                View All Orders
              </button>
            </div>
          </section>

          {/* TRANSACTION LEDGER */}
          <section className="mt-20">
            <div className="border border-[#cfc4c5] bg-white">
              <div className="px-8 py-6 border-b border-[#7e7576] flex items-center justify-between">
                <h3 className="text-[32px] font-semibold">Transaction Ledger</h3>
                <div className="flex items-center gap-4">
                  <span className="text-[12px] text-[#5e5e5e]">SHOWING 1-10 OF 450</span>
                  <div className="flex border border-[#7e7576]">
                    <button className="px-3 py-1 border-r border-[#7e7576] hover:bg-[#eeeeee] transition-colors">
                      <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    </button>
                    <button className="px-3 py-1 hover:bg-[#eeeeee] transition-colors">
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>
              <table className="w-full text-left">
                <thead className="bg-[#f9f9f9] text-[#5e5e5e] border-b border-[#cfc4c5]">
                  <tr>
                    <th className="px-8 py-4 text-[14px] font-semibold uppercase tracking-wider">Order ID</th>
                    <th className="px-8 py-4 text-[14px] font-semibold uppercase tracking-wider">Customer</th>
                    <th className="px-8 py-4 text-[14px] font-semibold uppercase tracking-wider">Product</th>
                    <th className="px-8 py-4 text-[14px] font-semibold uppercase tracking-wider text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#cfc4c5]">
                  {[
                    { id: "#ORD-CL-9082", customer: "Julien Villard", product: "Midnight Silk Handbag", amount: "$1,240.00", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA9U4ZeD2cO3cs1EdhykwvodamHYI9zUl64wIFBCBPhgb5JQPk0km9vRdXHzIxLoNPmkitkNBkJvUrJBjUv9UqG8FUIejMWl5JbQ1riB2fnuLMCByQtXOhKqMlFAxGlLdbJNj5OdOqjlxg1XYqGIsHGJv7WcZ_Hpn9Ow_LZDDiUowsaU_i2u22jKABT_rNOPEsPwQEr4PXLEecg1EV_qGRp_SKmKiFifZSd4OZyNu0mbBd-NyzMSI1FPYFghGy18kTlPO4jZ5EQgQqE" },
                    { id: "#ORD-CL-9081", customer: "Sophia Moretti", product: "Monogram Velvet Pumps", amount: "$840.00", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDOEwqz-dwbWqmFoZFVEvSDy8ccaxE9RDLITsNvA5MRoECqGVeBrVVqGb7W2yLw088iJ7w2ETxLPtSiW5_Se0SAregb7ZJItlM5nkWavo3bRjTedybesF7XrjGZ6HvObfhAFrOau1Iym0DGbl8D0AG9B2yG8joeBU8dYmNCY1G4slEaTcUBXFx89LL30XmeOPtlyYeuiC0DfALqcIXSFFgHSVP-k7aegMek1XkWO8HiIzsPNXUCRNOq2TkaruMcnH-QdjuS-wHYHOvm" },
                    { id: "#ORD-CL-9080", customer: "Marcus Knight", product: "Heritage Cashmere Scarf", amount: "$320.00", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBxFfdSI_HWlBP4qTqkUiT7tr-3YiBnXsOy7C9C1dprKCegNwzC2KoiXTipkBYwN1s8wna69JWkd-YmQXDQ6-_Rg9XzjaUYfWTadhDQK5kKOXXCROZxe4AsMz8M0aqpROy0MKZA86nb6zKsT-cAA6ylVOMahdHZPLoYqjx6DQvEz3W-7ZFSmp3oe0zRgQ7PP8MFE26H0iDThgYv3gAQObDwNOmo-wwe8fst5_ZbSI3olO2762cKW7C2BSWVmeGnDOGLMAIXW9NYTCrK" },
                  ].map((row) => (
                    <tr key={row.id} className="hover:bg-[#f9f9f9] transition-colors">
                      <td className="px-8 py-5 text-[16px] font-mono">{row.id}</td>
                      <td className="px-8 py-5 text-[16px]">{row.customer}</td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-10 bg-[#e2e2e2] border border-[#cfc4c5] overflow-hidden flex-shrink-0">
                            <Image alt={row.product} className="w-full h-full object-cover" src={row.img} width={32} height={40} unoptimized />
                          </div>
                          <span className="text-[14px] font-semibold">{row.product}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-[14px] font-bold text-right">{row.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="ml-64 bg-[#eeeeee] border-t border-[#cfc4c5] py-20">
        <div className="max-w-[1440px] mx-auto px-20 grid grid-cols-12 gap-8">
          <div className="col-span-4">
            <span className="text-[32px] text-[#000000] font-extrabold uppercase tracking-tighter">Cloe</span>
            <p className="text-[12px] text-[#5e5e5e] mt-4 max-w-xs">
              Proprietary Control Center for inventory management, sales tracking, and global logistics. Access restricted to authorized personnel.
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-[14px] font-bold mb-4">Resources</p>
            <ul className="space-y-2">
              <li><a className="text-[12px] text-[#5e5e5e] hover:text-[#000000] transition-colors" href="#">Documentation</a></li>
              <li><a className="text-[12px] text-[#5e5e5e] hover:text-[#000000] transition-colors" href="#">API Reference</a></li>
              <li><a className="text-[12px] text-[#5e5e5e] hover:text-[#000000] transition-colors" href="#">Security Audit</a></li>
            </ul>
          </div>
          <div className="col-span-2">
            <p className="text-[14px] font-bold mb-4">Support</p>
            <ul className="space-y-2">
              <li><a className="text-[12px] text-[#5e5e5e] hover:text-[#000000] transition-colors" href="#">Help Center</a></li>
              <li><a className="text-[12px] text-[#5e5e5e] hover:text-[#000000] transition-colors" href="#">System Status</a></li>
              <li><a className="text-[12px] text-[#5e5e5e] hover:text-[#000000] transition-colors" href="#">Tech Support</a></li>
            </ul>
          </div>
          <div className="col-span-4 flex flex-col justify-between">
            <div className="flex items-center gap-4 justify-end">
              <span className="material-symbols-outlined text-[#5e5e5e] hover:text-[#000000] cursor-pointer">lock</span>
              <span className="material-symbols-outlined text-[#5e5e5e] hover:text-[#000000] cursor-pointer">notifications</span>
            </div>
            <p className="text-[12px] text-[#5e5e5e] text-right">
              © 2024 Cloe. All rights reserved. System V4.2.1
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
