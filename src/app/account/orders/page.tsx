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
  const [mpNotif, setMpNotif] = useState<'success'|'pending'|null>(null);
  const [proofSubmitted, setProofSubmitted] = useState<string | null>(null); // orderId after proof upload

  useEffect(() => {
    fetchOrders();
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('mp_success') === 'true') setMpNotif('success');
      else if (p.get('mp_pending') === 'true') setMpNotif('pending');
    }
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
      setProofSubmitted(orderId);
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

      {/* ── Proof Submitted Overlay ─────────────────────────────────────── */}
      {proofSubmitted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 p-10 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            {/* Animated checkmark */}
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full bg-amber-50 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-amber-500 text-5xl">schedule</span>
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-green-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[16px]">check</span>
              </div>
            </div>

            <h2 className="text-2xl font-black text-gray-900 mb-2">¡Orden generada!</h2>
            <p className="text-amber-600 font-bold text-sm mb-1 uppercase tracking-widest">Pago en proceso de aprobación</p>
            <p className="text-gray-500 text-sm mt-3 leading-relaxed">
              Recibimos tu comprobante de pago.<br />
              Verificaremos tu pago y recibirás una notificación cuando sea aprobado.
            </p>

            <div className="w-full mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px]">info</span>
                ¿Qué sigue?
              </div>
              <ul className="text-xs text-gray-600 space-y-1.5 ml-1">
                <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">›</span> Revisamos tu comprobante (generalmente en menos de 24 hrs)</li>
                <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">›</span> Al aprobar tu pago, tu pedido entra en proceso</li>
                <li className="flex items-start gap-2"><span className="text-amber-400 mt-0.5">›</span> Puedes ver el estado en "Mis Compras" en cualquier momento</li>
              </ul>
            </div>

            <div className="flex gap-3 w-full mt-6">
              <button
                onClick={() => setProofSubmitted(null)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Ver mis compras
              </button>
              <Link
                href="/"
                className="flex-1 py-3 bg-black text-white rounded-xl text-sm font-bold text-center hover:bg-gray-800 transition-colors"
              >
                Seguir comprando
              </Link>
            </div>
          </div>
        </div>
      )}

      <main className="pt-32 pb-20 max-w-[1440px] mx-auto px-20">
        <div className="grid grid-cols-12 gap-8">
          <AccountSidebar />

          <section className="col-span-12 md:col-span-9">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-4xl font-bold text-primary">Mis Compras</h1>
            </div>

            {mpNotif === 'success' && (
              <div className="mb-6 bg-green-50 border border-green-300 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-green-600 text-2xl">verified</span>
                </div>
                <div>
                  <p className="font-bold text-green-800">¡Pago con Mercado Pago aprobado!</p>
                  <p className="text-sm text-green-600 mt-0.5">Tu compra fue procesada exitosamente. Prepararemos tu pedido de inmediato.</p>
                </div>
              </div>
            )}
            {mpNotif === 'pending' && (
              <div className="mb-6 bg-amber-50 border border-amber-300 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-amber-600 text-2xl">schedule</span>
                </div>
                <div>
                  <p className="font-bold text-amber-800">Pago en proceso</p>
                  <p className="text-sm text-amber-600 mt-0.5">Tu pago está siendo procesado. Te notificaremos cuando sea confirmado.</p>
                </div>
              </div>
            )}

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
                         <div>
                            <p className="text-xs text-secondary uppercase font-bold">Método de Pago</p>
                            <p className="text-sm font-semibold capitalize flex items-center gap-1">
                              {order.payment_method === "mercadopago" ? (
                                <span className="inline-flex items-center gap-1.5 text-[#009EE3] font-bold">
                                  <span className="material-symbols-outlined text-[16px]">credit_card</span>
                                  Mercado Pago
                                </span>
                              ) : order.payment_method === "spei" ? (
                                <><span className="material-symbols-outlined text-[14px] text-blue-600">account_balance</span> Transferencia SPEI</>
                              ) : (
                                <><span className="bg-[#E4002B] text-white text-[9px] font-black px-1 rounded">OXXO</span> Depósito</>
                              )}
                            </p>
                          </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {/* Payment Status Badge */}
                        {order.payment_method === "mercadopago" ? (
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                            (order.payment_status === "verified" || order.status === "confirmado" || order.status === "etiqueta generada" || order.status === "concluida")
                              ? "bg-[#009EE3]/10 text-[#009EE3]"
                              : order.payment_status === "rejected" ? "bg-red-50 text-red-600"
                              : "bg-amber-50 text-amber-700"
                          }`}>
                            <span className="material-symbols-outlined text-[14px]">
                              {(order.payment_status === "verified" || order.status === "confirmado") ? "verified" : order.payment_status === "rejected" ? "cancel" : "schedule"}
                            </span>
                            {(order.payment_status === "verified" || order.status === "confirmado" || order.status === "etiqueta generada" || order.status === "concluida")
                              ? "Pago confirmado por Mercado Pago"
                              : order.payment_status === "rejected" ? "Pago rechazado"
                              : "Pago en proceso"}
                          </div>
                        ) : (
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${ps.color}`}>
                            <span className="material-symbols-outlined text-[14px]">{ps.icon}</span>
                            {ps.label}
                          </div>
                        )}
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

                          {/* Payment Proof Section — only for SPEI/OXXO, not for Mercado Pago */}
                          {order.payment_method === "mercadopago" ? (
                            <div className={`mt-2 border rounded-xl overflow-hidden ${
                              (order.payment_status === "verified" || order.status === "confirmado")
                                ? "border-[#009EE3]/30"
                                : order.payment_status === "rejected" ? "border-red-200"
                                : "border-amber-200"
                            }`}>
                              <div className={`px-4 py-4 flex items-center gap-3 ${
                                (order.payment_status === "verified" || order.status === "confirmado")
                                  ? "bg-[#009EE3]/5"
                                  : order.payment_status === "rejected" ? "bg-red-50"
                                  : "bg-amber-50"
                              }`}>
                                <span className={`material-symbols-outlined text-2xl ${
                                  (order.payment_status === "verified" || order.status === "confirmado")
                                    ? "text-[#009EE3]"
                                    : order.payment_status === "rejected" ? "text-red-500"
                                    : "text-amber-500"
                                }`}>
                                  {(order.payment_status === "verified" || order.status === "confirmado") ? "verified" : order.payment_status === "rejected" ? "cancel" : "schedule"}
                                </span>
                                <div>
                                  <p className="font-bold text-sm">
                                    {(order.payment_status === "verified" || order.status === "confirmado" || order.status === "etiqueta generada" || order.status === "concluida")
                                      ? "¡Compra confirmada!"
                                      : order.payment_status === "rejected" ? "Pago rechazado"
                                      : "Pago en proceso"}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {(order.payment_status === "verified" || order.status === "confirmado")
                                      ? "Tu pago fue procesado exitosamente por Mercado Pago. Estamos preparando tu pedido."
                                      : order.payment_status === "rejected" ? "Tu pago fue rechazado. Intenta nuevamente con otro método de pago."
                                      : "Tu pago está siendo procesado. Recibirás una notificación cuando se confirme."}
                                  </p>
                                  {order.payment_tracking_key && (
                                    <p className="text-[11px] font-mono text-gray-400 mt-1">ID de pago: {order.payment_tracking_key}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                          <div className="mt-2 border border-outline-variant rounded-xl overflow-hidden">
                            <div className={`px-4 py-3 flex items-center gap-2 ${ps.color}`}>
                              <span className="material-symbols-outlined text-[18px]">{ps.icon}</span>
                              <span className="font-bold text-sm">{ps.label}</span>
                            </div>
                            <div className="p-4 bg-white space-y-4">
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
                                      Tu comprobante está siendo revisado.
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
                          )}
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

                          {/* Shipping Info — always visible */}
                          <div className="mt-6 pt-6 border-t border-outline-variant">
                            <h3 className="font-bold text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
                              <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                              Información de Envío
                            </h3>

                            {(order.tracking_number || order.tracking_url) ? (
                              <div className="space-y-3">
                                {/* Tracking Number */}
                                {order.tracking_number && (
                                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                                    <p className="text-[10px] text-blue-500 uppercase font-bold mb-1 flex items-center gap-1">
                                      <span className="material-symbols-outlined text-[12px]">tag</span>
                                      Número de rastreo
                                    </p>
                                    <p className="font-mono font-bold text-sm text-blue-900">{order.tracking_number}</p>
                                  </div>
                                )}

                                {/* Tracking / Label URL */}
                                {order.tracking_url && (
                                  <a
                                    href={order.tracking_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full py-3 bg-black text-white font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                  >
                                    {order.tracking_url.includes('.pdf') || order.tracking_url.includes('label') ? (
                                      <><span className="material-symbols-outlined text-[16px]">download</span>Descargar Guía de Envío</>
                                    ) : (
                                      <><span className="material-symbols-outlined text-[16px]">track_changes</span>Rastrear mi Paquete</>
                                    )}
                                  </a>
                                )}

                                <p className="text-[11px] text-gray-400 text-center">
                                  Guarda tu número de rastreo para consultar el estado de tu entrega
                                </p>
                              </div>
                            ) : (
                              /* No tracking yet */
                              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="material-symbols-outlined text-gray-500 text-[16px]">inventory_2</span>
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-gray-700">
                                    {order.status === 'confirmado' || order.status === 'en proceso'
                                      ? 'Preparando tu pedido'
                                      : order.status === 'etiqueta generada'
                                      ? 'Guía generada — número en camino'
                                      : 'Pendiente de envío'}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    Tu número de guía y enlace de rastreo aparecerán aquí cuando tu pedido sea enviado.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
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
