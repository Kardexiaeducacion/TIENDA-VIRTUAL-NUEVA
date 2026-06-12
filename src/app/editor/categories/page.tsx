"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

type Category = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

type Subcategory = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  created_at: string;
};

export default function CategoriesPage() {
  const supabase = createClient();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Formularios
  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  
  const [newSubName, setNewSubName] = useState("");
  const [newSubSlug, setNewSubSlug] = useState("");
  const [selectedCatId, setSelectedCatId] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const { data: cats } = await supabase.from("categories").select("*").order("created_at", { ascending: true });
    const { data: subs } = await supabase.from("subcategories").select("*").order("created_at", { ascending: true });
    
    if (cats) setCategories(cats);
    if (subs) setSubcategories(subs);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName || !newCatSlug) return;
    
    const { error } = await supabase.from("categories").insert({
      name: newCatName,
      slug: newCatSlug.toLowerCase().replace(/\s+/g, '-'),
    });

    if (error) {
      alert("Error al crear categoría: " + error.message);
    } else {
      setNewCatName("");
      setNewCatSlug("");
      fetchData();
    }
  };

  const handleCreateSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName || !newSubSlug || !selectedCatId) return;
    
    const { error } = await supabase.from("subcategories").insert({
      category_id: selectedCatId,
      name: newSubName,
      slug: newSubSlug.toLowerCase().replace(/\s+/g, '-'),
    });

    if (error) {
      alert("Error al crear subcategoría: " + error.message);
    } else {
      setNewSubName("");
      setNewSubSlug("");
      setSelectedCatId("");
      fetchData();
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("¿Estás seguro? Esto eliminará también las subcategorías y podría afectar a los productos asociados.")) return;
    await supabase.from("categories").delete().eq("id", id);
    fetchData();
  };

  const handleDeleteSubcategory = async (id: string) => {
    if (!confirm("¿Estás seguro? Esto podría afectar a los productos asociados.")) return;
    await supabase.from("subcategories").delete().eq("id", id);
    fetchData();
  };

  if (loading) return <div className="p-8">Cargando categorías...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-black mb-2">Categorías y Subcategorías</h1>
        <p className="text-gray-500 text-sm">Gestiona la estructura del catálogo y los filtros de la tienda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Crear Categoría */}
        <div className="bg-white p-6 rounded-lg border border-[#EAEAEA] shadow-sm">
          <h2 className="text-lg font-bold text-black mb-4">Nueva Categoría Principal</h2>
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase">Nombre</label>
              <input type="text" required value={newCatName} onChange={(e) => {
                setNewCatName(e.target.value);
                setNewCatSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
              }} className="w-full mt-1 bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-2.5 text-sm outline-none" placeholder="Ej. Bolsas" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase">Slug (URL)</label>
              <input type="text" required value={newCatSlug} onChange={(e) => setNewCatSlug(e.target.value)} className="w-full mt-1 bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-2.5 text-sm outline-none" placeholder="Ej. bolsas" />
            </div>
            <button type="submit" className="w-full py-2.5 bg-[#1C1C1C] text-white rounded-md text-xs font-bold uppercase hover:bg-black transition-colors">
              Crear Categoría
            </button>
          </form>
        </div>

        {/* Crear Subcategoría */}
        <div className="bg-white p-6 rounded-lg border border-[#EAEAEA] shadow-sm">
          <h2 className="text-lg font-bold text-black mb-4">Nueva Subcategoría</h2>
          <form onSubmit={handleCreateSubcategory} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase">Categoría Padre</label>
              <select required value={selectedCatId} onChange={(e) => setSelectedCatId(e.target.value)} className="w-full mt-1 bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-2.5 text-sm outline-none">
                <option value="">Selecciona una categoría...</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase">Nombre</label>
                <input type="text" required value={newSubName} onChange={(e) => {
                  setNewSubName(e.target.value);
                  setNewSubSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                }} className="w-full mt-1 bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-2.5 text-sm outline-none" placeholder="Ej. Totes" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase">Slug</label>
                <input type="text" required value={newSubSlug} onChange={(e) => setNewSubSlug(e.target.value)} className="w-full mt-1 bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-2.5 text-sm outline-none" placeholder="Ej. totes" />
              </div>
            </div>
            <button type="submit" className="w-full py-2.5 border border-[#1C1C1C] text-[#1C1C1C] rounded-md text-xs font-bold uppercase hover:bg-gray-50 transition-colors">
              Crear Subcategoría
            </button>
          </form>
        </div>
      </div>

      {/* Listado */}
      <div className="bg-white p-6 rounded-lg border border-[#EAEAEA] shadow-sm">
        <h2 className="text-lg font-bold text-black mb-6">Estructura del Catálogo</h2>
        
        {categories.length === 0 ? (
          <p className="text-sm text-gray-500">No hay categorías creadas aún.</p>
        ) : (
          <div className="space-y-6">
            {categories.map((cat) => {
              const subs = subcategories.filter(s => s.category_id === cat.id);
              return (
                <div key={cat.id} className="border border-[#EAEAEA] rounded-md overflow-hidden">
                  <div className="bg-[#F9F9F9] px-4 py-3 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-black">{cat.name}</h3>
                      <p className="text-xs text-gray-500">/category/{cat.slug}</p>
                    </div>
                    <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-500 hover:text-red-700">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                  {subs.length > 0 && (
                    <div className="px-4 py-3 bg-white border-t border-[#EAEAEA]">
                      <ul className="space-y-2">
                        {subs.map(sub => (
                          <li key={sub.id} className="flex justify-between items-center text-sm pl-4 border-l-2 border-[#EAEAEA]">
                            <div>
                              <span className="font-semibold text-gray-700">{sub.name}</span>
                              <span className="text-xs text-gray-400 ml-2">({sub.slug})</span>
                            </div>
                            <button onClick={() => handleDeleteSubcategory(sub.id)} className="text-red-400 hover:text-red-600">
                              <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
