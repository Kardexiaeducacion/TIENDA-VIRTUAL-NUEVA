

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
          <section className="bg-white p-8 border border-[#EAEAEA] rounded-lg shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">Información de la Tienda</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Nombre de la Tienda</label>
                  <input className="w-full bg-[#F5F5F5] border border-[#EAEAEA] p-3 text-sm focus:border-black outline-none rounded-md" defaultValue="Cloe Studio" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Correo de Contacto</label>
                  <input className="w-full bg-[#F5F5F5] border border-[#EAEAEA] p-3 text-sm focus:border-black outline-none rounded-md" defaultValue="contacto@cloe.com" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase">Descripción Corta</label>
                <textarea className="w-full bg-[#F5F5F5] border border-[#EAEAEA] p-3 text-sm focus:border-black outline-none rounded-md" rows={3} defaultValue="Accesorios de alta gama para el mundo moderno." />
              </div>
            </div>
          </section>

          {/* BANNERS */}
          <section className="bg-white p-8 border border-[#EAEAEA] rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Banners de Inicio</h3>
              <button className="flex items-center gap-1 text-xs font-bold text-[#C1A87D] hover:underline uppercase tracking-wider">
                <span className="material-symbols-outlined text-sm">add</span> Añadir Banner
              </button>
            </div>
            <div className="space-y-4">
              {[
                { title: "Liquidación de Verano — Última Oportunidad", status: "Activo", statusStyle: "bg-green-100 text-green-800" },
                { title: "Edición Limitada", status: "Programado", statusStyle: "bg-blue-100 text-blue-800" },
                { title: "Colección Otoño 2024", status: "Borrador", statusStyle: "bg-gray-100 text-gray-600" },
              ].map((banner) => (
                <div key={banner.title} className="flex items-center justify-between p-4 border border-[#EAEAEA] rounded-md hover:border-black transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-gray-400">image</span>
                    <div>
                      <p className="text-sm font-semibold">{banner.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${banner.statusStyle}`}>{banner.status}</span>
                    <button className="material-symbols-outlined text-gray-400 hover:text-black transition-colors">edit</button>
                    <button className="material-symbols-outlined text-gray-400 hover:text-red-600 transition-colors">delete</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SHIPPING */}
          <section className="bg-white p-8 border border-[#EAEAEA] rounded-lg shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">Configuración de Envío</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-700 uppercase">Umbral de Envío Gratis (USD)</label>
                  <input defaultValue="1500" type="number" className="border border-[#EAEAEA] bg-[#F5F5F5] p-3 focus:outline-none focus:border-black text-sm" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-700 uppercase">Días de Entrega Estándar</label>
                  <input defaultValue="3-5" className="border border-[#EAEAEA] bg-[#F5F5F5] p-3 focus:outline-none focus:border-black text-sm" />
                </div>
              </div>
              <div className="space-y-3">
                {["Habilitar Envío Exprés", "Habilitar Envío Internacional", "Requerir Firma al Recibir"].map((label) => (
                  <label key={label} className="flex items-center gap-3 cursor-pointer">
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
