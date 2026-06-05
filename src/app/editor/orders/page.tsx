"use client";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

const PAYMENT_STATUS: Record<string, { label: string; color: string }> = {
  pending:        { label: "Sin comprobante",       color: "bg-gray-100 text-gray-500" },
  proof_uploaded: { label: "Comprobante subido",    color: "bg-amber-100 text-amber-700" },
  verified:       { label: "Pago verificado ✓",     color: "bg-green-100 text-green-700" },
  rejected:       { label: "Rechazado",             color: "bg-red-100 text-red-600" },
};

export default function AdminOrdersPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [uploadingLabel, setUploadingLabel] = useState<string | null>(null);
  const labelFileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [trackingInputs, setTrackingInputs] = useState<Record<string, { num: string; url: string }>>({});

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", id);
    if (!error) setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    else alert("Error actualizando estatus");
  };

  const verifyPayment = async (id: string) => {
    setVerifying(id);
    const { error } = await supabase.from("orders").update({ payment_status: "verified", status: "confirmado" }).eq("id", id);
    if (!error) await fetchOrders();
    else alert("Error al verificar pago");
    setVerifying(null);
  };

  const rejectPayment = async (id: string) => {
    const { error } = await supabase.from("orders").update({ payment_status: "rejected" }).eq("id", id);
    if (!error) await fetchOrders();
  };

  const updateTracking = async (id: string) => {
    const t = trackingInputs[id] || { num: "", url: "" };
    const { error } = await supabase.from("orders").update({ tracking_number: t.num, tracking_url: t.url }).eq("id", id);
    if (!error) {
      await fetchOrders();
      alert("Rastreo guardado correctamente");
    } else alert("Error actualizando rastreo");
  };

  const uploadShippingLabel = async (id: string, file: File) => {
    setUploadingLabel(id);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `label-${id}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("payment-proofs").upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("payment-proofs").getPublicUrl(fileName);
      await supabase.from("orders").update({ tracking_url: urlData.publicUrl, status: "etiqueta generada" }).eq("id", id);
      await fetchOrders();
      alert("Etiqueta subida correctamente");
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setUploadingLabel(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida': return 'bg-green-100 text-green-800';
      case 'confirmado': return 'bg-emerald-100 text-emerald-800';
      case 'en proceso': return 'bg-blue-100 text-blue-800';
      case 'etiqueta generada': return 'bg-purple-100 text-purple-800';
      case 'reporte': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filtered = orders.filter((order: any) => {
    const idStr = (order.id as string).split("-")[0].toUpperCase();
    let addressInfo: any = null;
    try { addressInfo = order.shipping_address ? JSON.parse(order.shipping_address) : null; } catch (e) {}
    const nameStr = (addressInfo?.contact || "").toLowerCase();
    const q = searchQuery.toLowerCase();
    return idStr.includes(q) || nameStr.includes(q);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-black mb-2">Ventas y Pedidos</h1>
        <p className="text-gray-500 text-sm">Gestiona los pedidos, verifica pagos y administra envíos.</p>
      </div>

      <div className="flex items-center bg-white border border-[#EAEAEA] rounded-md px-4 py-2 w-full max-w-md shadow-sm">
        <span className="material-symbols-outlined text-gray-400 mr-2">search</span>
        <input type="text" placeholder="Buscar por ID de Pedido o Cliente..." value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} className="w-full text-sm outline-none bg-transparent placeholder-gray-400" />
      </div>

      <div className="space-y-4 mt-8">
        {loading ? (
          <div className="p-12 text-center text-gray-500 bg-white rounded-lg border border-[#EAEAEA]">Cargando ventas...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500 bg-white rounded-lg border border-[#EAEAEA]">
            <span className="material-symbols-outlined text-4xl mb-2 text-gray-300">receipt_long</span>
            <p className="text-sm">No se encontraron ventas.</p>
          </div>
        ) : filtered.map((order: any) => {
          const isExpanded = expandedOrderId === order.id;
          let addressInfo: any = null;
          try { addressInfo = order.shipping_address ? JSON.parse(order.shipping_address) : null; } catch (e) {}
          const ps = PAYMENT_STATUS[order.payment_status] || PAYMENT_STATUS.pending;
          const hasProof = order.payment_tracking_key || order.payment_proof_url;

          return (
            <div key={order.id} className="bg-white rounded-lg border border-[#EAEAEA] shadow-sm overflow-hidden">
              {/* Header Row */}
              <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}>
                <div className="flex items-center gap-6 flex-wrap">
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
                    <p className="font-semibold text-sm">{addressInfo?.contact || "Anónimo"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Total</p>
                    <p className="font-bold text-green-700">${Number(order.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Método Pago</p>
                    <p className="text-sm font-bold capitalize">{order.payment_method === "spei" ? "SPEI" : order.payment_method === "oxxo" ? "OXXO" : "—"}</p>
                  </div>
                  {/* Payment status badge */}
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${ps.color}`}>
                    {ps.label}
                    {order.payment_status === "proof_uploaded" && (
                      <span className="ml-1 w-2 h-2 bg-amber-500 rounded-full inline-block animate-pulse" />
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <select value={order.status} onChange={(e) => { e.stopPropagation(); updateStatus(order.id, e.target.value); }}
                    onClick={(e) => e.stopPropagation()}
                    className={`text-[11px] font-bold uppercase rounded-md tracking-wider px-3 py-2 outline-none cursor-pointer border border-transparent transition-colors ${getStatusColor(order.status)}`}>
                    <option value="en proceso">En Proceso</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="etiqueta generada">Etiqueta Generada</option>
                    <option value="concluida">Concluida</option>
                    <option value="reporte">Reporte</option>
                  </select>
                  <span className="material-symbols-outlined text-gray-400">{isExpanded ? 'expand_less' : 'expand_more'}</span>
                </div>
              </div>

              {/* Expanded */}
              {isExpanded && (
                <div className="border-t border-[#EAEAEA] p-6 bg-[#F9F9F9] grid grid-cols-1 md:grid-cols-3 gap-8">
                  
                  {/* Column 1: Products */}
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-widest border-b border-[#EAEAEA] pb-2 mb-4">Productos</h3>
                    <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-3 items-center bg-white p-3 border border-[#EAEAEA] rounded-md">
                          <img src={item.image || "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800"} alt={item.name} className="w-12 h-12 object-cover rounded-md" />
                          <div className="flex-1">
                            <p className="font-bold text-sm">{item.name}</p>
                            {item.variantName && <p className="text-xs text-gray-500 mt-0.5">{item.variantName}</p>}
                            <p className="text-xs text-gray-500">{item.quantity} x ${item.price}</p>
                          </div>
                          <p className="font-bold text-sm">${(item.quantity * item.price).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 bg-white p-3 border border-[#EAEAEA] rounded-md text-sm">
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>${Number(order.total_amount).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Payment Proof */}
                  <div>
                    <h3 className="font-bold text-sm uppercase tracking-widest border-b border-[#EAEAEA] pb-2 mb-4">Comprobante de Pago</h3>
                    
                    {hasProof ? (
                      <div className="space-y-3">
                        {order.payment_tracking_key && (
                          <div className="bg-white border border-[#EAEAEA] rounded-md p-3">
                            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Clave de rastreo del cliente</p>
                            <p className="font-mono font-bold text-sm break-all">{order.payment_tracking_key}</p>
                          </div>
                        )}
                        {order.payment_proof_url && (
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Baucher subido por el cliente</p>
                            <a href={order.payment_proof_url} target="_blank" rel="noopener noreferrer">
                              <img src={order.payment_proof_url} alt="Comprobante" className="w-full rounded-lg border border-gray-200 hover:opacity-90 transition-opacity cursor-zoom-in max-h-40 object-contain" />
                              <p className="text-xs text-blue-500 text-center mt-1">Ver imagen completa ↗</p>
                            </a>
                          </div>
                        )}
                        {order.payment_status === "proof_uploaded" && (
                          <div className="flex flex-col gap-2 pt-2">
                            <button onClick={() => verifyPayment(order.id)} disabled={verifying === order.id}
                              className="w-full py-2.5 bg-green-600 text-white font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                              <span className="material-symbols-outlined text-[16px]">check_circle</span>
                              {verifying === order.id ? "Verificando..." : "Verificar Pago"}
                            </button>
                            <button onClick={() => rejectPayment(order.id)}
                              className="w-full py-2.5 border border-red-200 text-red-500 font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
                              <span className="material-symbols-outlined text-[16px]">cancel</span>
                              Rechazar
                            </button>
                          </div>
                        )}
                        {order.payment_status === "verified" && (
                          <div className="bg-green-50 rounded-lg p-3 text-center text-green-700 font-bold text-xs flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">verified</span>
                            Pago verificado — Pedido confirmado
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-white border border-[#EAEAEA] rounded-md p-6 text-center text-gray-400">
                        <span className="material-symbols-outlined text-[36px] block mb-2">hourglass_empty</span>
                        <p className="text-xs">El cliente aún no ha subido su comprobante</p>
                        {order.payment_status === "proof_uploaded" && (
                          <div className="flex flex-col gap-2 mt-3">
                            <button onClick={() => verifyPayment(order.id)} disabled={verifying === order.id}
                              className="w-full py-2 bg-green-600 text-white font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
                              {verifying === order.id ? "Verificando..." : "Verificar Pago"}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Column 3: Shipping & Label */}
                  <div className="space-y-6">
                    {/* Address */}
                    <div>
                      <h3 className="font-bold text-sm uppercase tracking-widest border-b border-[#EAEAEA] pb-2 mb-4">Dirección de Envío</h3>
                      {addressInfo ? (
                        <div className="bg-white p-4 border border-[#EAEAEA] rounded-md text-sm text-gray-700 leading-relaxed">
                          <p className="font-bold text-black">{addressInfo.contact}</p>
                          <p>{addressInfo.street} Ext: {addressInfo.num_ext}{addressInfo.num_int ? ` Int: ${addressInfo.num_int}` : ''}</p>
                          <p>Col. {addressInfo.colony}, C.P. {addressInfo.cp}</p>
                          <p>{addressInfo.city}, {addressInfo.state}</p>
                          <p className="mt-1 text-xs text-gray-500">Tel: {addressInfo.phone}</p>
                          {addressInfo.email && <p className="text-xs text-gray-500">Email: {addressInfo.email}</p>}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 bg-white p-4 border border-[#EAEAEA] rounded-md">No se registró dirección.</p>
                      )}
                    </div>

                    {/* Tracking & Label Upload */}
                    <div>
                      <h3 className="font-bold text-sm uppercase tracking-widest border-b border-[#EAEAEA] pb-2 mb-4">Envío y Etiqueta</h3>
                      <div className="bg-white p-4 border border-[#EAEAEA] rounded-md space-y-4">
                        {/* Manual tracking */}
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs font-bold text-gray-700 uppercase">N° de Rastreo</label>
                            <input type="text"
                              value={trackingInputs[order.id]?.num ?? (order.tracking_number || "")}
                              onChange={e => setTrackingInputs(p => ({ ...p, [order.id]: { ...(p[order.id] || { num: "", url: "" }), num: e.target.value } }))}
                              className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-2 text-sm focus:ring-1 focus:ring-black outline-none mt-1"
                              placeholder="Ej. FedEx - 123456789" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-700 uppercase">URL de Rastreo</label>
                            <input type="url"
                              value={trackingInputs[order.id]?.url ?? (order.tracking_url || "")}
                              onChange={e => setTrackingInputs(p => ({ ...p, [order.id]: { ...(p[order.id] || { num: "", url: "" }), url: e.target.value } }))}
                              className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-2 text-sm focus:ring-1 focus:ring-black outline-none mt-1"
                              placeholder="https://..." />
                          </div>
                          <button onClick={() => updateTracking(order.id)}
                            className="bg-black text-white px-4 py-2 rounded-md text-xs font-bold uppercase w-full hover:bg-gray-800 transition-colors">
                            Guardar Rastreo
                          </button>
                        </div>

                        {/* Free shipping label upload */}
                        <div className="border-t border-[#EAEAEA] pt-4">
                          <p className="text-xs font-bold text-gray-500 uppercase mb-2">Subir etiqueta de envío gratis</p>
                          <p className="text-xs text-gray-400 mb-3">Para envíos gestionados fuera de la plataforma, sube la etiqueta generada.</p>
                          <input
                            ref={el => { labelFileRefs.current[order.id] = el; }}
                            type="file" accept="image/*,application/pdf"
                            className="text-xs text-gray-500 mb-3 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 w-full" />
                          <button
                            onClick={() => {
                              const f = labelFileRefs.current[order.id]?.files?.[0];
                              if (f) uploadShippingLabel(order.id, f);
                              else alert("Selecciona un archivo primero.");
                            }}
                            disabled={uploadingLabel === order.id}
                            className="w-full py-2 border border-[#EAEAEA] bg-white text-gray-700 font-bold uppercase text-xs rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">upload</span>
                            {uploadingLabel === order.id ? "Subiendo..." : "Subir Etiqueta"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
