"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function EditorSettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  
  // Social links state
  const [socials, setSocials] = useState({
    instagram: "",
    tiktok: "",
    facebook: "",
    x: ""
  });

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      const { data } = await supabase.from("custom_pages").select("content").eq("slug", "social_links").single();
      if (data && data.content) {
        try {
          const parsed = JSON.parse(data.content);
          setSocials(parsed);
        } catch (e) {
          console.error("Error parsing social links", e);
        }
      }
      setLoading(false);
    }
    loadSettings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    // Save to custom_pages with slug='social_links'
    const payload = JSON.stringify(socials);
    
    // Check if it exists
    const { data: existing } = await supabase.from("custom_pages").select("id").eq("slug", "social_links").single();
    
    let error;
    if (existing) {
      const res = await supabase.from("custom_pages").update({ content: payload }).eq("slug", "social_links");
      error = res.error;
    } else {
      const res = await supabase.from("custom_pages").insert([{ slug: "social_links", title: "Social Links", content: payload }]);
      error = res.error;
    }

    if (error) {
      alert("Error al guardar la configuración.");
    } else {
      alert("Configuración guardada exitosamente.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">Configuración</h1>
          <p className="text-gray-500 text-sm">Administra la información de tu tienda y preferencias.</p>
        </div>
        <button onClick={handleSave} className="px-6 py-2 bg-[#1C1C1C] text-white text-sm font-bold uppercase tracking-wider rounded-md hover:bg-black transition-all">
          Guardar Cambios
        </button>
      </div>

      <div className="max-w-[1000px] space-y-8">
          
          {/* REDES SOCIALES */}
          <section className="bg-white p-8 border border-[#EAEAEA] rounded-lg shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">Redes Sociales</h3>
            <p className="text-sm text-gray-500 mb-6">Ingresa los enlaces completos de tus redes sociales. Estos aparecerán en el pie de página de la tienda.</p>
            {loading ? (
              <p className="text-sm text-gray-500">Cargando...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Instagram URL</label>
                  <input 
                    type="url"
                    value={socials.instagram}
                    onChange={e => setSocials({...socials, instagram: e.target.value})}
                    className="w-full bg-[#F5F5F5] border border-[#EAEAEA] p-3 text-sm focus:border-black outline-none rounded-md" 
                    placeholder="https://instagram.com/tu_usuario" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">TikTok URL</label>
                  <input 
                    type="url"
                    value={socials.tiktok}
                    onChange={e => setSocials({...socials, tiktok: e.target.value})}
                    className="w-full bg-[#F5F5F5] border border-[#EAEAEA] p-3 text-sm focus:border-black outline-none rounded-md" 
                    placeholder="https://tiktok.com/@tu_usuario" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Facebook URL</label>
                  <input 
                    type="url"
                    value={socials.facebook}
                    onChange={e => setSocials({...socials, facebook: e.target.value})}
                    className="w-full bg-[#F5F5F5] border border-[#EAEAEA] p-3 text-sm focus:border-black outline-none rounded-md" 
                    placeholder="https://facebook.com/tu_pagina" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">X (Twitter) URL</label>
                  <input 
                    type="url"
                    value={socials.x}
                    onChange={e => setSocials({...socials, x: e.target.value})}
                    className="w-full bg-[#F5F5F5] border border-[#EAEAEA] p-3 text-sm focus:border-black outline-none rounded-md" 
                    placeholder="https://x.com/tu_usuario" 
                  />
                </div>
              </div>
            )}
          </section>

          {/* STORE INFO (Static for now) */}
          <section className="bg-white p-8 border border-[#EAEAEA] rounded-lg shadow-sm opacity-50 pointer-events-none">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Información de la Tienda (Próximamente)</h3>
            </div>
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
            </div>
          </section>

          {/* BANNERS */}
          <section className="bg-white p-8 border border-[#EAEAEA] rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Banners de Inicio</h3>
                <p className="text-sm text-gray-500">Administra las imágenes, textos y enlaces de los banners principales de la tienda.</p>
              </div>
              <a href="/editor/banners" className="px-6 py-2 bg-black text-white text-sm font-bold uppercase tracking-wider rounded-md hover:bg-gray-800 transition-all text-center flex items-center justify-center">
                Ir a Editor de Banners
              </a>
            </div>
          </section>

      </div>
    </div>
  );
}
