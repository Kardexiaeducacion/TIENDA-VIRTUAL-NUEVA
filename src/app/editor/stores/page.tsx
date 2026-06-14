"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function AdminPhysicalStores() {
  const supabase = createClient();
  const [stores, setStores] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State for new/edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [mapUrl, setMapUrl] = useState("");

  const fetchStores = async () => {
    setLoading(true);
    const { data } = await supabase.from("physical_stores").select("*").order("created_at", { ascending: false });
    if (data) setStores(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStores();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setAddress("");
    setMapUrl("");
  };

  const handleEdit = (store: Record<string, unknown>) => {
    setEditingId(store.id as string);
    setName(store.name as string);
    setAddress(store.address as string);
    setMapUrl((store.map_url as string) || "");
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Seguro que deseas eliminar esta sucursal?")) {
      const { error } = await supabase.from("physical_stores").delete().eq("id", id);
      if (!error) {
        setStores(stores.filter(s => s.id !== id));
      } else {
        alert("Error al eliminar la sucursal.");
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;

    if (editingId) {
      const { error } = await supabase
        .from("physical_stores")
        .update({ name, address, map_url: mapUrl })
        .eq("id", editingId);
      
      if (!error) {
        alert("Sucursal actualizada.");
        fetchStores();
        resetForm();
      } else {
        alert("Error al actualizar la sucursal.");
      }
    } else {
      const { error } = await supabase
        .from("physical_stores")
        .insert([{ name, address, map_url: mapUrl }]);
      
      if (!error) {
        alert("Sucursal añadida exitosamente.");
        fetchStores();
        resetForm();
      } else {
        alert("Error al añadir la sucursal.");
      }
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-500">Cargando sucursales...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-black mb-2">Buscador de Tiendas</h1>
        <p className="text-gray-500 text-sm">Gestiona las direcciones y enlaces a mapas de tus sucursales físicas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form to Add/Edit Store */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-[#EAEAEA] rounded-md shadow-sm p-6 sticky top-24">
            <h3 className="text-sm font-bold uppercase tracking-widest text-black mb-6 border-b border-[#EAEAEA] pb-4">
              {editingId ? "Editar Sucursal" : "Añadir Nueva Sucursal"}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Nombre de la Tienda</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md px-4 py-3 text-sm focus:border-black outline-none transition-colors"
                  placeholder="Ej. Cloe Plaza Mayor"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Dirección Completa</label>
                <textarea 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md px-4 py-3 text-sm focus:border-black outline-none transition-colors resize-none"
                  placeholder="Ej. Av. Siempre Viva 123, Col. Centro..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Enlace a Google Maps (Opcional)</label>
                <input 
                  type="url" 
                  value={mapUrl}
                  onChange={(e) => setMapUrl(e.target.value)}
                  className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md px-4 py-3 text-sm focus:border-black outline-none transition-colors"
                  placeholder="https://maps.google.com/..."
                />
              </div>

              <div className="pt-4 flex gap-2">
                <button type="submit" className="flex-1 bg-[#1C1C1C] text-white px-4 py-3 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors shadow-sm">
                  {editingId ? "Guardar" : "Añadir"}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm} className="flex-1 bg-white text-gray-600 border border-[#EAEAEA] px-4 py-3 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors shadow-sm">
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* List of Stores */}
        <div className="lg:col-span-8">
          <div className="bg-white border border-[#EAEAEA] rounded-md shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F9F9F9] border-b border-[#EAEAEA] text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="p-4 pl-6">Información de Sucursal</th>
                  <th className="p-4 pr-6 text-right w-24">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEAEA]">
                {stores && stores.length > 0 ? (
                  stores.map((store) => (
                    <tr key={store.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="p-4 pl-6">
                        <p className="text-sm font-bold text-black mb-1">{store.name}</p>
                        <p className="text-xs text-gray-500 leading-relaxed max-w-md">{store.address}</p>
                        {store.map_url && (
                          <a href={store.map_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                            <span className="material-symbols-outlined text-[14px]">map</span> Ver en mapa
                          </a>
                        )}
                      </td>
                      <td className="p-4 pr-6 text-right align-top">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(store)} className="w-8 h-8 rounded border border-[#EAEAEA] flex items-center justify-center text-gray-600 hover:text-black hover:border-black transition-all bg-white" title="Editar">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button onClick={() => handleDelete(store.id)} className="w-8 h-8 rounded border border-[#EAEAEA] flex items-center justify-center text-red-500 hover:bg-red-50 hover:border-red-200 transition-all bg-white" title="Eliminar">
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="p-12 text-center text-gray-500">
                      <span className="material-symbols-outlined text-4xl mb-2 text-gray-300">store</span>
                      <p className="text-sm">No tienes sucursales registradas aún.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
