"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function CouponsPage() {
  const router = useRouter();
  const supabase = createClient();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    min_purchase_amount: "0",
    max_uses: "",
    expires_at: "",
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    if (!error && data) {
      setCoupons(data);
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.discount_value) {
      alert("Por favor llena los campos obligatorios");
      return;
    }

    const { error } = await supabase.from("coupons").insert({
      code: formData.code.toUpperCase().trim(),
      discount_type: formData.discount_type,
      discount_value: parseFloat(formData.discount_value),
      min_purchase_amount: parseFloat(formData.min_purchase_amount) || 0,
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
      expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
    });

    if (error) {
      alert("Error al crear cupón. Puede que el código ya exista.");
      return;
    }

    setShowForm(false);
    setFormData({
      code: "",
      discount_type: "percentage",
      discount_value: "",
      min_purchase_amount: "0",
      max_uses: "",
      expires_at: "",
    });
    fetchCoupons();
  };

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from("coupons").update({ active: !current }).eq("id", id);
    if (!error) {
      fetchCoupons();
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este cupón?")) return;
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (!error) {
      fetchCoupons();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">Cupones de Descuento</h1>
          <p className="text-gray-500 text-sm">Gestiona códigos de descuento para tus clientes.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-black text-white px-6 py-3 rounded-md font-bold uppercase text-xs tracking-widest hover:bg-gray-800 transition-colors"
        >
          {showForm ? "Cancelar" : "+ Nuevo Cupón"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-8 rounded-lg border border-[#EAEAEA] shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-black border-b border-[#EAEAEA] pb-4">Crear Nuevo Cupón</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase">Código (Ej. BUENFIN20)</label>
              <input required type="text" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none uppercase" 
                value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="Código" />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase">Tipo de Descuento</label>
              <select className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none"
                value={formData.discount_type} onChange={e => setFormData({...formData, discount_type: e.target.value})}>
                <option value="percentage">Porcentaje (%)</option>
                <option value="fixed">Monto Fijo ($ MXN)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase">Valor del Descuento</label>
              <input required type="number" min="0" step="0.01" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none" 
                value={formData.discount_value} onChange={e => setFormData({...formData, discount_value: e.target.value})} placeholder={formData.discount_type === 'percentage' ? "Ej. 20" : "Ej. 500"} />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase">Compra Mínima ($ MXN)</label>
              <input type="number" min="0" step="0.01" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none" 
                value={formData.min_purchase_amount} onChange={e => setFormData({...formData, min_purchase_amount: e.target.value})} placeholder="0.00" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase">Límite de Usos Global (Opcional)</label>
              <input type="number" min="1" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none" 
                value={formData.max_uses} onChange={e => setFormData({...formData, max_uses: e.target.value})} placeholder="Ej. 100" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase">Fecha de Caducidad (Opcional)</label>
              <input type="datetime-local" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none" 
                value={formData.expires_at} onChange={e => setFormData({...formData, expires_at: e.target.value})} />
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <button type="submit" className="bg-black text-white px-8 py-3 rounded-md font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors">
              Guardar Cupón
            </button>
          </div>
        </form>
      )}

      {/* Lista de Cupones */}
      <div className="bg-white rounded-lg border border-[#EAEAEA] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando cupones...</div>
        ) : coupons.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No hay cupones creados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F9F9F9] border-b border-[#EAEAEA] text-xs uppercase tracking-widest text-gray-500">
                  <th className="p-4 font-bold">Código</th>
                  <th className="p-4 font-bold">Descuento</th>
                  <th className="p-4 font-bold">Compra Min.</th>
                  <th className="p-4 font-bold">Usos</th>
                  <th className="p-4 font-bold">Caducidad</th>
                  <th className="p-4 font-bold">Estado</th>
                  <th className="p-4 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id} className="border-b border-[#EAEAEA] hover:bg-gray-50">
                    <td className="p-4 font-bold">{c.code}</td>
                    <td className="p-4 text-sm font-semibold text-green-600">
                      {c.discount_type === 'percentage' ? `${c.discount_value}%` : `$${c.discount_value} MXN`}
                    </td>
                    <td className="p-4 text-sm text-gray-600">${c.min_purchase_amount}</td>
                    <td className="p-4 text-sm text-gray-600">
                      {c.uses_count} / {c.max_uses || '∞'}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'Sin caducidad'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${c.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {c.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => toggleActive(c.id, c.active)} className="text-xs font-bold uppercase text-gray-500 hover:text-black transition-colors">
                        {c.active ? 'Desactivar' : 'Activar'}
                      </button>
                      <span className="text-gray-300">|</span>
                      <button onClick={() => deleteCoupon(c.id)} className="text-xs font-bold uppercase text-red-500 hover:text-red-700 transition-colors">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
