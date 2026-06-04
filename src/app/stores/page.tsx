import { createClient } from "@/utils/supabase/server";

export default async function StoresPage() {
  const supabase = await createClient();
  const { data: stores } = await supabase.from("physical_stores").select("*").order("created_at", { ascending: false });

  return (
    <div className="pt-32 pb-20 max-w-[1200px] mx-auto px-8 md:px-20 animate-in fade-in duration-500">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-black mb-4 tracking-tighter">
          Nuestras Sucursales
        </h1>
        <p className="text-secondary max-w-2xl mx-auto leading-relaxed">
          Encuentra la tienda física más cercana y descubre nuestras colecciones en persona.
        </p>
      </div>
      
      {stores && stores.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stores.map((store) => (
            <div key={store.id} className="bg-white border border-outline-variant p-8 shadow-sm flex flex-col h-full">
              <span className="material-symbols-outlined text-4xl text-primary mb-6">storefront</span>
              <h3 className="text-xl font-bold text-black mb-3">{store.name}</h3>
              <p className="text-secondary text-sm flex-1 leading-relaxed mb-8">{store.address}</p>
              
              {store.map_url ? (
                <a 
                  href={store.map_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block w-full text-center bg-primary text-white py-3 text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors"
                >
                  Ver en Google Maps
                </a>
              ) : (
                <div className="inline-block w-full text-center bg-surface-container text-gray-500 py-3 text-xs font-bold uppercase tracking-widest cursor-not-allowed">
                  Mapa no disponible
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-surface-container border border-outline-variant">
          <span className="material-symbols-outlined text-5xl text-gray-300 mb-4">location_off</span>
          <p className="text-secondary">Próximamente abriremos nuevas sucursales. ¡Mantente atento!</p>
        </div>
      )}
    </div>
  );
}
