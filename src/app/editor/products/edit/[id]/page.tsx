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

  const [condition, setCondition] = useState("Nuevo");
  
  const [taxes, setTaxes] = useState({
    applyIva: false,
    ivaPercentage: 16,
    applyIsr: false,
    isrPercentage: 1.25
  });
  
  const [details, setDetails] = useState({
    model: "",
    material: "",
    color: "",
    prod_width: "",
    prod_height: "",
    prod_length: "",
    weight: "",
    ship_width: "",
    ship_height: "",
    ship_length: ""
  });

  const [freeShipping, setFreeShipping] = useState(false);

  const [totalStock, setTotalStock] = useState("1");
  const [variants, setVariants] = useState<{ id: string; name: string; stock: string }[]>([]);
  const [features, setFeatures] = useState<{ key: string; value: string }[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [subcategories, setSubcategories] = useState<{ id: string; category_id: string; name: string }[]>([]);

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

        if (product.condition) setCondition(product.condition);
        if (product.variants) setVariants(product.variants);
        if (product.stock !== undefined) setTotalStock(product.stock.toString());

        setTaxes({
          applyIva: Number(product.iva_percentage || 0) > 0,
          ivaPercentage: Number(product.iva_percentage || 16),
          applyIsr: Number(product.isr_percentage || 0) > 0,
          isrPercentage: Number(product.isr_percentage || 1.25)
        });

        if (product.features) {
          const feats = { ...(product.features as Record<string, string>) };
          const getAndRemove = (key: string) => {
            const val = feats[key] || "";
            delete feats[key];
            return val;
          };

          // Remove known structural keys from features so they don't appear as free-form attributes
          getAndRemove("Modelo");
          getAndRemove("Material");
          getAndRemove("Color");
          getAndRemove("Peso");
          getAndRemove("Medidas del Producto");
          getAndRemove("Medidas de Envío");


          const loadedFeatures = Array.isArray(product.features) ? product.features : 
          (typeof product.features === "object" && product.features !== null ? 
            Object.entries(product.features).map(([k, v]) => ({ key: k, value: String(v) })) : []);

        const cleanFeatures = loadedFeatures.filter((f: { key: string }) => 
          f.key !== "Modelo" && f.key !== "Material" && f.key !== "Color" && f.key !== "Peso" && f.key !== "Medidas de Envío" && f.key !== "Medidas del Producto" && f.key !== "Envío Gratis"
        );
        setFeatures(cleanFeatures.length > 0 ? cleanFeatures : [{ key: "Marca", value: "Cloe" }]);

        if (product.features && !Array.isArray(product.features)) {
          const f = product.features as Record<string, string>;
          setDetails({
            model: f["Modelo"] || "",
            material: f["Material"] || "",
            color: f["Color"] || "",
            prod_width: f["Medidas del Producto"]?.split("x")[0]?.replace(/[^0-9.]/g, "") || "",
            prod_height: f["Medidas del Producto"]?.split("x")[1]?.replace(/[^0-9.]/g, "") || "",
            prod_length: f["Medidas del Producto"]?.split("x")[2]?.replace(/[^0-9.]/g, "") || "",
            weight: f["Peso"]?.replace(" kg", "") || "",
            ship_width: f["Medidas de Envío"]?.split("x")[0]?.replace("cm ", "") || "",
            ship_height: f["Medidas de Envío"]?.split("x")[1]?.replace("cm ", "") || "",
            ship_length: f["Medidas de Envío"]?.split("x")[2]?.replace("cm", "") || "",
          });
          
          if (f["Envío Gratis"] === "Sí") {
            setFreeShipping(true);
          }
        }
        } else {
          setFeatures([{ key: "Marca", value: "Cloe" }]);
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

  const addVariant = () => setVariants([...variants, { id: Math.random().toString(36).substring(7), name: "", stock: "0" }]);
  const removeVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index));
  const updateVariant = (index: number, field: "name" | "stock", val: string) => {
    const newVariants = [...variants];
    newVariants[index][field] = val;
    setVariants(newVariants);
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
  
  const ivaAmount = taxes.applyIva ? (productPrice * (taxes.ivaPercentage / 100)) : 0;
  const isrAmount = taxes.applyIsr ? (productPrice * (taxes.isrPercentage / 100)) : 0;
  const totalCostWithTaxes = totalCost + ivaAmount + isrAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const featureObj = features.reduce((acc, curr) => {
        if (curr.key) acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, string>);

      // Merge special details into features
      if (details.model) featureObj["Modelo"] = details.model;
      if (details.material) featureObj["Material"] = details.material;
      if (details.color) featureObj["Color"] = details.color;
      if (details.prod_width || details.prod_height || details.prod_length) {
        featureObj["Medidas del Producto"] = `${details.prod_width || 0}cm ancho x ${details.prod_height || 0}cm alto x ${details.prod_length || 0}cm largo`;
      }
      if (details.weight) featureObj["Peso"] = `${details.weight} kg`;
      if (details.ship_width || details.ship_height || details.ship_length) {
        featureObj["Medidas de Envío"] = `${details.ship_width || 0}cm x ${details.ship_height || 0}cm x ${details.ship_length || 0}cm`;
      }
      if (freeShipping) {
        featureObj["Envío Gratis"] = "Sí";
      }

      const cleanVariants = variants.map(v => ({
        id: v.id,
        name: v.name,
        stock: parseInt(v.stock) || 0
      })).filter(v => v.name.trim() !== "");

      const parsedTotalStock = parseInt(totalStock) || 1;

      if (cleanVariants.length > 0) {
        const sumVariants = cleanVariants.reduce((sum, v) => sum + v.stock, 0);
        if (sumVariants !== parsedTotalStock) {
          alert(`La suma del stock de las variantes (${sumVariants}) debe ser igual al stock total (${parsedTotalStock}).`);
          setLoading(false);
          return;
        }
      }

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
        condition: condition,
        variants: cleanVariants.length > 0 ? cleanVariants : null,
        stock: parsedTotalStock,
        iva_percentage: taxes.applyIva ? taxes.ivaPercentage : 0,
        isr_percentage: taxes.applyIsr ? taxes.isrPercentage : 0
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
                    <Image src={src} alt="Existente" fill className="object-cover" />
                    <button type="button" onClick={() => removeExistingImage(idx)} className="absolute top-1 right-1 bg-white rounded-full w-6 h-6 flex items-center justify-center text-red-500 shadow-sm hover:bg-red-50 transition-colors">
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                ))}
                {previews.map((src, idx) => (
                  <div key={`new-${idx}`} className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden border border-green-500">
                    <Image src={src} alt="Preview" fill className="object-cover" />
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
              <label className="text-xs font-bold text-gray-700 uppercase">Estado del Producto</label>
              <select className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none"
                value={condition} onChange={e => setCondition(e.target.value)}>
                <option value="Nuevo">Nuevo</option>
                <option value="Seminuevo">Seminuevo</option>
                <option value="Usado">Usado</option>
              </select>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase">Descripción</label>
              <textarea required rows={4} className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none resize-none" 
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Describe el producto detalladamente..." />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase">Stock Total (Piezas)</label>
              <input required type="number" min="1" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none h-[116px] text-4xl text-center font-black" 
                value={totalStock} onChange={e => setTotalStock(e.target.value)} placeholder="Ej. 100" />
            </div>
          </div>
        </div>

        {/* VARIANTS (STOCK) */}
        <div className="bg-white p-8 rounded-lg border border-[#EAEAEA] shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-4">
            <div>
              <h2 className="text-lg font-bold text-black">Inventario por Variantes</h2>
              <p className="text-xs text-gray-500">Añade stock separado por Talla o Color. El stock total asignado debe coincidir con el Stock Total.</p>
              {variants.length > 0 && (
                <p className={`text-xs mt-2 font-bold ${Number(totalStock) === variants.reduce((s,v) => s + (parseInt(v.stock)||0), 0) ? 'text-green-600' : 'text-red-500'}`}>
                  Asignado: {variants.reduce((s,v) => s + (parseInt(v.stock)||0), 0)} de {totalStock} piezas.
                </p>
              )}
            </div>
            <button type="button" onClick={addVariant} className="text-xs font-bold text-white bg-black px-4 py-2 rounded-md uppercase flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">add</span> Añadir Variante
            </button>
          </div>
          
          <div className="space-y-3">
            {variants.length === 0 ? (
              <p className="text-sm text-gray-400 italic">No hay variantes creadas.</p>
            ) : variants.map((variant, idx) => (
              <div key={variant.id} className="flex items-center gap-4 bg-[#F9F9F9] p-3 rounded-md border border-[#EAEAEA]">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Nombre (Ej: Rojo - Talla S)</label>
                  <input type="text" placeholder="Ej. Rojo - Talla S" className="w-full bg-white border border-[#EAEAEA] rounded-md p-2 text-sm focus:ring-1 focus:ring-black outline-none"
                    value={variant.name} onChange={e => updateVariant(idx, "name", e.target.value)} />
                </div>
                <div className="w-1/3 space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Stock (Piezas)</label>
                  <input type="number" min="0" placeholder="0" className="w-full bg-white border border-[#EAEAEA] rounded-md p-2 text-sm focus:ring-1 focus:ring-black outline-none"
                    value={variant.stock} onChange={e => updateVariant(idx, "stock", e.target.value)} />
                </div>
                <button type="button" onClick={() => removeVariant(idx)} className="mt-5 material-symbols-outlined text-gray-400 hover:text-red-500 transition-colors">delete</button>
              </div>
            ))}
          </div>
        </div>

        {/* DETALLES FÍSICOS */}
        <div className="bg-white p-8 rounded-lg border border-[#EAEAEA] shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-black border-b border-[#EAEAEA] pb-4">Detalles Físicos del Producto</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase">Modelo</label>
              <input type="text" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none" 
                value={details.model} onChange={e => setDetails({...details, model: e.target.value})} placeholder="Ej. CL-2026" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase">Color General</label>
              <input type="text" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none" 
                value={details.color} onChange={e => setDetails({...details, color: e.target.value})} placeholder="Ej. Negro" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase">Material</label>
              <input type="text" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none" 
                value={details.material} onChange={e => setDetails({...details, material: e.target.value})} placeholder="Ej. Piel Sintética" />
            </div>
          </div>
          
          <div>
            <label className="text-xs font-bold text-gray-700 uppercase mb-2 block">Medidas del Producto (cm)</label>
            <div className="flex gap-4">
              <input type="number" placeholder="Ancho" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none" 
                value={details.prod_width} onChange={e => setDetails({...details, prod_width: e.target.value})} />
              <input type="number" placeholder="Alto" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none" 
                value={details.prod_height} onChange={e => setDetails({...details, prod_height: e.target.value})} />
              <input type="number" placeholder="Largo" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none" 
                value={details.prod_length} onChange={e => setDetails({...details, prod_length: e.target.value})} />
            </div>
          </div>

          <div className="pt-4 border-t border-[#EAEAEA]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-black">Otras Características</h3>
              <button type="button" onClick={addFeature} className="text-xs font-bold text-[#C1A87D] hover:underline uppercase flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">add</span> Agregar Atributo Libre
              </button>
            </div>
            <div className="space-y-3">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <input type="text" placeholder="Ej. Garantía" className="w-1/3 bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none"
                    value={feature.key} onChange={e => updateFeature(idx, "key", e.target.value)} />
                  <input type="text" placeholder="Ej. 1 Año" className="flex-1 bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none"
                    value={feature.value} onChange={e => updateFeature(idx, "value", e.target.value)} />
                  <button type="button" onClick={() => removeFeature(idx)} className="material-symbols-outlined text-gray-400 hover:text-red-500 transition-colors">delete</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* IMPUESTOS (IVA / ISR) */}
        <div className="bg-white p-8 rounded-lg border border-[#EAEAEA] shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-black border-b border-[#EAEAEA] pb-4">Impuestos (Facturación)</h2>
          <p className="text-xs text-gray-500 mb-4">Configura si este producto cobra impuestos adicionales cuando el cliente solicita factura (con RFC).</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-black" 
                  checked={taxes.applyIva} onChange={e => setTaxes({...taxes, applyIva: e.target.checked})} />
                <span className="text-sm font-bold text-black uppercase">Cobrar IVA</span>
              </label>
              {taxes.applyIva && (
                <div className="pl-7 space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Porcentaje de IVA (%)</label>
                  <input type="number" min="0" step="0.01" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none" 
                    value={taxes.ivaPercentage} onChange={e => setTaxes({...taxes, ivaPercentage: Number(e.target.value)})} />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-black" 
                  checked={taxes.applyIsr} onChange={e => setTaxes({...taxes, applyIsr: e.target.checked})} />
                <span className="text-sm font-bold text-black uppercase">Cobrar ISR</span>
              </label>
              {taxes.applyIsr && (
                <div className="pl-7 space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">Porcentaje de ISR (%)</label>
                  <input type="number" min="0" step="0.01" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none" 
                    value={taxes.isrPercentage} onChange={e => setTaxes({...taxes, isrPercentage: Number(e.target.value)})} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SHIPPING & CALCULATOR */}
        <div className="bg-white p-8 rounded-lg border border-[#EAEAEA] shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-black border-b border-[#EAEAEA] pb-4">Logística y Envío</h2>
          
          <div className="mb-6 bg-green-50 border border-green-100 p-4 rounded-md">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 accent-green-600" 
                checked={freeShipping} onChange={e => setFreeShipping(e.target.checked)} />
              <span className="text-sm font-bold text-green-900 uppercase">Ofrecer Envío Gratis en este producto</span>
            </label>
            <p className="text-xs text-green-700 pl-8 mt-1">Si activas esto, el cliente pagará $0 por el envío de este producto y el sistema omitirá la creación de guía automática en INDELI para el mismo.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase">Costo de Envío Manual (Ignorado si hay Envío Gratis)</label>
              <input required type="number" min="0" step="0.01" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none disabled:opacity-50" 
                value={freeShipping ? 0 : formData.shipping_cost} 
                onChange={e => setFormData({...formData, shipping_cost: e.target.value})}
                disabled={freeShipping} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase">Peso del Paquete (kg)</label>
              <input type="number" step="0.01" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none" 
                value={details.weight} onChange={e => setDetails({...details, weight: e.target.value})} placeholder="Ej. 1.5" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 uppercase mb-2 block">Medidas Volumétricas del Paquete (cm)</label>
            <div className="flex gap-4">
              <input type="number" placeholder="Ancho (Empaque)" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none" 
                value={details.ship_width} onChange={e => setDetails({...details, ship_width: e.target.value})} />
              <input type="number" placeholder="Alto (Empaque)" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none" 
                value={details.ship_height} onChange={e => setDetails({...details, ship_height: e.target.value})} />
              <input type="number" placeholder="Largo (Empaque)" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none" 
                value={details.ship_length} onChange={e => setDetails({...details, ship_length: e.target.value})} />
            </div>
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
                <span>Subtotal</span>
                <span>${totalCost.toFixed(2)}</span>
              </div>
              {(taxes.applyIva || taxes.applyIsr) && (
                <>
                  <div className="border-t border-[#EAEAEA] pt-3 mt-3">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">Cargos Adicionales Configurables:</p>
                  </div>
                  {taxes.applyIva && (
                    <div className="flex justify-between text-gray-600">
                      <span>IVA Adicional ({taxes.ivaPercentage}%)</span>
                      <span>+ ${ivaAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {taxes.applyIsr && (
                    <div className="flex justify-between text-gray-600">
                      <span>ISR ({taxes.isrPercentage}%)</span>
                      <span>+ ${isrAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-primary font-bold pt-2 text-base">
                    <span>Total Final</span>
                    <span>${totalCostWithTaxes.toFixed(2)}</span>
                  </div>
                </>
              )}
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
