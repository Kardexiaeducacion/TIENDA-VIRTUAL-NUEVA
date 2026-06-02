"use client";
import AccountSidebar from "@/components/AccountSidebar";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function AddressesPage() {
  const supabase = createClient();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    street: "",
    city: "",
    state: "",
    zip_code: "",
    country: "México",
    phone: "",
    is_default: false
  });

  const handleZipCodeChange = async (val: string) => {
    setFormData((prev: any) => ({ ...prev, zip_code: val }));
    if (val.length === 5) {
      try {
        const res = await fetch(`https://api.zippopotam.us/mx/${val}`);
        if (res.ok) {
          const data = await res.json();
          const state = data.places[0]?.state || "";
          setFormData((prev: any) => ({ ...prev, state }));
        }
      } catch (err) {
        console.error("Error fetching CP", err);
      }
    }
  };

  useEffect(() => {
    async function fetchAddresses() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);

      const { data } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false });

      if (data) {
        setAddresses(data);
      }
      setLoading(false);
    }
    fetchAddresses();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    // If this is the first address, make it default automatically
    const isDefault = addresses.length === 0 ? true : formData.is_default;

    // If new address is default, we should ideally unset others, but we keep it simple for now
    if (isDefault) {
      await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId);
    }

    const { data, error } = await supabase
      .from("addresses")
      .insert([{ ...formData, user_id: userId, is_default: isDefault }])
      .select()
      .single();

    if (error) {
      console.error("Error saving address:", error);
      setMessage({ type: 'error', text: 'Error al guardar la dirección. Inténtalo de nuevo.' });
      return;
    }

    if (data) {
      // Re-fetch to sort correctly
      const { data: updated } = await supabase.from("addresses").select("*").eq("user_id", userId).order("is_default", { ascending: false });
      if (updated) setAddresses(updated);
      
      setShowForm(false);
      setMessage({ type: 'success', text: '¡Dirección guardada con éxito!' });
      setFormData({
        full_name: "", street: "", city: "", state: "", zip_code: "", country: "México", phone: "", is_default: false
      });

      // Clear success message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const removeAddress = async (id: string) => {
    if (!userId) return;
    setAddresses(addresses.filter(a => a.id !== id));
    await supabase.from("addresses").delete().eq("id", id).eq("user_id", userId);
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center">Cargando direcciones...</div>;

  return (
    <div className="bg-background text-on-background font-sans min-h-screen">
      <main className="pt-32 pb-20 max-w-[1440px] mx-auto px-20">
        <div className="grid grid-cols-12 gap-8">
          
          <AccountSidebar />

          <section className="col-span-12 md:col-span-9">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-primary mb-2">Mis Direcciones</h1>
                <p className="text-secondary">Gestiona tus direcciones de envío.</p>
              </div>
              <button 
                onClick={() => {
                  setShowForm(!showForm);
                  setMessage({ type: '', text: '' });
                }}
                className="px-6 py-2 bg-primary text-white text-sm font-bold uppercase tracking-widest hover:bg-black transition-colors rounded-lg flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Nueva Dirección
              </button>
            </div>

            {message.text && (
              <div className={`p-4 mb-8 rounded-lg text-sm font-bold ${message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                {message.text}
              </div>
            )}

            {showForm && (
              <form onSubmit={handleSubmit} className="bg-surface-container-lowest border border-outline-variant p-8 rounded-xl mb-8 space-y-6 animate-in fade-in slide-in-from-top-4">
                <h3 className="text-lg font-bold">Agregar Nueva Dirección</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase">Nombre de quien recibe</label>
                    <input required type="text" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none" 
                      value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} placeholder="Ej. Juan Pérez" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase">Teléfono de contacto</label>
                    <input required type="tel" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none" 
                      value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Ej. 55 1234 5678" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-gray-700 uppercase">Calle y Número</label>
                    <input required type="text" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none" 
                      value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} placeholder="Ej. Av. Reforma 222, Int 4" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase">Código Postal</label>
                    <input required type="text" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none" 
                      value={formData.zip_code} onChange={e => handleZipCodeChange(e.target.value)} placeholder="Ej. 06600" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase">Ciudad / Municipio</label>
                    <input required type="text" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none" 
                      value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="Ej. Cuauhtémoc" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase">Estado</label>
                    <input required type="text" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none" 
                      value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} placeholder="Ej. CDMX" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase">País</label>
                    <input disabled type="text" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm cursor-not-allowed" 
                      value={formData.country} />
                  </div>
                </div>

                {addresses.length > 0 && (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-black" 
                      checked={formData.is_default} onChange={e => setFormData({...formData, is_default: e.target.checked})} />
                    <span className="text-sm font-semibold">Establecer como dirección predeterminada</span>
                  </label>
                )}

                <div className="flex justify-end gap-4 pt-4">
                  <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 border border-[#EAEAEA] rounded-md text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" className="px-8 py-3 bg-[#1C1C1C] text-white rounded-md text-sm font-bold uppercase tracking-wider hover:bg-black transition-colors">
                    Guardar Dirección
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {addresses.length === 0 && !showForm ? (
                <div className="col-span-1 md:col-span-2 bg-surface-container-lowest border border-outline-variant p-12 text-center rounded-xl">
                  <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">location_on</span>
                  <h3 className="text-xl font-bold text-primary mb-2">Sin direcciones guardadas</h3>
                  <p className="text-secondary">Agrega tu primera dirección de envío para agilizar tus compras.</p>
                </div>
              ) : (
                addresses.map((address) => (
                  <div key={address.id} className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold">{address.full_name}</h3>
                        {address.is_default && (
                          <span className="bg-gray-100 text-gray-800 text-[10px] font-bold uppercase px-2 py-1 rounded">Predeterminada</span>
                        )}
                      </div>
                      <p className="text-sm text-secondary mb-1">{address.street}</p>
                      <p className="text-sm text-secondary mb-1">{address.city}, {address.state} {address.zip_code}</p>
                      <p className="text-sm text-secondary mb-4">{address.country}</p>
                      <p className="text-sm font-semibold"><span className="material-symbols-outlined text-[14px] align-middle mr-1">call</span> {address.phone}</p>
                    </div>
                    
                    <div className="flex gap-4 mt-6 pt-4 border-t border-outline-variant">
                      <button className="text-sm font-bold text-primary hover:underline">Editar</button>
                      <button onClick={() => removeAddress(address.id)} className="text-sm font-bold text-error hover:underline">Eliminar</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
