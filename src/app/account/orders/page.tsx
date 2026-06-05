"use client";
import Link from "next/link";
import Image from "next/image";
import AccountSidebar from "@/components/AccountSidebar";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

const PAYMENT_STATUS: Record<string, { label: string; color: string; icon: string }> = {
  pending:        { label: "Sin comprobante",           color: "bg-gray-100 text-gray-600",   icon: "hourglass_empty" },
  proof_uploaded: { label: "Pago en proceso de aprobación", color: "bg-amber-50 text-amber-700 border border-amber-200", icon: "schedule" },
  verified:       { label: "Pago verificado ✓",         color: "bg-green-50 text-green-700 border border-green-200",  icon: "verified" },
  rejected:       { label: "Pago rechazado",            color: "bg-red-50 text-red-600 border border-red-200",   icon: "cancel" },
};

const SHIPPING_STATUS: Record<string, { color: string; icon: string }> = {
  'en proceso': { color: 'bg-blue-100 text-blue-800', icon: 'hourglass_empty' },
  'confirmado': { color: 'bg-emerald-100 text-emerald-800', icon: 'check_circle' },
  'etiqueta generada': { color: 'bg-purple-100 text-purple-800', icon: 'local_shipping' },
  'concluida': { color: 'bg-green-100 text-green-800', icon: 'done_all' },
  'reporte': { color: 'bg-red-100 text-red-800', icon: 'report_problem' }
};

