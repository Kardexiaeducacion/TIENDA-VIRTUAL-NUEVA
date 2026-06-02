"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function ShippingSettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    id: "",
    sender_address: "",
    shipping_api_provider: "skydropx",
    shipping_api_key: "",
    volumetric_divisor: 5000,
    base_shipping_cost: 150,
    free_shipping_threshold: 1500
  });

  const [addressObj, setAddressObj] = useState({
    street: "",
    zip_code: "",
    city: "",
    state: "",
    country: "México",
    phone: ""
  });

  const handleZipCodeChange = async (val: string, setter: any) => {
    setter((prev: any) => ({ ...prev, zip_code: val }));
    if (val.length === 5) {
      try {
        const res = await fetch(`https://api.zippopotam.us/mx/${val}`);
        if (res.ok) {
          const data = await res.json();
          const state = data.places[0]?.state || "";
          // Zippopotam API primarily returns "state" and "place name" (neighborhood). 
          // We autocomplete the state. The user can type the city/municipality.
          setter((prev: any) => ({ ...prev, state }));
        }
      } catch (err) {
        console.error("Error fetching CP", err);
      }
    }
  };

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from("store_settings").select("*").limit(1).single();
      if (data) {
        setSettings({
          id: data.id,
          sender_address: data.sender_address || "",
          shipping_api_provider: data.shipping_api_provider || "skydropx",
          shipping_api_key: data.shipping_api_key || "",
          volumetric_divisor: data.volumetric_divisor || 5000,
          base_shipping_cost: data.base_shipping_cost || 150,
          free_shipping_threshold: data.free_shipping_threshold || 1500
        });

        try {
          if (data.sender_address && data.sender_address.startsWith("{")) {
            const parsed = JSON.parse(data.sender_address);
            setAddressObj(parsed);
          } else {
            setAddressObj(prev => ({ ...prev, street: data.sender_address || "" }));
          }
        } catch {
          setAddressObj(prev => ({ ...prev, street: data.sender_address || "" }));
        }
      }
      setLoading(false);
    }
    fetchSettings();
  }, [supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (settings.id) {
        // Update
        const { error } = await supabase.from("store_settings").update({
          sender_address: JSON.stringify(addressObj),
          shipping_api_provider: settings.shipping_api_provider,
          shipping_api_key: settings.shipping_api_key,
          volumetric_divisor: settings.volumetric_divisor,
          base_shipping_cost: settings.base_shipping_cost,
          free_shipping_threshold: settings.free_shipping_threshold
        }).eq("id", settings.id);
        if (error) throw error;
      } else {
        // Insert
        const { data, error } = await supabase.from("store_settings").insert([{
          sender_address: JSON.stringify(addressObj),
          shipping_api_provider: settings.shipping_api_provider,
          shipping_api_key: settings.shipping_api_key,
          volumetric_divisor: settings.volumetric_divisor,
          base_shipping_cost: settings.base_shipping_cost,
          free_shipping_threshold: settings.free_shipping_threshold
        }]).select().single();
        if (error) throw error;
        if (data) setSettings({ ...settings, id: data.id });
      }
      alert("Configuración guardada correctamente");
    } catch (error: any) {
      alert("Error al guardar: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-500">Cargando configuración...</div>;
  }

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-black mb-2">Envíos y Logística</h1>
        <p className="text-gray-500 text-sm">Configura la dirección de origen, el tabulador de costos y conecta tu cuenta de paquetería.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* DIRECCIÓN DEL REMITENTE */}
        <div className="bg-white p-8 rounded-lg border border-[#EAEAEA] shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-black border-b border-[#EAEAEA] pb-4">Dirección del Remitente (Origen)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-gray-700 uppercase">Calle y Número</label>
              <input required type="text" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none" 
                value={addressObj.street} onChange={e => setAddressObj({...addressObj, street: e.target.value})} placeholder="Ej. Av. Reforma 222, Int 4" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase">Código Postal</label>
              <input required type="text" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none" 
                value={addressObj.zip_code} onChange={e => handleZipCodeChange(e.target.value, setAddressObj)} placeholder="Ej. 06600" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase">Ciudad / Municipio</label>
              <input required type="text" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none" 
                value={addressObj.city} onChange={e => setAddressObj({...addressObj, city: e.target.value})} placeholder="Ej. Cuauhtémoc" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase">Estado</label>
              <input required type="text" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none" 
                value={addressObj.state} onChange={e => setAddressObj({...addressObj, state: e.target.value})} placeholder="Ej. CDMX" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase">Teléfono de contacto</label>
              <input required type="tel" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none" 
                value={addressObj.phone} onChange={e => setAddressObj({...addressObj, phone: e.target.value})} placeholder="Ej. 55 1234 5678" />
            </div>
          </div>
        </div>

        {/* TABULADOR */}
        <div className="bg-white p-8 rounded-lg border border-[#EAEAEA] shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-black border-b border-[#EAEAEA] pb-4">Tabulador de Costos Globales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase">Costo Base de Envío ($)</label>
              <input 
                type="number" 
                className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none"
                value={settings.base_shipping_cost}
                onChange={(e) => setSettings({ ...settings, base_shipping_cost: Number(e.target.value) })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase">Monto para Envío Gratis ($)</label>
              <input 
                type="number" 
                className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none"
                value={settings.free_shipping_threshold}
                onChange={(e) => setSettings({ ...settings, free_shipping_threshold: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase">Divisor Volumétrico</label>
              <input 
                type="number" 
                className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none"
                value={settings.volumetric_divisor}
                onChange={(e) => setSettings({ ...settings, volumetric_divisor: Number(e.target.value) })}
              />
              <p className="text-[10px] text-gray-500">Normalmente es 5000 para envíos nacionales.</p>
            </div>
          </div>
          
          <div className="mt-4 bg-[#F9F9F9] border border-[#EAEAEA] rounded-md p-4 text-sm text-gray-600">
            <p><strong>Nota:</strong> Si configuras un "Costo de Envío" específico directamente en el formulario de un producto, ese valor anulará este costo base global.</p>
          </div>
        </div>

        {/* API INTEGRATION */}
        <div className="bg-white p-8 rounded-lg border border-[#EAEAEA] shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-4">
            <div>
              <h2 className="text-lg font-bold text-black">Integración con Paqueterías (API)</h2>
              <p className="text-xs text-gray-500">Conecta tu cuenta para generar guías automáticamente desde el panel de Ventas.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase">Proveedor</label>
              <select 
                className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none"
                value={settings.shipping_api_provider}
                onChange={(e) => setSettings({ ...settings, shipping_api_provider: e.target.value })}
              >
                <option value="skydropx">Skydropx</option>
                <option value="enviacom">Envia.com</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase">API Key (Producción)</label>
              <input 
                type="password" 
                placeholder="Ingresa tu llave secreta de la API"
                className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none"
                value={settings.shipping_api_key}
                onChange={(e) => setSettings({ ...settings, shipping_api_key: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" disabled={saving} className="px-8 py-3 bg-[#1C1C1C] text-white rounded-md text-sm font-bold uppercase tracking-wider hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2 min-w-[200px]">
            {saving ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                Guardando...
              </>
            ) : "Guardar Configuración"}
          </button>
        </div>

      </form>
    </div>
  );
}
