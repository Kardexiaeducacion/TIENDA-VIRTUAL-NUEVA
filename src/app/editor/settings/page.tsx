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
  
  // Store info state
  const [storeInfo, setStoreInfo] = useState({
    storeName: "Cloe Studio",
    contactEmail: "contacto@cloe.com"
  });

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      const { data: socialData } = await supabase.from("custom_pages").select("content").eq("slug", "social_links").single();
      if (socialData && socialData.content) {
        try {
          const parsed = JSON.parse(socialData.content);
          setSocials(parsed);
        } catch (e) {
          console.error("Error parsing social links", e);
        }
      }

      const { data: storeData } = await supabase.from("custom_pages").select("content").eq("slug", "store_info").single();
      if (storeData && storeData.content) {
        try {
          const parsed = JSON.parse(storeData.content);
          setStoreInfo(parsed);
        } catch (e) {
          console.error("Error parsing store info", e);
        }
      }
      setLoading(false);
    }
    loadSettings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    // Save to custom_pages with slug='social_links'
    const socialPayload = JSON.stringify(socials);
    const storePayload = JSON.stringify(storeInfo);
    
    // Check if they exist
    const { data: existingSocial } = await supabase.from("custom_pages").select("id").eq("slug", "social_links").single();
    const { data: existingStore } = await supabase.from("custom_pages").select("id").eq("slug", "store_info").single();
    
    let hasError = false;

    if (existingSocial) {
      const { error } = await supabase.from("custom_pages").update({ content: socialPayload }).eq("slug", "social_links");
      if (error) hasError = true;
    } else {
      const { error } = await supabase.from("custom_pages").insert([{ slug: "social_links", title: "Social Links", content: socialPayload }]);
      if (error) hasError = true;
    }

    if (existingStore) {
      const { error } = await supabase.from("custom_pages").update({ content: storePayload }).eq("slug", "store_info");
      if (error) hasError = true;
    } else {
      const { error } = await supabase.from("custom_pages").insert([{ slug: "store_info", title: "Store Info", content: storePayload }]);
      if (error) hasError = true;
    }

    if (hasError) {
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

          {/* STORE INFO */}
          <section className="bg-white p-8 border border-[#EAEAEA] rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">Información de la Tienda</h3>
            </div>
            {loading ? (
              <p className="text-sm text-gray-500">Cargando...</p>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 uppercase">Nombre de la Tienda</label>
                    <input 
                      value={storeInfo.storeName}
                      onChange={e => setStoreInfo({...storeInfo, storeName: e.target.value})}
                      className="w-full bg-[#F5F5F5] border border-[#EAEAEA] p-3 text-sm focus:border-black outline-none rounded-md" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 uppercase">Correo de Contacto</label>
                    <input 
                      value={storeInfo.contactEmail}
                      onChange={e => setStoreInfo({...storeInfo, contactEmail: e.target.value})}
                      className="w-full bg-[#F5F5F5] border border-[#EAEAEA] p-3 text-sm focus:border-black outline-none rounded-md" 
                    />
                  </div>
                </div>
              </div>
            )}
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
