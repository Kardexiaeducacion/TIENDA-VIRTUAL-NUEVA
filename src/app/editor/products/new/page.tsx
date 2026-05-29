"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    shipping_cost: "0",
    images: "",
  });

  const [features, setFeatures] = useState<{ key: string; value: string }[]>([
    { key: "Marca", value: "Cloe" },
    { key: "Material", value: "" },
  ]);

  const addFeature = () => setFeatures([...features, { key: "", value: "" }]);
  const removeFeature = (index: number) => setFeatures(features.filter((_, i) => i !== index));
  const updateFeature = (index: number, field: "key" | "value", val: string) => {
    const newFeatures = [...features];
    newFeatures[index][field] = val;
    setFeatures(newFeatures);
  };

  const productPrice = Number(formData.price) || 0;
  const shippingCost = Number(formData.shipping_cost) || 0;
  const totalCost = productPrice + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const featureObj = features.reduce((acc, curr) => {
      if (curr.key) acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    const imageUrls = formData.images.split(",").map(url => url.trim()).filter(url => url);

    const { error } = await supabase.from("products").insert({
      name: formData.name,
      price: productPrice,
      description: formData.description,
      shipping_cost: shippingCost,
      images: imageUrls,
      features: featureObj,
    });

    setLoading(false);

    if (error) {
      alert("Error al guardar el producto: " + error.message);
    } else {
      router.push("/editor/products");
      router.refresh();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-black mb-2">Nuevo Producto</h1>
        <p className="text-gray-500 text-sm">Completa los detalles para publicar un nuevo artículo en la tienda.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
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
              <label className="text-xs font-bold text-gray-700 uppercase">Precio (MXN)</label>
              <input required type="number" min="0" step="0.01" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none" 
                value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="0.00" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase">Descripción</label>
            <textarea required rows={4} className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none resize-none" 
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe el producto detalladamente..." />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase">Imágenes (URLs separadas por comas)</label>
            <input type="text" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none" 
              value={formData.images} onChange={e => setFormData({...formData, images: e.target.value})} placeholder="https://ejemplo.com/foto1.jpg, https://ejemplo.com/foto2.jpg" />
            <p className="text-xs text-gray-500">Pega enlaces directos a las imágenes. La primera será la imagen principal.</p>
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
          <button type="submit" disabled={loading} className="px-8 py-3 bg-[#1C1C1C] text-white rounded-md text-sm font-bold uppercase tracking-wider hover:bg-black transition-colors disabled:opacity-50">
            {loading ? "Publicando..." : "Publicar Producto"}
          </button>
        </div>

      </form>
    </div>
  );
}