export default function MyOrdersPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setOrders(data);
    setLoading(false);
  };

  const handleUploadProof = async (orderId: string, file: File | null, trackingKey: string) => {
    if (!file && !trackingKey) {
      alert("Ingresa la clave de rastreo o sube una imagen.");
      return;
    }
    setUploadingId(orderId);
    try {
      let proofUrl = null;
      if (file) {
        const ext = file.name.split(".").pop();
        const fileName = `${orderId}-${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("payment-proofs")
          .upload(fileName, file, { cacheControl: "3600", upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("payment-proofs").getPublicUrl(fileName);
        proofUrl = urlData.publicUrl;
      }
      const { error } = await supabase.from("orders").update({
        payment_tracking_key: trackingKey || null,
        payment_proof_url: proofUrl || null,
        payment_status: "proof_uploaded",
      }).eq("id", orderId);
      if (error) throw error;
      await fetchOrders();
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center">Cargando compras...</div>;

  return (
    <div className="bg-background text-on-background font-sans min-h-screen">
      <main className="pt-32 pb-20 max-w-[1440px] mx-auto px-20">
        <div className="grid grid-cols-12 gap-8">
          <AccountSidebar />

          <section className="col-span-12 md:col-span-9">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-4xl font-bold text-primary">Mis Compras</h1>
            </div>

            {orders.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant p-12 text-center rounded-xl flex flex-col items-center">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">shopping_bag</span>
                <h3 className="text-xl font-bold text-primary mb-2">Aún no tienes compras</h3>
                <p className="text-secondary mb-6">Cuando realices una compra, los detalles aparecerán aquí.</p>
                <Link href="/" className="px-8 py-3 bg-primary text-white text-sm font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-colors">
                  Ir a la Tienda
                </Link>
              </div>
            ) : (
              orders.map((order) => {
                const subtotal = order.items?.reduce((acc: number, item: any) => acc + (item.quantity * item.price), 0) || 0;
                const ps = PAYMENT_STATUS[order.payment_status] || PAYMENT_STATUS.pending;
                const isExpanded = expandedId === order.id;

                return (
                  <div key={order.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden mb-6 hover:shadow-sm transition-shadow">
                    
                    {/* Header */}
                    <div className="bg-surface-container px-6 py-4 flex flex-col md:flex-row md:items-center justify-between border-b border-outline-variant gap-4">
                      <div className="flex items-center space-x-8 md:space-x-12">
                        {[
                          { label: "Fecha", value: new Date(order.created_at).toLocaleDateString() },
                          { label: "Total", value: `$${Number(order.total_amount).toFixed(2)}` },
                          { label: "Pedido #", value: order.id.slice(0, 8).toUpperCase() },
                        ].map((info) => (
                          <div key={info.label}>
                            <p className="text-xs text-secondary uppercase font-bold">{info.label}</p>
                            <p className="text-sm font-semibold">{info.value}</p>
                          </div>
                        ))}
                        {/* Método de pago */}
                        {order.payment_method && (
                          <div>
                            <p className="text-xs text-secondary uppercase font-bold">Método de Pago</p>
                            <p className="text-sm font-semibold capitalize flex items-center gap-1">
                              {order.payment_method === "spei" ? (
                                <><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/BBVA_2019.svg/320px-BBVA_2019.svg.png" className="h-4 object-contain inline" alt="BBVA" /> SPEI</>
                              ) : (
                                <><span className="bg-[#E4002B] text-white text-[9px] font-black px-1 rounded">OXXO</span> Depósito</>
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {/* Payment Status Badge */}
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${ps.color}`}>
                          <span className="material-symbols-outlined text-[14px]">{ps.icon}</span>
                          {ps.label}
                        </div>
                        {/* Shipping Status */}
                        {(() => {
                          const ss = SHIPPING_STATUS[order.status?.toLowerCase()] || { color: 'bg-gray-100 text-gray-800', icon: 'local_shipping' };
                          return (
                            <div className={`flex items-center px-3 py-1 rounded-full space-x-1 text-xs ${ss.color}`}>
                              <span className="material-symbols-outlined text-[14px]">{ss.icon}</span>
                              <span className="font-semibold capitalize">{order.status || "En proceso"}</span>
                            </div>
                          );
                        })()}
                        <button onClick={() => setExpandedId(isExpanded ? null : order.id)} className="text-xs text-gray-400 hover:text-black flex items-center gap-1 transition-colors">
                          {isExpanded ? "Ocultar detalles" : "Ver detalles"}
                          <span className="material-symbols-outlined text-[16px]">{isExpanded ? "expand_less" : "expand_more"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Articles */}
                        <div className="lg:col-span-2 flex flex-col gap-6">
                          <h3 className="font-bold text-sm uppercase tracking-widest border-b border-outline-variant pb-2">Artículos</h3>
                          {order.items?.map((item: any, idx: number) => {
                            const image = item.image || "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800";
                            return (
                              <div key={idx} className="flex items-start justify-between">
                                <div className="flex space-x-6">
                                  <div className="relative w-20 h-20 flex-shrink-0">
                                    <Image alt={item.name || "Producto"} src={image} fill className="object-cover border border-outline-variant rounded-lg" unoptimized />
                                  </div>
                                  <div className="flex flex-col justify-center">
                                    <h3 className="text-base font-bold text-primary">{item.name || "Producto"}</h3>
                                    {item.variantName && <p className="text-xs font-medium text-gray-500 mt-1">{item.variantName}</p>}
                                    <p className="text-xs text-secondary mt-1">Cantidad: {item.quantity}</p>
                                    <p className="text-sm font-bold mt-2">${item.price}</p>
                                  </div>
                                </div>
                                <Link href={`/product/${item.productId}`} className="text-xs font-bold uppercase tracking-wider hover:underline">
                                  Volver a Comprar
                                </Link>
                              </div>
                            );
                          })}

                          {/* Payment Proof Section */}
                          <div className="mt-2 border border-outline-variant rounded-xl overflow-hidden">
                            <div className={`px-4 py-3 flex items-center gap-2 ${ps.color}`}>
                              <span className="material-symbols-outlined text-[18px]">{ps.icon}</span>
                              <span className="font-bold text-sm">{ps.label}</span>
                            </div>
                            <div className="p-4 bg-white space-y-4">
                              {/* If proof already uploaded */}
                              {(order.payment_tracking_key || order.payment_proof_url) && (
                                <div className="space-y-3">
                                  {order.payment_tracking_key && (
                                    <div className="bg-gray-50 rounded-lg p-3">
                                      <p className="text-xs font-bold text-gray-400 uppercase mb-1">Tu clave de rastreo</p>
                                      <p className="font-mono font-bold text-sm">{order.payment_tracking_key}</p>
                                    </div>
                                  )}
                                  {order.payment_proof_url && (
                                    <div>
                                      <p className="text-xs font-bold text-gray-400 uppercase mb-2">Tu comprobante</p>
                                      <a href={order.payment_proof_url} target="_blank" rel="noopener noreferrer">
                                        <img src={order.payment_proof_url} alt="Comprobante" className="max-h-40 rounded-lg border border-gray-200 hover:opacity-90 transition-opacity cursor-zoom-in" />
                                      </a>
                                    </div>
                                  )}
                                  {order.payment_status === "proof_uploaded" && (
                                    <p className="text-xs text-amber-600 flex items-center gap-1">
                                      <span className="material-symbols-outlined text-[14px]">info</span>
                                      Tu comprobante está siendo revisado. Te notificaremos cuando sea verificado.
                                    </p>
                                  )}
                                  {order.payment_status === "verified" && (
                                    <p className="text-xs text-green-600 flex items-center gap-1 font-bold">
                                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                      ¡Pago verificado! Tu pedido está siendo procesado.
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* If no proof yet — show upload form */}
                              {order.payment_status === "pending" && (
                                <div className="space-y-3">
                                  <p className="text-sm text-gray-500">Aún no has subido tu comprobante de pago.</p>
                                  <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Clave de rastreo / N° de operación</label>
                                    <input
                                      type="text"
                                      value={trackingInputs[order.id] || ""}
                                      onChange={e => setTrackingInputs(p => ({ ...p, [order.id]: e.target.value }))}
                                      placeholder="Ej. 002180012345678901"
                                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-black outline-none"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Foto del baucher</label>
                                    <input
                                      ref={el => { fileRefs.current[order.id] = el; }}
                                      type="file"
                                      accept="image/*"
                                      className="text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                                    />
                                  </div>
                                  <button
                                    onClick={() => handleUploadProof(order.id, fileRefs.current[order.id]?.files?.[0] || null, trackingInputs[order.id] || "")}
                                    disabled={uploadingId === order.id}
                                    className="w-full py-3 bg-black text-white font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                  >
                                    {uploadingId === order.id ? (
                                      <><span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span> Enviando...</>
                                    ) : (
                                      <><span className="material-symbols-outlined text-[16px]">upload</span> Enviar comprobante</>
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Payment Summary */}
                        <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-outline-variant pt-6 lg:pt-0 lg:pl-6">
                          <h3 className="font-bold text-sm uppercase tracking-widest border-b border-outline-variant pb-2 mb-4">Resumen de Pago</h3>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-secondary">
                              <span>Subtotal:</span>
                              <span>${subtotal.toFixed(2)}</span>
                            </div>
                            {order.discount_amount > 0 && (
                              <div className="flex justify-between text-green-600 font-bold">
                                <span>Cupón {order.coupon_code ? `(${order.coupon_code})` : ''}:</span>
                                <span>- ${Number(order.discount_amount).toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between font-bold text-lg pt-4 border-t border-outline-variant mt-4">
                              <span>Total Pagado:</span>
                              <span>${Number(order.total_amount).toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Tracking */}
                          {(order.tracking_number || order.tracking_url) && (
                            <div className="mt-6 pt-6 border-t border-outline-variant">
                              <h3 className="font-bold text-sm uppercase tracking-widest mb-3">Logística</h3>
                              <div className="bg-blue-50 rounded-lg p-4 text-sm flex flex-col gap-3">
                                {order.tracking_number && (
                                  <div>
                                    <p className="text-[10px] text-blue-500 uppercase font-bold mb-0.5">Número de rastreo</p>
                                    <p className="font-mono font-bold">{order.tracking_number}</p>
                                  </div>
                                )}
                                {order.tracking_url && (
                                  <a href={order.tracking_url} target="_blank" rel="noreferrer" 
                                    className="w-full py-2.5 bg-blue-600 text-white font-bold uppercase tracking-widest text-xs rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">download</span>
                                    Descargar Guía de Envío
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {orders.length > 0 && (
              <div className="mt-12 text-center p-12 border-2 border-dashed border-outline-variant rounded-xl bg-surface-container-low">
                <p className="text-xl text-secondary mb-4">¿Buscas algo más?</p>
                <Link href="/" className="inline-block px-8 py-3 bg-primary text-white text-sm font-bold uppercase tracking-widest hover:bg-black transition-all rounded-lg">
                  Continuar Comprando
                </Link>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
