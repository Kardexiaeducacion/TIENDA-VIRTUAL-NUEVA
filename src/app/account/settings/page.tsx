import AccountSidebar from "@/components/AccountSidebar";

export default function SettingsPage() {
  return (
    <div className="bg-background text-on-background font-sans min-h-screen">
      <main className="pt-32 pb-20 max-w-[1440px] mx-auto px-20">
        <div className="grid grid-cols-12 gap-8">
          
          <AccountSidebar />

          <section className="col-span-12 md:col-span-9">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-primary mb-2">Configuración</h1>
                <p className="text-secondary">Próximamente podrás modificar tus preferencias aquí.</p>
              </div>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant p-12 text-center rounded-xl flex flex-col items-center">
              <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">construction</span>
              <h3 className="text-xl font-bold text-primary mb-2">Sección en Construcción</h3>
              <p className="text-secondary">Estamos trabajando en nuevas opciones para que personalices tu experiencia.</p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
