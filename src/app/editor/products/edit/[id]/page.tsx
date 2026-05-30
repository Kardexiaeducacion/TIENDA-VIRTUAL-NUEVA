"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    price: "",
    description: "",
    shipping_cost: "0",
    category_id: "",
    subcategory_id: "",
  });

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [subcategories, setSubcategories] = useState<{ id: string; category_id: string; name: string }[]>([]);

  const [features, setFeatures] = useState<{ key: string; value: string }[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      // Fetch categories
      const { data: cats } = await supabase.from("categories").select("*").order("name");
      const { data: subs } = await supabase.from("subcategories").select("*").order("name");
      if (cats) setCategories(cats);
      if (subs) setSubcategories(subs);

      // Fetch product
      const { data: product } = await supabase.from("products").select("*").eq("id", id).single();
      if (product) {
        setFormData({
          name: product.name || "",
          sku: product.sku || "",
          price: product.price?.toString() || "",
          description: product.description || "",
          shipping_cost: product.shipping_cost?.toString() || "0",
          category_id: product.category_id || "",
          subcategory_id: product.subcategory_id || "",
        });

        if (product.features) {
          const feats = Object.entries(product.features).map(([key, value]) => ({ key, value: String(value) }));
          setFeatures(feats.length > 0 ? feats : [{ key: "Marca", value: "Cloe" }, { key: "Material", value: "" }]);
        } else {
          setFeatures([{ key: "Marca", value: "Cloe" }, { key: "Material", value: "" }]);
        }

        if (product.images) {
          setExistingImages(product.images);
        }
      }
      setInitialLoading(false);
    }
    fetchData();
  }, [supabase, id]);

  const addFeature = () => setFeatures([...features, { key: "", value: "" }]);
  const removeFeature = (index: number) => setFeatures(features.filter((_, i) => i !== index));
  const updateFeature = (index: number, field: "key" | "value", val: string) => {
    const newFeatures = [...features];
    newFeatures[index][field] = val;
    setFeatures(newFeatures);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
      
      const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeNewFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const productPrice = Number(formData.price) || 0;
  const shippingCost = Number(formData.shipping_cost) || 0;
  const totalCost = productPrice + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const featureObj = features.reduce((acc, curr) => {
        if (curr.key) acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, string>);

      const imageUrls: string[] = [...existingImages];

      // Upload new images to Supabase Storage
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage.from("products").upload(filePath, file);
        if (uploadError) throw new Error(`Error subiendo imagen: ${uploadError.message}`);

        const { data: { publicUrl } } = supabase.storage.from("products").getPublicUrl(filePath);
        imageUrls.push(publicUrl);
      }

      // Update product data in DB
      const { error: dbError } = await supabase.from("products").update({
        name: formData.name,
        sku: formData.sku,
        price: productPrice,
        description: formData.description,
        shipping_cost: shippingCost,
        images: imageUrls,
        features: featureObj,
        category_id: formData.category_id || null,
        subcategory_id: formData.subcategory_id || null,
      }).eq("id", id);

      if (dbError) throw dbError;

      router.push("/editor/products");
      router.refresh();
    } catch (error: unknown) {
      alert((error as Error).message);
      setLoading(false);
    }
  };

  if (initialLoading) return <div className="p-8">Cargando producto...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-black mb-2">Editar Producto</h1>
        <p className="text-gray-500 text-sm">Modifica los detalles de este producto.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* IMAGES */}
        <div className="bg-white p-8 rounded-lg border border-[#EAEAEA] shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-4">
            <h2 className="text-lg font-bold text-black">Fotografías</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-[#EAEAEA] border-dashed rounded-lg cursor-pointer bg-[#F9F9F9] hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">cloud_upload</span>
                  <p className="mb-2 text-sm text-gray-500 font-bold">Haz clic para añadir más imágenes</p>
                  <p className="text-xs text-gray-400">PNG, JPG o WEBP (MAX. 5MB)</p>
                </div>
                <input id="dropzone-file" type="file" className="hidden" multiple accept="image/*" onChange={handleFileChange} />
              </label>
            </div>

            {(existingImages.length > 0 || previews.length > 0) && (
              <div className="flex gap-4 overflow-x-auto py-2">
                {existingImages.map((src, idx) => (
                  <div key={`exist-${idx}`} className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden border border-[#EAEAEA]">
                    <Image src={src} alt="Existente" fill className="object-cover" unoptimized />
                    <button type="button" onClick={() => removeExistingImage(idx)} className="absolute top-1 right-1 bg-white rounded-full w-6 h-6 flex items-center justify-center text-red-500 shadow-sm hover:bg-red-50 transition-colors">
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                ))}
                {previews.map((src, idx) => (
                  <div key={`new-${idx}`} className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden border border-green-500">
                    <Image src={src} alt="Preview" fill className="object-cover" unoptimized />
                    <button type="button" onClick={() => removeNewFile(idx)} className="absolute top-1 right-1 bg-white rounded-full w-6 h-6 flex items-center justify-center text-red-500 shadow-sm hover:bg-red-50 transition-colors">
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-green-500 text-white text-[9px] text-center font-bold py-1 uppercase tracking-wider">Nuevo</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* BASIC INFO */}
        <div className="bg-white p-8 rounded-lg border border-[#EAEAEA] shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-black border-b border-[#EAEAEA] pb-4">Información Básica</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase">Nombre del Producto</label>
              <input required type="text" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none" 
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ej. Bolso Tote Clásico" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase">SKU (ID del Producto)</label>
              <input required type="text" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none" 
                value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} placeholder="Ej. PRD-001" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase">Precio (MXN)</label>
              <input required type="number" min="0" step="0.01" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none" 
                value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase">Categoría</label>
              <select className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none"
                value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value, subcategory_id: ""})}>
                <option value="">Seleccionar Categoría</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase">Subcategoría</label>
              <select className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none"
                value={formData.subcategory_id} onChange={e => setFormData({...formData, subcategory_id: e.target.value})}
                disabled={!formData.category_id}>
                <option value="">Seleccionar Subcategoría</option>
                {subcategories.filter(s => s.category_id === formData.category_id).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase">Descripción</label>
            <textarea required rows={4} className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none resize-none" 
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe el producto detalladamente..." />
          </div>
        </div>

        {/* MERCADO LIBRE STYLE FEATURES */}
        <div className="bg-white p-8 rounded-lg border border-[#EAEAEA] shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-4">
            <h2 className="text-lg font-bold text-black">Características Técnicas</h2>
            <button type="button" onClick={addFeature} className="text-xs font-bold text-[#C1A87D] hover:underline uppercase flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">add</span> Agregar
            </button>
          </div>
          
          <div className="space-y-3">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <input type="text" placeholder="Ej. Material" className="w-1/3 bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none"
                  value={feature.key} onChange={e => updateFeature(idx, "key", e.target.value)} />
                <input type="text" placeholder="Ej. Piel Sintética" className="flex-1 bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none"
                  value={feature.value} onChange={e => updateFeature(idx, "value", e.target.value)} />
                <button type="button" onClick={() => removeFeature(idx)} className="material-symbols-outlined text-gray-400 hover:text-red-500 transition-colors">delete</button>
              </div>
            ))}
          </div>
        </div>

        {/* SHIPPING & CALCULATOR */}
        <div className="bg-white p-8 rounded-lg border border-[#EAEAEA] shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-black border-b border-[#EAEAEA] pb-4">Envío y Calculadora</h2>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase">Costo de Envío (Dejar en 0 para Envío Gratis)</label>
            <input required type="number" min="0" step="0.01" className="w-1/2 bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none" 
              value={formData.shipping_cost} onChange={e => setFormData({...formData, shipping_cost: e.target.value})} />
          </div>

          <div className="mt-6 bg-[#F9F9F9] border border-[#EAEAEA] rounded-md p-6">
            <h3 className="text-sm font-bold text-black mb-4">Simulador de Costo Final para el Cliente</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Producto</span>
                <span>${productPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Envío</span>
                <span>{shippingCost === 0 ? "Gratis" : `$${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-black font-bold border-t border-[#EAEAEA] pt-3 text-base">
                <span>Total a Pagar</span>
                <span>${totalCost.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => router.back()} className="px-6 py-3 border border-[#EAEAEA] rounded-md text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="px-8 py-3 bg-[#1C1C1C] text-white rounded-md text-sm font-bold uppercase tracking-wider hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2 min-w-[200px]">
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                Guardando...
              </>
            ) : "Guardar Cambios"}
          </button>
        </div>

      </form>
    </div>
  );
}
