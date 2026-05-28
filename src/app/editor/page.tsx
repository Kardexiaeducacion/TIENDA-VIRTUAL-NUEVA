export default function EditorDashboard() {
  return (
    <div className="bg-background text-on-background selection:bg-primary selection:text-on-primary flex min-h-screen">
      {/* SIDE NAV BAR */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-surface dark:bg-background border-r border-outline-variant dark:border-outline flex flex-col p-stack-sm space-y-stack-sm z-50">
        <div className="px-4 py-6 border-b border-outline-variant mb-4">
          <h1 className="font-headline-md text-headline-md font-bold text-primary">Admin Center</h1>
          <p className="font-label-sm text-label-sm text-secondary">Manage Cloe Store</p>
        </div>
        <nav className="flex-1 space-y-2">
          {/* Dashboard Active */}
          <a className="flex items-center gap-3 px-4 py-3 rounded bg-primary text-on-primary font-bold ease-in-out duration-200" href="#">
            <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
            <span className="font-label-md text-label-md">Dashboard</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded text-on-surface-variant hover:bg-surface-container-high transition-all ease-in-out duration-200" href="#">
            <span className="material-symbols-outlined" data-icon="inventory_2">inventory_2</span>
            <span className="font-label-md text-label-md">Products</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded text-on-surface-variant hover:bg-surface-container-high transition-all ease-in-out duration-200" href="#">
            <span className="material-symbols-outlined" data-icon="shopping_bag">shopping_bag</span>
            <span className="font-label-md text-label-md">Orders</span>
          </a>
          <a className="flex items-center gap-3 px-4 py-3 rounded text-on-surface-variant hover:bg-surface-container-high transition-all ease-in-out duration-200" href="#">
            <span className="material-symbols-outlined" data-icon="settings">settings</span>
            <span className="font-label-md text-label-md">Settings</span>
          </a>
        </nav>
        <div className="p-4 border-t border-outline-variant">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant">
              <img alt="User profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDE-KKr1Cq7vDBdJKEcZf3gFEgtKYlWiKbN7lOMhafReYdOdy-lMjJu85rPmOkaBvIszT0yJ6a-aoMDdD_4HZQoHsD8o-H7BSP4y4aXZCeOdrwFvTKYrH1ZKHNFy98YPVqwIUkLAhldyTkwr2AI8gWz6u9bAQv6zGvJt18hN0MuWHBm4VeqxUJk4U5NatWt4hOdcBOePpFiXcZ3s3J3q06yes_gKvFeqABacJiyOXbfOSMlYNHc-PjV6qiLjp_U9k8hPsRxl89ots17"/>
            </div>
            <div>
              <p className="font-label-md text-label-md font-bold">Alex Thorne</p>
              <p className="font-label-sm text-label-sm text-secondary">Senior Editor</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="ml-64 w-full min-h-screen pb-stack-xl flex flex-col">
        {/* HEADER / TOP BAR */}
        <header className="h-20 bg-surface border-b border-outline-variant flex items-center justify-between px-margin-desktop sticky top-0 z-40">
          <div className="flex flex-col">
            <nav className="flex items-center gap-2 mb-1">
              <span className="font-label-sm text-label-sm text-secondary">Control Center</span>
              <span className="material-symbols-outlined text-[12px] text-secondary">chevron_right</span>
              <span className="font-label-sm text-label-sm text-primary font-bold">Dashboard</span>
            </nav>
            <h2 className="font-headline-md text-headline-md leading-none">Global Performance Overview</h2>
          </div>
          <div className="flex items-center gap-stack-md">
            <div className="flex items-center gap-2 border border-outline px-4 py-2 hover:bg-surface-container-low transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-body-md" data-icon="calendar_today">calendar_today</span>
              <span className="font-label-md text-label-md uppercase tracking-wider">Oct 12 - Nov 12, 2024</span>
              <span className="material-symbols-outlined text-body-md" data-icon="expand_more">expand_more</span>
            </div>
            <button className="bg-primary text-on-primary px-6 py-2.5 font-label-md text-label-md uppercase tracking-widest hover:bg-opacity-90 transition-all">
              Export Report
            </button>
          </div>
        </header>

        {/* CONTENT CONTAINER */}
        <div className="max-w-[1440px] w-full mx-auto px-margin-desktop pt-stack-xl flex-1">
          {/* KEY METRICS SECTION */}
          <section className="grid grid-cols-12 gap-gutter-desktop mb-stack-xl">
            {/* Card 1: Revenue */}
            <div className="col-span-3 p-8 border border-outline-variant bg-surface-container-lowest flex flex-col justify-between h-48 transition-all hover:border-primary group">
              <div className="flex items-start justify-between">
                <span className="font-label-md text-label-md uppercase text-secondary group-hover:text-primary transition-colors">Total Revenue</span>
                <span className="material-symbols-outlined text-secondary" data-icon="payments">payments</span>
              </div>
              <div>
                <p className="font-display-lg text-[40px] font-extrabold leading-none mb-2">$124,500</p>
                <p className="font-label-sm text-label-sm text-primary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]" data-icon="trending_up">trending_up</span>
                  <span>+12.4% FROM LAST MONTH</span>
                </p>
              </div>
            </div>
            {/* Card 2: Orders */}
            <div className="col-span-3 p-8 border border-outline-variant bg-surface-container-lowest flex flex-col justify-between h-48 transition-all hover:border-primary group">
              <div className="flex items-start justify-between">
                <span className="font-label-md text-label-md uppercase text-secondary group-hover:text-primary transition-colors">Orders</span>
                <span className="material-symbols-outlined text-secondary" data-icon="shopping_cart">shopping_cart</span>
              </div>
              <div>
                <p className="font-display-lg text-[40px] font-extrabold leading-none mb-2">450</p>
                <p className="font-label-sm text-label-sm text-primary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]" data-icon="trending_up">trending_up</span>
                  <span>+8.2% INCREMENTAL GROWTH</span>
                </p>
              </div>
            </div>
            {/* Card 3: Active Items */}
            <div className="col-span-3 p-8 border border-outline-variant bg-surface-container-lowest flex flex-col justify-between h-48 transition-all hover:border-primary group">
              <div className="flex items-start justify-between">
                <span className="font-label-md text-label-md uppercase text-secondary group-hover:text-primary transition-colors">Active Items</span>
                <span className="material-symbols-outlined text-secondary" data-icon="inventory">inventory</span>
              </div>
              <div>
                <p className="font-display-lg text-[40px] font-extrabold leading-none mb-2">1,200</p>
                <p className="font-label-sm text-label-sm text-secondary">GLOBAL INVENTORY STATUS</p>
              </div>
            </div>
            {/* Card 4: Q&A Inquiries */}
            <div className="col-span-3 p-8 border border-outline-variant bg-surface-container-lowest flex flex-col justify-between h-48 transition-all hover:border-primary group">
              <div className="flex items-start justify-between">
                <span className="font-label-md text-label-md uppercase text-secondary group-hover:text-primary transition-colors">Q&amp;A Inquiries</span>
                <span className="material-symbols-outlined text-secondary" data-icon="forum">forum</span>
              </div>
              <div>
                <p className="font-display-lg text-[40px] font-extrabold leading-none mb-2">12</p>
                <p className="font-label-sm text-label-sm text-error flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]" data-icon="priority_high">priority_high</span>
                  <span>3 URGENT RESPONSES NEEDED</span>
                </p>
              </div>
            </div>
          </section>

          {/* PERFORMANCE MATRIX & SALES TABLE */}
          <section className="grid grid-cols-12 gap-gutter-desktop">
            {/* Performance Matrix (Visual Placeholder) */}
            <div className="col-span-8 p-8 border border-outline-variant bg-surface-container-lowest h-[440px] flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-headline-md text-headline-md leading-tight">Performance Matrix</h3>
                  <p className="font-body-md text-body-md text-secondary">Revenue velocity over the last 30 operational days.</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-primary"></span>
                    <span className="font-label-sm text-label-sm uppercase tracking-tighter">Current Period</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 border border-outline"></span>
                    <span className="font-label-sm text-label-sm uppercase tracking-tighter text-secondary">Baseline</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 relative flex items-end justify-between px-2 gap-4">
                {/* Simulated Line Chart via CSS & divs for high-end look */}
                <div className="absolute inset-0 border-b border-l border-outline-variant"></div>
                {/* Chart Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none">
                  <div className="border-t border-dashed border-outline-variant w-full"></div>
                  <div className="border-t border-dashed border-outline-variant w-full"></div>
                  <div className="border-t border-dashed border-outline-variant w-full"></div>
                </div>
                {/* Visual representation bars (Editorial style) */}
                <div className="relative flex-1 bg-primary-container h-[40%] group transition-all hover:bg-primary"></div>
                <div className="relative flex-1 bg-primary-container h-[55%] group transition-all hover:bg-primary"></div>
                <div className="relative flex-1 bg-primary h-[85%] group">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-primary text-on-primary font-label-sm px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">Peak</div>
                </div>
                <div className="relative flex-1 bg-primary-container h-[65%] group transition-all hover:bg-primary"></div>
                <div className="relative flex-1 bg-primary-container h-[45%] group transition-all hover:bg-primary"></div>
                <div className="relative flex-1 bg-primary-container h-[70%] group transition-all hover:bg-primary"></div>
                <div className="relative flex-1 bg-primary-container h-[60%] group transition-all hover:bg-primary"></div>
                <div className="relative flex-1 bg-primary-container h-[90%] group transition-all hover:bg-primary"></div>
              </div>
            </div>

            {/* Recent Sales Table */}
            <div className="col-span-4 p-8 border border-outline-variant bg-surface-container-lowest h-[440px] flex flex-col">
              <div className="mb-6">
                <h3 className="font-headline-md text-headline-md leading-tight">Recent Sales</h3>
                <p className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mt-1">Live Feed</p>
              </div>
              <div className="flex-1 overflow-y-auto hide-scrollbar">
                <table className="w-full text-left">
                  <thead className="border-b border-outline sticky top-0 bg-surface-container-lowest">
                    <tr>
                      <th className="pb-3 font-label-sm text-label-sm uppercase text-secondary">Customer</th>
                      <th className="pb-3 font-label-sm text-label-sm uppercase text-secondary text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    <tr className="group cursor-pointer">
                      <td className="py-4">
                        <p className="font-label-md text-label-md font-bold group-hover:text-primary transition-colors">Julien V.</p>
                        <p className="font-label-sm text-label-sm text-secondary">Silk Handbag • #4592</p>
                      </td>
                      <td className="py-4 text-right">
                        <p className="font-label-md text-label-md font-bold">$1,240.00</p>
                        <p className="font-label-sm text-label-sm text-on-secondary-container">Paid</p>
                      </td>
                    </tr>
                    <tr className="group cursor-pointer">
                      <td className="py-4">
                        <p className="font-label-md text-label-md font-bold group-hover:text-primary transition-colors">Sophia M.</p>
                        <p className="font-label-sm text-label-sm text-secondary">Velvet Pumps • #4591</p>
                      </td>
                      <td className="py-4 text-right">
                        <p className="font-label-md text-label-md font-bold">$840.00</p>
                        <p className="font-label-sm text-label-sm text-on-secondary-container">Paid</p>
                      </td>
                    </tr>
                    <tr className="group cursor-pointer">
                      <td className="py-4">
                        <p className="font-label-md text-label-md font-bold group-hover:text-primary transition-colors">Elena R.</p>
                        <p className="font-label-sm text-label-sm text-secondary">Leather Tote • #4589</p>
                      </td>
                      <td className="py-4 text-right">
                        <p className="font-label-md text-label-md font-bold">$2,100.00</p>
                        <p className="font-label-sm text-label-sm text-on-secondary-container">Processing</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <button className="w-full mt-6 py-3 border border-outline font-label-md text-label-md uppercase tracking-widest hover:bg-surface-container transition-colors">
                View All Orders
              </button>
            </div>
          </section>
        </div>

        {/* FOOTER */}
        <footer className="w-full bg-surface-container dark:bg-surface-container-low border-t border-outline-variant dark:border-outline py-stack-xl mt-auto">
          <div className="max-w-[1440px] mx-auto px-margin-desktop grid grid-cols-12 gap-gutter-desktop">
            <div className="col-span-4">
              <span className="font-display-lg text-[32px] text-primary font-extrabold uppercase tracking-tighter">Cloe</span>
              <p className="font-label-sm text-label-sm text-secondary mt-4 max-w-xs">
                Proprietary Control Center for inventory management, sales tracking, and global logistics. Access restricted to authorized personnel.
              </p>
            </div>
            <div className="col-span-2">
              <p className="font-label-md text-label-md font-bold mb-4">Resources</p>
              <ul className="space-y-2">
                <li><a className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors" href="#">Documentation</a></li>
                <li><a className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors" href="#">API Reference</a></li>
              </ul>
            </div>
            <div className="col-span-2">
              <p className="font-label-md text-label-md font-bold mb-4">Support</p>
              <ul className="space-y-2">
                <li><a className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors" href="#">Help Center</a></li>
                <li><a className="font-label-sm text-label-sm text-secondary hover:text-primary transition-colors" href="#">System Status</a></li>
              </ul>
            </div>
            <div className="col-span-4 flex flex-col justify-between">
              <div className="flex items-center gap-4 justify-end">
                <span className="material-symbols-outlined text-secondary hover:text-primary cursor-pointer">lock</span>
                <span className="material-symbols-outlined text-secondary hover:text-primary cursor-pointer">notifications</span>
              </div>
              <p className="font-label-sm text-label-sm text-secondary text-right">
                © 2024 Cloe. All rights reserved. System V4.2.1
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
