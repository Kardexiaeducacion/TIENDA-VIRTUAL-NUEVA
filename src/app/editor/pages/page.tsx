"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";

export default function AdminCustomPages() {
  const supabase = createClient();
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<any>(null);
  
  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const fetchPages = async () => {
    setLoading(true);
    const { data } = await supabase.from("custom_pages").select("*").order("slug");
    if (data) {
      setPages(data);
      if (data.length > 0 && !selectedPage) {
        handleSelectPage(data[0]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  const handleSelectPage = (page: any) => {
    setSelectedPage(page);
    setTitle(page.title || "");
    setContent(page.content || "");
    setImageUrl(page.image_url || "");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPage) return;

    const { error } = await supabase
      .from("custom_pages")
      .update({ title, content, image_url: imageUrl })
      .eq("id", selectedPage.id);

    if (error) {
      alert("Error al guardar la página.");
    } else {
      alert("Página guardada exitosamente.");
      fetchPages(); // refresh
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-500">Cargando páginas...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-black mb-2">Páginas de Información</h1>
        <p className="text-gray-500 text-sm">Edita el contenido de las páginas institucionales del pie de página.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar of pages */}
        <div className="lg:col-span-3 space-y-2">
          {pages.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelectPage(p)}
              className={`w-full text-left px-4 py-3 rounded-md text-sm font-bold uppercase tracking-wider transition-colors ${
                selectedPage?.id === p.id 
                  ? "bg-[#1C1C1C] text-white" 
                  : "bg-white text-gray-600 border border-[#EAEAEA] hover:bg-gray-50"
              }`}
            >
              {p.slug}
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="lg:col-span-9 bg-white border border-[#EAEAEA] rounded-md shadow-sm p-8">
          {selectedPage ? (
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Título de la Página</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md px-4 py-3 text-sm focus:border-black outline-none transition-colors"
                  placeholder="Ej. Nuestra Historia"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">URL de la Imagen (Opcional)</label>
                <input 
                  type="url" 
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md px-4 py-3 text-sm focus:border-black outline-none transition-colors"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                {imageUrl && (
                  <div className="mt-4 relative w-full h-48 rounded-md overflow-hidden bg-gray-100 border border-[#EAEAEA]">
                    <Image src={imageUrl} alt="Preview" fill className="object-cover" unoptimized />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Contenido de la Página</label>
                <p className="text-xs text-gray-500 mb-2">Puedes escribir el contenido aquí. Se respetarán los saltos de línea.</p>
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={15}
                  className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md px-4 py-3 text-sm focus:border-black outline-none transition-colors resize-y"
                  placeholder="Escribe el contenido de la página..."
                />
              </div>

              <div className="pt-4 border-t border-[#EAEAEA] flex justify-end">
                <button type="submit" className="bg-[#1C1C1C] text-white px-8 py-3 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors shadow-sm">
                  Guardar Página
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Selecciona una página de la lista para editar su contenido.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
