

export default function EditorSettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">Configuración</h1>
          <p className="text-gray-500 text-sm">Administra la información de tu tienda y preferencias.</p>
        </div>
        <button className="px-6 py-2 bg-[#1C1C1C] text-white text-sm font-bold uppercase tracking-wider rounded-md hover:bg-black transition-all">Guardar Cambios</button>
      </div>

      <div className="max-w-[1000px] space-y-8">
          {/* STORE INFO */}
          <section className="bg-surface-container-lowest p-8 border border-outline-variant">
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-6">Store Information</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-on-surface-variant">Store Name</label>
                  <input defaultValue="Cloe Luxury" className="border border-outline-variant bg-surface p-3 focus:outline-none focus:border-primary text-base" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-on-surface-variant">Store Email</label>
                  <input defaultValue="hola@cloe.mx" type="email" className="border border-outline-variant bg-surface p-3 focus:outline-none focus:border-primary text-base" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface-variant">Store Description</label>
                <textarea defaultValue="High-end accessories and luggage for the modern world." rows={3} className="border border-outline-variant bg-surface p-3 focus:outline-none focus:border-primary text-base resize-none" />
              </div>
            </div>
          </section>

          {/* BANNERS */}
          <section className="bg-surface-container-lowest p-8 border border-outline-variant">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Homepage Banners</h3>
              <button className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                <span className="material-symbols-outlined text-sm">add</span> Add Banner
              </button>
            </div>
            <div className="space-y-4">
              {[
                { title: "Summer Clearance — Last Chance", status: "Active", statusStyle: "bg-green-100 text-green-800" },
                { title: "Whimsical Limited Edition", status: "Scheduled", statusStyle: "bg-blue-100 text-blue-800" },
                { title: "Fall Collection 2024", status: "Draft", statusStyle: "bg-surface-container text-secondary" },
              ].map((banner) => (
                <div key={banner.title} className="flex items-center justify-between p-4 border border-outline-variant hover:border-primary transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-secondary">image</span>
                    <div>
                      <p className="text-sm font-semibold">{banner.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${banner.statusStyle}`}>{banner.status}</span>
                    <button className="material-symbols-outlined text-secondary hover:text-primary transition-colors">edit</button>
                    <button className="material-symbols-outlined text-secondary hover:text-error transition-colors">delete</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SHIPPING */}
          <section className="bg-surface-container-lowest p-8 border border-outline-variant">
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-6">Shipping Configuration</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-on-surface-variant">Free Shipping Threshold (USD)</label>
                  <input defaultValue="1500" type="number" className="border border-outline-variant bg-surface p-3 focus:outline-none focus:border-primary text-base" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-on-surface-variant">Standard Delivery Days</label>
                  <input defaultValue="3-5" className="border border-outline-variant bg-surface p-3 focus:outline-none focus:border-primary text-base" />
                </div>
              </div>
              <div className="space-y-3">
                {["Enable Express Shipping", "Enable International Shipping", "Require Signature on Delivery"].map((label) => (
                  <label key={label} className="flex items-center gap-3 cursor-pointer">
                    <input className="w-4 h-4 border-primary text-primary focus:ring-0" type="checkbox" defaultChecked={label.includes("Express")} />
                    <span className="text-base">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/* SECURITY */}
          <section className="bg-surface-container-lowest p-8 border border-outline-variant">
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-6">Admin Access</h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface-variant">Admin Role Code</label>
                <input type="password" defaultValue="EDITOR2024" className="border border-outline-variant bg-surface p-3 focus:outline-none focus:border-primary text-base font-mono" />
                <p className="text-xs text-secondary">Customers trying to access /editor without this code will be redirected to their account.</p>
              </div>
            </div>
          </section>
      </div>
    </div>
  );
}
