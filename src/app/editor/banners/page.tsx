"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";

type Banner = {
  id: string;
  section: string;
  image_url: string;
  title: string | null;
  subtitle: string | null;
  link_text: string | null;
  link_url: string | null;
};

const sectionLabels: Record<string, string> = {
  'hero': 'Banner Principal (Hero) - 1920x1080px',
  'category_handbags': 'Colección Grande (Handbags) - 800x1200px',
  'category_luggage': 'Colección Pequeña (Luggage) - 800x800px',
  'category_accessories': 'Colección Pequeña (Accessories) - 800x800px',
  'limited_edition': 'Edición Limitada - 1920x800px',
};

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const fetchBanners = async () => {
    const { data } = await supabase.from("banners").select("*").order("section");
    if (data) setBanners(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBanners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEditClick = (banner: Banner) => {
    setEditingBanner({ ...banner });
    setFile(null);
    setPreview(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;
    setSaving(true);

    try {
      let finalImageUrl = editingBanner.image_url;

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `banner_${editingBanner.section}_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage.from("products").upload(fileName, file);
        if (uploadError) throw new Error(`Error subiendo imagen: ${uploadError.message}`);
        
        const { data: { publicUrl } } = supabase.storage.from("products").getPublicUrl(fileName);
        finalImageUrl = publicUrl;
      }

      const { error: dbError } = await supabase
        .from("banners")
        .update({
          image_url: finalImageUrl,
          title: editingBanner.title,
          subtitle: editingBanner.subtitle,
          link_text: editingBanner.link_text,
          link_url: editingBanner.link_url,
        })
        .eq("id", editingBanner.id);
      
      if (dbError) throw dbError;
      
      setEditingBanner(null);
      fetchBanners();
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message || "Ocurrió un error al guardar.");
      } else {
        alert("Ocurrió un error al guardar.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10">Cargando banners...</div>;

  return (
    <div className="p-10 max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-black uppercase tracking-tight">Banners de Inicio</h1>
          <p className="text-gray-500 mt-2">Configura las imágenes y textos de tu página principal.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm flex flex-col">
            <div className="aspect-video relative bg-gray-100">
              <Image src={banner.image_url} alt={banner.section} fill className="object-cover" unoptimized />
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <span className="text-xs font-bold text-[#ba1a1a] uppercase tracking-wider mb-1">
                {sectionLabels[banner.section] || banner.section}
              </span>
              <h3 className="text-lg font-bold text-black mb-1">{banner.title || "(Sin título)"}</h3>
              <p className="text-sm text-gray-500 mb-4">{banner.subtitle || "(Sin subtítulo)"}</p>
              
              <button 
                onClick={() => handleEditClick(banner)}
                className="mt-auto w-full py-2 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors rounded"
              >
                Editar
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingBanner && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold">Editar {sectionLabels[editingBanner.section] || editingBanner.section}</h2>
              <button onClick={() => setEditingBanner(null)} className="material-symbols-outlined text-gray-400 hover:text-black">close</button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 flex flex-col gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Imagen del Banner</label>
                <div className="flex flex-col items-center justify-center w-full">
                  <label htmlFor="banner-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 relative overflow-hidden">
                    {preview || editingBanner.image_url ? (
                      <Image src={preview || editingBanner.image_url} alt="Preview" fill className="object-cover opacity-50" unoptimized />
                    ) : null}
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 relative z-10">
                      <span className="material-symbols-outlined text-4xl text-gray-600 mb-2 drop-shadow-md">cloud_upload</span>
                      <p className="mb-2 text-sm text-gray-800 font-bold drop-shadow-md bg-white/70 px-2 py-1 rounded">Haz clic para subir nueva imagen</p>
                    </div>
                    <input id="banner-file" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Título Grande</label>
                <input 
                  type="text" 
                  value={editingBanner.title || ""} 
                  onChange={(e) => setEditingBanner({...editingBanner, title: e.target.value})}
                  className="w-full border border-gray-300 rounded p-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Subtítulo / Texto Pequeño</label>
                <textarea 
                  value={editingBanner.subtitle || ""} 
                  onChange={(e) => setEditingBanner({...editingBanner, subtitle: e.target.value})}
                  className="w-full border border-gray-300 rounded p-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Texto del Botón</label>
                  <input 
                    type="text" 
                    value={editingBanner.link_text || ""} 
                    onChange={(e) => setEditingBanner({...editingBanner, link_text: e.target.value})}
                    className="w-full border border-gray-300 rounded p-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Enlace del Botón</label>
                  <input 
                    type="text" 
                    value={editingBanner.link_url || ""} 
                    onChange={(e) => setEditingBanner({...editingBanner, link_url: e.target.value})}
                    className="w-full border border-gray-300 rounded p-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-4">
                <button 
                  type="button" 
                  onClick={() => setEditingBanner(null)}
                  disabled={saving}
                  className="px-6 py-3 border border-gray-300 text-gray-700 text-sm font-bold uppercase rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-black text-white text-sm font-bold uppercase rounded hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <><span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span> Guardando...</>
                  ) : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
