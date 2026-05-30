"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function AdminOrdersPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      // For a real app, we'd join with profiles to get the user's name
      // using: select("*, profiles(full_name)")
      const { data } = await supabase.from("orders").select("*, profiles(full_name)").order("created_at", { ascending: false });
      setOrders(data || []);
      setLoading(false);
    }
    fetchOrders();
  }, [supabase]);

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", id);
    if (!error) {
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } else {
      alert("Error actualizando estatus");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida': return 'bg-green-100 text-green-800';
      case 'en proceso': return 'bg-blue-100 text-blue-800';
      case 'reporte': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-black mb-2">Ventas y Pedidos</h1>
        <p className="text-gray-500 text-sm">Gestiona los pedidos de tus clientes y cambia su estado.</p>
      </div>

      <div className="flex items-center bg-white border border-[#EAEAEA] rounded-md px-4 py-2 w-full max-w-md shadow-sm">
        <span className="material-symbols-outlined text-gray-400 mr-2">search</span>
        <input 
          type="text"
          placeholder="Buscar por ID de Pedido o Cliente..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-sm outline-none bg-transparent placeholder-gray-400"
        />
      </div>

      <div className="bg-white rounded-lg border border-[#EAEAEA] shadow-sm overflow-hidden mt-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9F9F9] border-b border-[#EAEAEA] text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-4 pl-6">ID Pedido</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Total</th>
                <th className="p-4">Estado</th>
                <th className="p-4 pr-6 text-right">Guía de Envío</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEA]">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Cargando ventas...</td></tr>
              ) : orders.filter(order => {
                  const idStr = (order.id as string).split("-")[0].toUpperCase();
                  const nameStr = ((order.profiles as any)?.full_name || "").toLowerCase();
                  const q = searchQuery.toLowerCase();
                  return idStr.toLowerCase().includes(q) || nameStr.includes(q);
                }).length > 0 ? (
                orders.filter(order => {
                  const idStr = (order.id as string).split("-")[0].toUpperCase();
                  const nameStr = ((order.profiles as any)?.full_name || "").toLowerCase();
                  const q = searchQuery.toLowerCase();
                  return idStr.toLowerCase().includes(q) || nameStr.includes(q);
                }).map((order) => (
                  <tr key={order.id as string} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 pl-6 font-mono text-xs text-gray-600">{(order.id as string).split("-")[0].toUpperCase()}</td>
                    <td className="p-4 text-sm font-bold text-black">{(order.profiles as any)?.full_name || "Cliente Eliminado"}</td>
                    <td className="p-4 text-sm text-gray-600">{new Date(order.created_at as string).toLocaleDateString()}</td>
                    <td className="p-4 text-sm font-bold text-black">${Number(order.total_amount).toLocaleString()}</td>
                    <td className="p-4">
                      <select 
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className={`text-[11px] font-bold uppercase rounded-md tracking-wider px-2 py-1 outline-none cursor-pointer border border-transparent hover:border-gray-300 transition-colors ${getStatusColor(order.status)}`}
                      >
                        <option value="en proceso" className="bg-white text-black">En Proceso</option>
                        <option value="concluida" className="bg-white text-black">Concluida</option>
                        <option value="reporte" className="bg-white text-black">Reporte</option>
                      </select>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button className="text-xs font-bold text-[#C1A87D] hover:underline uppercase">Generar Guía</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500">
                    <span className="material-symbols-outlined text-4xl mb-2 text-gray-300">receipt_long</span>
                    <p className="text-sm">Aún no tienes ventas. ¡Pronto llegarán!</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
