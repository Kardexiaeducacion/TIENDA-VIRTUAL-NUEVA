"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
type PaymentSettings = {
  id: string;
  method: string;
  bank_name: string;
  clabe: string;
  beneficiary: string;
  account_number: string;
  instructions: string;
  enabled: boolean;
  bank_logo_url?: string;
  public_key?: string;
  access_token?: string;
  mp_access_token?: string;
  mp_refresh_token?: string;
  mp_user_id?: string;
  mp_account_email?: string;
};

type Order = {
  id: string;
  created_at: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  payment_tracking_key: string | null;
  payment_proof_url: string | null;
  shipping_address: string | null;
  items: Record<string, unknown>[];
};

export default function PaymentsAdminPage() {
  const supabase = createClient();
  const [tab, setTab] = useState<"config" | "reports">("config");

  const [speiSettings, setSpeiSettings] = useState<PaymentSettings | null>(null);
  const [oxxoSettings, setOxxoSettings] = useState<PaymentSettings | null>(null);
  const [mpSettings, setMpSettings] = useState<PaymentSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [urlNotif, setUrlNotif] = useState<{type: 'success'|'error', msg: string}|null>(null);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    const success = params.get('success');
    const msg = params.get('msg');
    if (success === 'mp_connected') {
      setUrlNotif({ type: 'success', msg: 'Cuenta de Mercado Pago vinculada exitosamente.' });
      loadData();
    } else if (err) {
      setUrlNotif({ type: 'error', msg: msg ? decodeURIComponent(msg) : ('Error: ' + err) });
    }
  }, [loadData]);


  const loadData = useCallback(async () => {

    // Load payment settings
    const { data: settings } = await supabase.from("payment_settings").select("*");
    if (settings) {
      const spei = settings.find(s => s.method === "spei");
      const oxxo = settings.find(s => s.method === "oxxo");
      const mp = settings.find(s => s.method === "mercadopago");
      if (spei) setSpeiSettings(spei);
      if (oxxo) setOxxoSettings(oxxo);
      if (mp) setMpSettings(mp);
    }

    // Load payment proof orders
    setLoadingOrders(true);
    const { data: ordersData } = await supabase
      .from("orders")
      .select("id, created_at, total_amount, payment_method, payment_status, payment_tracking_key, payment_proof_url, shipping_address, items")
      .in("payment_status", ["proof_uploaded", "verified", "pending"])
      .order("created_at", { ascending: false });

    if (ordersData) {
      setOrders(ordersData);
      setPendingCount(ordersData.filter(o => o.payment_status === "proof_uploaded").length);
    }
    setLoadingOrders(false);
  }, [supabase]);

  const handleSaveSettings = async (method: "spei" | "oxxo" | "mercadopago") => {
    const data = method === "spei" ? speiSettings : method === "oxxo" ? oxxoSettings : mpSettings;
    if (!data) return;
    setSaving(true);
    const { error } = await supabase
      .from("payment_settings")
      .update({
        bank_name: data.bank_name,
        clabe: data.clabe,
        beneficiary: data.beneficiary,
        account_number: data.account_number,
        instructions: data.instructions,
        enabled: data.enabled,
        bank_logo_url: data.bank_logo_url,
        public_key: data.public_key,
        access_token: data.access_token,
        updated_at: new Date().toISOString(),
      })
      .eq("method", method);

    setSaving(false);
    if (!error) {
      setSavedMsg("Guardado correctamente");
      setTimeout(() => setSavedMsg(""), 3000);
    }
  };

  const handleUploadLogo = async (method: "spei" | "oxxo", e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `logo-${method}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("payment-proofs").upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from("payment-proofs").getPublicUrl(fileName);
      
      if (method === "spei") {
        setSpeiSettings(prev => prev ? { ...prev, bank_logo_url: urlData.publicUrl } : null);
      } else {
        setOxxoSettings(prev => prev ? { ...prev, bank_logo_url: urlData.publicUrl } : null);
      }
      alert("Logo subido correctamente");
    } catch (err: unknown) {
      alert("Error subiendo logo: " + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async (orderId: string) => {
    setVerifying(true);
    const { error } = await supabase.from("orders").update({ payment_status: "verified", status: "confirmado" }).eq("id", orderId);
    if (error) {
      console.error("Error verificando pago:", error);
      alert("Error al verificar: " + error.message);
    } else {
      setSelectedOrder(null);
      loadData();
    }
    setVerifying(false);
  };

  const handleReject = async (orderId: string) => {
    const { error } = await supabase.from("orders").update({ payment_status: "rejected" }).eq("id", orderId);
    if (error) {
      console.error("Error rechazando pago:", error);
      alert("Error al rechazar: " + error.message);
    } else {
      setSelectedOrder(null);
      loadData();
    }
  };

  const statusBadge = (status: string, method?: string, orderStatus?: string) => {
    if (method === "mercadopago") {
      const isConfirmed = status === "verified" || orderStatus === "confirmado" || orderStatus === "etiqueta generada" || orderStatus === "concluida";
      const isRejected = status === "rejected" || orderStatus === "reporte";
      if (isConfirmed) return <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#009EE3]/10 text-[#009EE3] flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">verified</span>Confirmado MP</span>;
      if (isRejected) return <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-600">Rechazado MP</span>;
      return <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-700">En espera MP</span>;
    }
    const map: Record<string, { label: string; color: string }> = {
      pending: { label: "Sin comprobante", color: "bg-gray-100 text-gray-500" },
      proof_uploaded: { label: "Comprobante subido", color: "bg-amber-100 text-amber-700" },
      verified: { label: "Verificado ?", color: "bg-green-100 text-green-700" },
      rejected: { label: "Rechazado", color: "bg-red-100 text-red-600" },
    };
    const s = map[status] || { label: status, color: "bg-gray-100 text-gray-500" };
    return <span className={`text-xs font-bold px-3 py-1 rounded-full ${s.color}`}>{s.label}</span>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Pagos</h1>
            <p className="text-sm text-gray-500 mt-1">Configura métodos de pago y verifica comprobantes</p>
          </div>
          <div className="flex gap-4 items-center">
            {urlNotif && (
              <div className={`border rounded-xl px-4 py-2 flex items-center gap-2 text-sm font-bold ${urlNotif.type === 'success' ? 'bg-green-100 border-green-200 text-green-700' : 'bg-red-100 border-red-200 text-red-700'}`}>
                <span className="material-symbols-outlined text-[20px]">{urlNotif.type === 'success' ? 'check_circle' : 'error'}</span>
                <span>{urlNotif.msg}</span>
              </div>
            )}
            {pendingCount > 0 && (
              <div className="bg-amber-100 border border-amber-200 rounded-xl px-4 py-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600 text-[20px]">notifications_active</span>
                <span className="font-bold text-amber-700 text-sm">{pendingCount} comprobante{pendingCount > 1 ? "s" : ""} pendiente{pendingCount > 1 ? "s" : ""}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-100 w-fit mb-8 shadow-sm">
          <button
            onClick={() => setTab("config")}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${
              tab === "config" ? "bg-black text-white shadow-sm" : "text-gray-500 hover:text-black"
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">settings</span>
              Configuración
            </span>
          </button>
          <button
            onClick={() => setTab("reports")}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all relative ${
              tab === "reports" ? "bg-black text-white shadow-sm" : "text-gray-500 hover:text-black"
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              Pagos Reportados
              {pendingCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </span>
          </button>
        </div>

        {/* CONFIG TAB */}
        {tab === "config" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* SPEI Config */}
            {speiSettings && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                      {speiSettings.bank_logo_url ? (
                        <Image src={speiSettings.bank_logo_url} alt="Bank Logo" fill className="object-contain p-1" unoptimized />
                      ) : (
                        <span className="material-symbols-outlined text-blue-500">account_balance</span>
                      )}
                    </div>
                    <div className="ml-1">
                      <h2 className="font-bold">Transferencia SPEI</h2>
                      <p className="text-xs text-gray-400 mb-1">{speiSettings.bank_name || "Nombre del Banco"}</p>
                      <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-[10px] font-bold text-gray-600 transition-colors inline-block">
                        {saving ? "Subiendo..." : "Cambiar Logo"}
                        <input type="file" accept="image/png, image/jpeg, image/webp, image/svg+xml" className="hidden" onChange={(e) => handleUploadLogo("spei", e)} disabled={saving} />
                      </label>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={speiSettings.enabled}
                      onChange={e => setSpeiSettings({ ...speiSettings, enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>

                <div className="space-y-4">
                  {/* Banco Dropdown */}
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Banco</label>
                    <select
                      value={
                        ["BBVA", "Banamex", "Santander", "Banorte", "HSBC", "Scotiabank", "Inbursa"].includes(speiSettings.bank_name) 
                          ? speiSettings.bank_name 
                          : (speiSettings.bank_name === "" ? "" : "Otro")
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "Otro") {
                          setSpeiSettings({ ...speiSettings, bank_name: "Mi Banco" });
                        } else {
                          setSpeiSettings({ ...speiSettings, bank_name: val });
                        }
                      }}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-black outline-none mt-1"
                    >
                      <option value="" disabled>Selecciona un banco</option>
                      {["BBVA", "Banamex", "Santander", "Banorte", "HSBC", "Scotiabank", "Inbursa"].map(b => <option key={b} value={b}>{b}</option>)}
                      <option value="Otro">Otro banco...</option>
                    </select>

                    {(!["BBVA", "Banamex", "Santander", "Banorte", "HSBC", "Scotiabank", "Inbursa"].includes(speiSettings.bank_name) && speiSettings.bank_name !== "") && (
                      <input
                        type="text"
                        value={speiSettings.bank_name === "Mi Banco" ? "" : speiSettings.bank_name}
                        onChange={e => setSpeiSettings({ ...speiSettings, bank_name: e.target.value })}
                        placeholder="Escribe el nombre de tu banco"
                        className="w-full bg-white border-2 border-blue-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none mt-2"
                      />
                    )}
                  </div>

                  {[
                    { label: "CLABE interbancaria (18 dígitos)", field: "clabe" as const, placeholder: "012 840 01234567890 1" },
                    { label: "Nombre del beneficiario", field: "beneficiary" as const, placeholder: "Tu Nombre o Empresa S.A." },
                    { label: "Instrucciones adicionales", field: "instructions" as const, placeholder: "Ej. Incluye la referencia para identificar tu pago." },
                  ].map(({ label, field, placeholder }) => (
                    <div key={field}>
                      <label className="text-xs font-bold text-gray-500 uppercase">{label}</label>
                      <input
                        type="text"
                        value={speiSettings[field]}
                        onChange={e => setSpeiSettings({ ...speiSettings, [field]: e.target.value })}
                        placeholder={placeholder}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-black outline-none mt-1"
                      />
                    </div>
                  ))}
                </div>

                {savedMsg && <p className="text-green-600 text-xs font-bold mt-3">{savedMsg}</p>}
                <button
                  onClick={() => handleSaveSettings("spei")}
                  disabled={saving}
                  className="mt-5 w-full py-3 bg-black text-white font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {saving ? "Guardando..." : "Guardar configuración SPEI"}
                </button>
              </div>
            )}

            {/* OXXO Config */}
            {oxxoSettings && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                      {oxxoSettings.bank_logo_url ? (
                        <Image src={oxxoSettings.bank_logo_url} alt="OXXO Logo" fill className="object-contain bg-white" unoptimized />
                      ) : (
                        <span className="text-white text-xs font-black">OXXO</span>
                      )}
                    </div>
                    <div className="ml-1">
                      <h2 className="font-bold">Depósito en OXXO</h2>
                      <p className="text-xs text-gray-400 mb-1">Pago en tienda</p>
                      <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-[10px] font-bold text-gray-600 transition-colors inline-block">
                        {saving ? "Subiendo..." : "Cambiar Logo"}
                        <input type="file" accept="image/png, image/jpeg, image/webp, image/svg+xml" className="hidden" onChange={(e) => handleUploadLogo("oxxo", e)} disabled={saving} />
                      </label>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={oxxoSettings.enabled}
                      onChange={e => setOxxoSettings({ ...oxxoSettings, enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>

                <div className="space-y-4">
                  {[
                    { label: "N° de convenio / Cuenta", field: "account_number" as const, placeholder: "00000000000" },
                    { label: "Nombre del beneficiario", field: "beneficiary" as const, placeholder: "Tu Nombre o Empresa S.A." },
                    { label: "Instrucciones adicionales", field: "instructions" as const, placeholder: "Ej. Realiza el depósito en cualquier tienda OXXO." },
                  ].map(({ label, field, placeholder }) => (
                    <div key={field}>
                      <label className="text-xs font-bold text-gray-500 uppercase">{label}</label>
                      <input
                        type="text"
                        value={oxxoSettings[field]}
                        onChange={e => setOxxoSettings({ ...oxxoSettings, [field]: e.target.value })}
                        placeholder={placeholder}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-black outline-none mt-1"
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleSaveSettings("oxxo")}
                  disabled={saving}
                  className="mt-5 w-full py-3 bg-black text-white font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {saving ? "Guardando..." : "Guardar configuración OXXO"}
                </button>
              </div>
            )}

            {/* Mercado Pago Config -- OAuth */}
            {mpSettings && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#009EE3]/10 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                      <span className="material-symbols-outlined text-[#009EE3]">credit_card</span>
                    </div>
                    <div className="ml-1">
                      <h2 className="font-bold">Mercado Pago</h2>
                      <p className="text-xs text-gray-400 mb-1">Tarjetas, OXXO, Meses sin intereses</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mpSettings.enabled}
                      onChange={async e => {
                        setMpSettings({ ...mpSettings, enabled: e.target.checked });
                        await supabase.from("payment_settings").update({ enabled: e.target.checked }).eq("method", "mercadopago");
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                  </label>
                </div>

                {mpSettings.mp_access_token ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                      <span className="material-symbols-outlined text-green-600 text-[24px]">verified</span>
                      <div>
                        <p className="font-bold text-green-800 text-sm">Cuenta vinculada</p>
                        {mpSettings.mp_account_email && (
                          <p className="text-xs text-green-600 mt-0.5">{mpSettings.mp_account_email}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <a
                        href="https://auth.mercadopago.com/authorization?client_id=2674146890242645&response_type=code&platform_id=mp&state=connect&redirect_uri=https%3A%2F%2Fcloe-app-git-main-kardexia-s-projects.vercel.app%2Fapi%2Fauth%2Fmercadopago%2Fcallback"
                        className="flex-1 py-3 border border-[#009EE3] text-[#009EE3] font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-[#009EE3]/5 transition-colors text-center"
                      >
                        Cambiar cuenta
                      </a>
                      <button
                        onClick={async () => {
                          if (!confirm("¿Seguro que quieres desvincular esta cuenta de Mercado Pago?")) return;
                          setSaving(true);
                          try {
                            const res = await fetch('/api/auth/mercadopago/disconnect', { method: 'POST' });
                            const data = await res.json();
                            if (!res.ok) throw new Error(data.error || 'Error al desvincular');
                            setMpSettings({ ...mpSettings, mp_access_token: undefined, mp_refresh_token: undefined, mp_user_id: undefined, mp_account_email: undefined, enabled: false });
                            setUrlNotif({ type: 'success', msg: 'URL regenerada' });
                          } catch (e: unknown) {
                            setUrlNotif({ type: 'error', msg: (e as Error).message });
                          } finally {
                            setSaving(false);
                          }
                        }}
                        disabled={saving}
                        className="flex-1 py-3 border border-red-200 text-red-500 font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {saving ? 'Desvinculando...' : 'Desvincular'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                      <span className="material-symbols-outlined text-gray-400 text-[24px]">link_off</span>
                      <div>
                        <p className="font-bold text-gray-600 text-sm">Sin cuenta vinculada</p>
                        <p className="text-xs text-gray-400 mt-0.5">Conecta tu cuenta para recibir pagos con tarjeta.</p>
                      </div>
                    </div>
                    <a
                      href="https://auth.mercadopago.com/authorization?client_id=2674146890242645&response_type=code&platform_id=mp&state=connect&redirect_uri=https%3A%2F%2Fcloe-app-git-main-kardexia-s-projects.vercel.app%2Fapi%2Fauth%2Fmercadopago%2Fcallback"
                      className="block w-full py-3 bg-[#009EE3] text-white font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-[#0089c4] transition-colors text-center"
                    >
                      Conectar con Mercado Pago
                    </a>
                  </div>
                )}
                {savedMsg && <p className="text-green-600 text-xs font-bold mt-3">{savedMsg}</p>}
              </div>
            )}
          </div>
        )}

        {/* REPORTS TAB */}
        {tab === "reports" && (
          <div className="flex gap-6">
            {/* Orders List */}
            <div className="flex-1">
              {loadingOrders ? (
                <div className="flex items-center gap-3 text-gray-400 p-8">
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Cargando pagos...
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                  <span className="material-symbols-outlined text-gray-200 text-[64px]">receipt_long</span>
                  <p className="text-gray-400 mt-4">No hay pagos reportados aún</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map(order => {
                    const addr = order.shipping_address ? JSON.parse(order.shipping_address) : null;
                    const isSelected = selectedOrder?.id === order.id;
                    return (
                      <button
                        key={order.id}
                        onClick={() => setSelectedOrder(isSelected ? null : order)}
                        className={`w-full text-left bg-white rounded-2xl border p-5 shadow-sm hover:border-black transition-all ${
                          isSelected ? "border-black ring-1 ring-black" : "border-gray-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 relative ${
                              order.payment_method === "spei" ? "bg-blue-50" : order.payment_method === "mercadopago" ? "bg-[#009EE3]/10" : "bg-red-600"
                            }`}>
                              {order.payment_method === "spei" ? (
                                speiSettings?.bank_logo_url ? <Image src={speiSettings.bank_logo_url} alt="SPEI" fill className="object-contain p-1" unoptimized /> : <span className="material-symbols-outlined text-blue-500">account_balance</span>
                              ) : order.payment_method === "mercadopago" ? (
                                <span className="material-symbols-outlined text-[#009EE3] text-[20px]">credit_card</span>
                              ) : (
                                oxxoSettings?.bank_logo_url ? <Image src={oxxoSettings.bank_logo_url} alt="OXXO" fill className="object-contain bg-white" unoptimized /> : <span className="text-white text-[10px] font-black">OXXO</span>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-sm">{addr?.contact || "Cliente"}</p>
                              <p className="text-xs text-gray-400">
                                {new Date(order.created_at).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold">${order.total_amount?.toFixed(2)}</span>
                            {statusBadge(order.payment_status, order.payment_method)}
                            {order.payment_status === "proof_uploaded" && (
                              <span className="material-symbols-outlined text-amber-500 text-[20px]">notifications_active</span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Order Detail Panel */}
            {selectedOrder && (
              <div className="w-96 flex-shrink-0">
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-lg">Detalle del Pago</h3>
                    <button onClick={() => setSelectedOrder(null)} className="material-symbols-outlined text-gray-400 hover:text-black">close</button>
                  </div>

                  <div className="space-y-3 mb-5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">ID Venta</span>
                      <span className="font-bold font-mono">{selectedOrder.id.split("-")[0].toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500 whitespace-nowrap">Cliente</span>
                      <span className="font-bold text-right truncate">
                        {selectedOrder.shipping_address ? JSON.parse(selectedOrder.shipping_address).contact : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500 whitespace-nowrap">Correo</span>
                      <span className="font-bold text-right truncate">
                        {selectedOrder.shipping_address && JSON.parse(selectedOrder.shipping_address).email ? JSON.parse(selectedOrder.shipping_address).email : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Método</span>
                      <span className="font-bold capitalize">
                        {selectedOrder.payment_method === "spei" ? "SPEI / Transferencia" : selectedOrder.payment_method === "mercadopago" ? "Mercado Pago ?" : "OXXO"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Estado</span>
                      {statusBadge(selectedOrder.payment_status, selectedOrder.payment_method)}
                    </div>
                    <div className="flex justify-between border-t border-gray-100 pt-3">
                      <span className="text-gray-500 font-bold">Total</span>
                      <span className="font-bold text-lg text-green-700">${selectedOrder.total_amount?.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 mb-5 text-sm border border-gray-100">
                    <p className="font-bold text-[10px] text-gray-400 uppercase tracking-widest mb-3">Productos Comprados</p>
                    <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                      {selectedOrder.items?.map((item: Record<string, unknown>, idx: number) => {
                        const prodId = (item.product_id || item.id || "") as string;
                        return (
                          <div key={idx} className="flex flex-col gap-0.5 border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                            <p className="font-bold text-xs truncate">{item.quantity}x {item.name as string}</p>
                            <p className="text-[10px] font-mono text-gray-500">ID Prod: {prodId.split("-")[0].toUpperCase() || "N/A"}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {selectedOrder.payment_tracking_key && (
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-1">{selectedOrder.payment_method === "mercadopago" ? "ID de Pago MP" : "Clave de rastreo"}</p>
                      <p className="font-mono font-bold text-sm break-all">{selectedOrder.payment_tracking_key}</p>
                    </div>
                  )}

                  {selectedOrder.payment_proof_url && (
                    <div className="mb-5">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-2">Comprobante de pago</p>
                      <a href={selectedOrder.payment_proof_url} target="_blank" rel="noopener noreferrer" className="block relative w-full h-48">
                        <Image
                          src={selectedOrder.payment_proof_url}
                          alt="Comprobante"
                          fill
                          unoptimized
                          className="rounded-xl border border-gray-200 hover:opacity-90 transition-opacity cursor-zoom-in object-cover"
                        />
                        <p className="text-xs text-blue-500 text-center mt-1">Ver imagen completa</p>
                      </a>
                    </div>
                  )}

                  {!selectedOrder.payment_tracking_key && !selectedOrder.payment_proof_url && selectedOrder.payment_method !== "mercadopago" && (
                    <div className="bg-gray-50 rounded-xl p-4 mb-5 text-center text-gray-400 text-sm">
                      <span className="material-symbols-outlined text-[32px] block mb-1">hourglass_empty</span>
                      El cliente aún no ha subido su comprobante
                    </div>
                  )}

                  {selectedOrder.payment_status === "proof_uploaded" && (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleVerify(selectedOrder.id)}
                        disabled={verifying}
                        className="w-full py-3 bg-green-600 text-white font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        Verificar Pago
                      </button>
                      <button
                        onClick={() => handleReject(selectedOrder.id)}
                        className="w-full py-3 border border-red-200 text-red-500 font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">cancel</span>
                        Rechazar
                      </button>
                    </div>
                  )}

                  {selectedOrder.payment_method === "mercadopago" && selectedOrder.payment_status !== "verified" && selectedOrder.payment_status !== "rejected" && selectedOrder.status !== "confirmado" && selectedOrder.status !== "etiqueta generada" && selectedOrder.status !== "concluida" && selectedOrder.status !== "reporte" && (
                    <div className="flex flex-col gap-2">
                      <div className="bg-[#009EE3]/5 border border-[#009EE3]/20 rounded-xl p-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#009EE3] text-[18px]">info</span>
                        <p className="text-xs text-[#009EE3] font-medium">Pago en espera de confirmación de Mercado Pago</p>
                      </div>
                      <button
                        onClick={async () => {
                          setSaving(true);
                          const { createClient: cc } = await import("@/utils/supabase/client");
                          const sb = cc();
                          await sb.from("orders").update({ payment_status: "verified", status: "confirmado" }).eq("id", selectedOrder.id);
                          setSelectedOrder({ ...selectedOrder, payment_status: "verified", status: "confirmado" });
                          loadData();
                          setSaving(false);
                        }}
                        disabled={saving}
                        className="w-full py-3 bg-[#009EE3] text-white font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-[#0089c4] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        Confirmar pago recibido en MP
                      </button>
                    </div>
                  )}

                  {(selectedOrder.payment_status === "verified" || (selectedOrder.payment_method === "mercadopago" && (selectedOrder.status === "confirmado" || selectedOrder.status === "etiqueta generada" || selectedOrder.status === "concluida"))) && (
                    <div className={`rounded-xl p-4 text-center font-bold text-sm flex items-center justify-center gap-2 ${selectedOrder.payment_method === "mercadopago" ? "bg-[#009EE3]/10 text-[#009EE3]" : "bg-green-50 text-green-700"}`}>
                      <span className="material-symbols-outlined text-[20px]">verified</span>
                      {selectedOrder.payment_method === "mercadopago" ? "Pago confirmado por Mercado Pago ?" : "Pago verificado — Pedido confirmado"}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

    </div>
  );
}

