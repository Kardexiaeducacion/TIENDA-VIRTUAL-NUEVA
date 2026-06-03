"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function AdminOrdersPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      const { data } = await supabase.from("orders").select(`
        *, 
        profiles(full_name, email),
        order_items (
          quantity,
          price_at_time,
          products (name, images)
        )
      `).order("created_at", { ascending: false });
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

  const updateTracking = async (id: string, tracking_number: string, tracking_url: string) => {
    const { error } = await supabase.from("orders").update({ tracking_number, tracking_url }).eq("id", id);
    if (!error) {
      setOrders(orders.map(o => o.id === id ? { ...o, tracking_number, tracking_url } : o));
      alert("Rastreo actualizado correctamente");
    } else {
      alert("Error actualizando rastreo");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida': return 'bg-green-100 text-green-800';
      case 'en proceso': return 'bg-blue-100 text-blue-800';
      case 'reporte': return 'bg-red-100 text-red-800';
      case 'entregado': return 'bg-green-200 text-green-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-black mb-2">Ventas y Pedidos</h1>
        <p className="text-gray-500 text-sm">Gestiona los pedidos de tus clientes, envíos y su estado.</p>
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

      <div className="space-y-4 mt-8">
        {loading ? (
          <div className="p-12 text-center text-gray-500 bg-white rounded-lg border border-[#EAEAEA]">Cargando ventas...</div>
        ) : orders.filter(order => {
            const idStr = (order.id as string).split("-")[0].toUpperCase();
            const nameStr = ((order.profiles as any)?.full_name || "").toLowerCase();
            const q = searchQuery.toLowerCase();
            return idStr.includes(q) || nameStr.includes(q);
          }).length > 0 ? (
          orders.filter(order => {
            const idStr = (order.id as string).split("-")[0].toUpperCase();
            const nameStr = ((order.profiles as any)?.full_name || "").toLowerCase();
            const q = searchQuery.toLowerCase();
            return idStr.includes(q) || nameStr.includes(q);
          }).map((order: any) => {
            const isExpanded = expandedOrderId === order.id;
            let addressInfo = null;
            try { addressInfo = order.shipping_address ? JSON.parse(order.shipping_address) : null; } catch (e) {}

            return (
              <div key={order.id} className="bg-white rounded-lg border border-[#EAEAEA] shadow-sm overflow-hidden">
                {/* Cabecera del pedido (siempre visible) */}
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                >
                  <div className="flex items-center gap-8">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">ID Pedido</p>
                      <p className="font-mono font-bold">{order.id.split("-")[0].toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Fecha</p>
                      <p className="font-semibold text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Cliente</p>
                      <p className="font-semibold text-sm">{order.profiles?.full_name || "Anónimo"} ({order.profiles?.email || "Sin email"})</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total Pagado</p>
                      <p className="font-bold text-green-700">${Number(order.total_amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <select 
                      value={order.status}
                      onChange={(e) => { e.stopPropagation(); updateStatus(order.id, e.target.value); }}
                      onClick={(e) => e.stopPropagation()}
                      className={`text-[11px] font-bold uppercase rounded-md tracking-wider px-3 py-2 outline-none cursor-pointer border border-transparent transition-colors ${getStatusColor(order.status)}`}
                    >
                      <option value="en proceso" className="bg-white text-black">En Proceso</option>
                      <option value="concluida" className="bg-white text-black">Concluida</option>
                      <option value="reporte" className="bg-white text-black">Reporte</option>
                    </select>
                    <span className="material-symbols-outlined text-gray-400">
                      {isExpanded ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>
                </div>

                {/* Detalles Expandidos */}
                {isExpanded && (
                  <div className="border-t border-[#EAEAEA] p-6 bg-[#F9F9F9] grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Columna 1: Productos y Precios */}
                    <div>
                      <h3 className="font-bold text-sm uppercase tracking-widest border-b border-[#EAEAEA] pb-2 mb-4">Productos en la Orden</h3>
                      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                        {order.order_items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex gap-4 items-center bg-white p-3 border border-[#EAEAEA] rounded-md">
                            <img src={item.products?.images?.[0]} alt={item.products?.name} className="w-12 h-12 object-cover rounded-md" />
                            <div className="flex-1">
                              <p className="font-bold text-sm">{item.products?.name}</p>
                              <p className="text-xs text-gray-500">Cantidad: {item.quantity} x ${item.price_at_time}</p>
                            </div>
                            <p className="font-bold">${(item.quantity * item.price_at_time).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 space-y-2 text-sm bg-white p-4 border border-[#EAEAEA] rounded-md">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Subtotal de productos:</span>
                          <span>${order.order_items?.reduce((acc: number, item: any) => acc + (item.quantity * item.price_at_time), 0).toFixed(2)}</span>
                        </div>
                        {order.discount_amount > 0 && (
                          <div className="flex justify-between text-green-600 font-bold">
                            <span>Descuento (Cupón {order.coupon_code || ''}):</span>
                            <span>- ${Number(order.discount_amount).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-lg pt-2 border-t border-[#EAEAEA] mt-2">
                          <span>Total Pagado:</span>
                          <span>${Number(order.total_amount).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Columna 2: Envío y Rastreo */}
                    <div className="space-y-8">
                      <div>
                        <h3 className="font-bold text-sm uppercase tracking-widest border-b border-[#EAEAEA] pb-2 mb-4">Dirección de Envío</h3>
                        {addressInfo ? (
                          <div className="bg-white p-4 border border-[#EAEAEA] rounded-md text-sm text-gray-700 leading-relaxed">
                            <p className="font-bold text-black">{addressInfo.contact}</p>
                            <p>{addressInfo.street} Ext: {addressInfo.num_ext} {addressInfo.num_int ? `Int: ${addressInfo.num_int}` : ''}</p>
                            <p>Col. {addressInfo.colony}, C.P. {addressInfo.cp}</p>
                            <p>{addressInfo.city}, {addressInfo.state}</p>
                            <p className="mt-2 text-xs font-bold text-gray-500 uppercase">Teléfono:</p>
                            <p>{addressInfo.phone}</p>
                            {addressInfo.reference && (
                              <>
                                <p className="mt-2 text-xs font-bold text-gray-500 uppercase">Referencias:</p>
                                <p>{addressInfo.reference}</p>
                              </>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 bg-white p-4 border border-[#EAEAEA] rounded-md">No se registró dirección.</p>
                        )}
                      </div>

                      <div>
                        <h3 className="font-bold text-sm uppercase tracking-widest border-b border-[#EAEAEA] pb-2 mb-4">Logística y Rastreo</h3>
                        <div className="bg-white p-4 border border-[#EAEAEA] rounded-md space-y-4">
                          <p className="text-xs text-gray-500">Aquí puedes actualizar la información de envío, ideal para compras con "Envío Gratis" donde la guía se generó fuera de la plataforma.</p>
                          <form 
                            onSubmit={(e) => {
                              e.preventDefault();
                              const formData = new FormData(e.currentTarget);
                              updateTracking(order.id, formData.get("tracking") as string, formData.get("url") as string);
                            }}
                            className="space-y-3"
                          >
                            <div>
                              <label className="text-xs font-bold text-gray-700 uppercase">Número de Rastreo (o Paquetería)</label>
                              <input 
                                name="tracking"
                                defaultValue={order.tracking_number || ""}
                                type="text" 
                                className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-2 text-sm focus:ring-1 focus:ring-black outline-none" 
                                placeholder="Ej. FedEx - 123456789"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-bold text-gray-700 uppercase">URL de Rastreo (Opcional)</label>
                              <input 
                                name="url"
                                defaultValue={order.tracking_url || ""}
                                type="url" 
                                className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-2 text-sm focus:ring-1 focus:ring-black outline-none" 
                                placeholder="Ej. https://fedex.com/track..."
                              />
                            </div>
                            <button type="submit" className="bg-black text-white px-4 py-2 rounded-md text-xs font-bold uppercase w-full">Guardar Rastreo</button>
                          </form>
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center text-gray-500 bg-white rounded-lg border border-[#EAEAEA]">
            <span className="material-symbols-outlined text-4xl mb-2 text-gray-300">receipt_long</span>
            <p className="text-sm">No se encontraron ventas con ese criterio.</p>
          </div>
        )}
      </div>
    </div>
  );
}
