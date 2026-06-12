"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Image from "next/image";

const BBVA_LOGO = "https://logodownload.org/wp-content/uploads/2019/10/bbva-logo.png";

type PaymentSettings = {
  bank_name: string;
  clabe: string;
  beneficiary: string;
  account_number: string;
  instructions: string;
  bank_logo_url?: string;
};

export default function ConfirmacionPage({ params }: { params: { orderId: string } }) {
  const searchParams = useSearchParams();
  const method = searchParams.get("method") || "spei";
  const collectionStatus = searchParams.get("collection_status") || searchParams.get("status") || "";
  const mpPaymentId = searchParams.get("payment_id") || "";
  const isPending = searchParams.get("pending") === "true" || collectionStatus === "pending";
  // Next.js 15: use React.use() para params en client components o leer directamente
  const orderId = (params as { orderId: string }).orderId;

  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [step, setStep] = useState<"payment" | "upload" | "success">("payment");
  const [trackingKey, setTrackingKey] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [reference, setReference] = useState("");

  useEffect(() => {
    const ref = "CLOE-" + orderId.substring(0, 8).toUpperCase();
    setReference(ref);

    supabase
      .from("payment_settings")
      .select("*")
      .eq("method", method === "mercadopago" ? "mercadopago" : method)
      .single()
      .then(({ data }) => { if (data) setSettings(data); });

    // If coming back from MP with approved payment, mark order as verified
    if (method === "mercadopago" && (collectionStatus === "approved" || (!isPending && collectionStatus !== "rejected"))) {
      const updatePayload: any = {
        payment_status: "verified",
        status: "confirmado",
      };
      if (mpPaymentId) updatePayload.payment_tracking_key = mpPaymentId;
      supabase.from("orders").update(updatePayload).eq("id", orderId).then(() => {});
    }
  }, [orderId, method]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleUpload = async () => {
    if (!trackingKey && !file) {
      alert("Por favor ingresa la clave de rastreo o sube una imagen del comprobante.");
      return;
    }

    setUploading(true);
    try {
      let proofUrl = null;

      if (file) {
        const ext = file.name.split(".").pop();
        const fileName = `${orderId}-${Date.now()}.${ext}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("payment-proofs")
          .upload(fileName, file, { cacheControl: "3600", upsert: true });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("payment-proofs")
          .getPublicUrl(fileName);
        proofUrl = urlData.publicUrl;
      }

      // Update order with proof
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          payment_tracking_key: trackingKey || null,
          payment_proof_url: proofUrl || null,
          payment_status: "proof_uploaded",
        })
        .eq("id", orderId);

      if (updateError) throw updateError;

      // Notificar al administrador
      const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin');
      if (admins && admins.length > 0) {
        const adminNotifs = admins.map(a => ({
          user_id: a.id,
          type: 'order',
          title: 'Nuevo Comprobante de Pago',
          body: `Un cliente acaba de subir su comprobante para el pedido ${orderId.split('-')[0].toUpperCase()}. Revisa la orden para confirmarla.`,
          order_id: orderId
        }));
        await supabase.from('notifications').insert(adminNotifs);
      }

      setStep("success");
    } catch (e: any) {
      alert("Error al subir el comprobante: " + e.message);
    } finally {
      setUploading(false);
    }
  };

  const CopyRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <div className="flex items-center gap-3">
        <span className="font-bold text-sm">{value || "—"}</span>
        {value && (
          <button
            onClick={() => handleCopy(value)}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-black transition-colors border border-gray-200 rounded px-2 py-1"
          >
            <span className="material-symbols-outlined text-[14px]">content_copy</span>
            Copiar
          </button>
        )}
      </div>
    </div>
  );

  if (step === "success" || method === "mercadopago") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-green-500 text-[48px]">check_circle</span>
          </div>
          <h1 className="text-2xl font-bold mb-3 uppercase tracking-tight">¡Orden {method === "mercadopago" ? "Confirmada" : "Creada"}!</h1>
          
          {method === "mercadopago" ? (
            isPending ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 justify-center mb-1">
                  <span className="material-symbols-outlined text-amber-500 text-[20px]">schedule</span>
                  <span className="font-bold text-amber-700 text-sm">Pago en proceso</span>
                </div>
                <p className="text-xs text-amber-600">
                  Tu pago está siendo procesado. Te notificaremos cuando sea confirmado.
                </p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 justify-center mb-1">
                  <span className="material-symbols-outlined text-green-500 text-[20px]">verified</span>
                  <span className="font-bold text-green-700 text-sm">¡Pago aprobado con éxito!</span>
                </div>
                <p className="text-xs text-green-600">
                  Hemos recibido tu pago. Comenzaremos a preparar tu pedido de inmediato.
                </p>
                {mpPaymentId && (
                  <p className="text-[10px] text-green-500 font-mono mt-2">ID de pago: {mpPaymentId}</p>
                )}
              </div>
            )
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 justify-center mb-1">
                <span className="material-symbols-outlined text-amber-500 text-[20px]">schedule</span>
                <span className="font-bold text-amber-700 text-sm">Pago en proceso de revisión</span>
              </div>
              <p className="text-xs text-amber-600">
                Revisaremos tu comprobante y confirmaremos tu pedido en un máximo de 24 horas.
              </p>
            </div>
          )}

          <p className="text-sm text-gray-500 mb-8">
            {method === "mercadopago"
              ? "Te notificaremos por correo cuando tu pedido sea enviado y recibas tu guía de rastreo."
              : "Te notificaremos cuando tu pago sea verificado y tu pedido sea enviado."}
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/account/orders"
              className="w-full py-3 bg-black text-white font-bold uppercase tracking-widest text-sm rounded-lg hover:bg-gray-800 transition-colors"
            >
              Ver mis pedidos
            </Link>
            <Link
              href="/"
              className="w-full py-3 border border-gray-200 text-gray-600 font-bold uppercase tracking-widest text-sm rounded-lg hover:bg-gray-50 transition-colors"
            >
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-10 pb-20 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {[
            { n: 1, label: "Elige método" },
            { n: 2, label: "Realiza el pago" },
            { n: 3, label: "Confirma aquí" },
          ].map((s, i) => {
            const active = (step === "payment" && s.n <= 2) || (step === "upload" && s.n <= 3);
            return (
              <div key={s.n} className="flex items-center">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  active ? "bg-[#4F46E5] text-white" : "text-gray-400"
                }`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                    active ? "bg-white text-[#4F46E5]" : "bg-gray-200 text-gray-400"
                  }`}>{s.n}</span>
                  {s.label}
                </div>
                {i < 2 && <div className="w-8 h-px bg-gray-300 mx-1" />}
              </div>
            );
          })}
        </div>

        {step === "payment" && (
          <>
            {/* Payment Method Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex gap-3 mb-6">
                <div className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 font-bold text-sm ${
                  method === "spei" ? "border-[#004A97] bg-blue-50 text-[#004A97]" : "border-gray-200 text-gray-400"
                }`}>
                  <Image src={settings?.bank_logo_url || BBVA_LOGO} alt="BBVA" width={80} height={20} className="h-5 w-auto object-contain" unoptimized />
                  Transferencia SPEI
                </div>
                <div className={`flex items-center gap-3 px-5 py-3 rounded-xl border-2 font-bold text-sm ${
                  method === "oxxo" ? "border-[#E4002B] bg-red-50 text-[#E4002B]" : "border-gray-200 text-gray-400"
                }`}>
                  <span className="bg-[#E4002B] text-white text-xs font-black px-2 py-0.5 rounded">OXXO</span>
                  Depósito en tienda
                </div>
              </div>

              {method === "spei" ? (
                <div>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-16 h-16 bg-white border border-gray-100 rounded-xl p-2 flex items-center justify-center shadow-sm">
                      <Image src={settings?.bank_logo_url || BBVA_LOGO} alt="Banco" fill className="object-contain" unoptimized />
                    </div>
                    <div>
                      <p className="font-bold text-lg">Transferencia SPEI</p>
                      <p className="text-sm text-gray-500">{settings?.bank_name || "BBVA Bancomer"}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-green-500 text-[16px]">verified</span>
                        <span className="text-xs text-green-600 font-bold">Cuenta verificada CLOE</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <CopyRow label="Banco" value={settings?.bank_name || "BBVA Bancomer"} />
                    <CopyRow label="CLABE interbancaria" value={settings?.clabe || ""} />
                    <CopyRow label="Beneficiario" value={settings?.beneficiary || ""} />
                    <CopyRow label="Referencia" value={reference} />
                  </div>
                  <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">info</span>
                    Usa la referencia única al transferir para identificar tu pago.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-16 h-16 bg-[#E4002B] rounded-xl flex items-center justify-center">
                      <span className="text-white text-xl font-black">OXXO</span>
                    </div>
                    <div>
                      <p className="font-bold text-lg">Depósito en OXXO</p>
                      <p className="text-sm text-gray-500">Paga en cualquier tienda OXXO</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-green-500 text-[16px]">verified</span>
                        <span className="text-xs text-green-600 font-bold">Cuenta verificada CLOE</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <CopyRow label="N° de convenio" value={settings?.account_number || ""} />
                    <CopyRow label="Beneficiario" value={settings?.beneficiary || ""} />
                    <CopyRow label="Referencia" value={reference} />
                  </div>
                  {settings?.instructions && (
                    <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">info</span>
                      {settings.instructions}
                    </p>
                  )}
                </div>
              )}
            </div>

            <button
              id="btn-ya-pague"
              onClick={() => setStep("upload")}
              className="w-full py-4 bg-black text-white font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-gray-800 transition-colors"
            >
              Ya realicé el pago — Subir comprobante
            </button>
          </>
        )}

        {step === "upload" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold mb-2">Confirma tu pago</h2>
            <p className="text-sm text-gray-500 mb-6">
              Sube la clave de rastreo o una foto de tu comprobante para que podamos verificar tu pago.
            </p>

            {/* Tracking Key */}
            <div className="mb-5">
              <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
                Clave de rastreo / Número de operación
              </label>
              <input
                id="input-clave-rastreo"
                type="text"
                value={trackingKey}
                onChange={(e) => setTrackingKey(e.target.value)}
                placeholder="Ej. 002180012345678901"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-black outline-none transition-all"
              />
            </div>

            {/* Image Upload */}
            <div className="mb-6">
              <label className="text-xs font-bold text-gray-500 uppercase block mb-2">
                Fotografía del baucher (comprobante)
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all"
              >
                {preview ? (
                  <div className="relative">
                    <Image src={preview} alt="preview" width={300} height={200} className="max-h-48 w-auto mx-auto rounded-lg object-contain" unoptimized />
                    <p className="text-xs text-gray-400 mt-2">{file?.name}</p>
                  </div>
                ) : (
                  <div>
                    <span className="material-symbols-outlined text-gray-300 text-[48px]">upload_file</span>
                    <p className="text-sm text-gray-400 mt-2">Toca para subir imagen</p>
                    <p className="text-xs text-gray-300">JPG, PNG — máx. 5MB</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div className="bg-blue-50 rounded-xl p-4 mb-6 text-sm text-blue-700 flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] mt-0.5">info</span>
              <span>Puedes subir la clave de rastreo, la foto del baucher, o ambas. Tu pago será verificado en máximo 24 horas.</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("payment")}
                className="flex-1 py-4 border border-gray-200 text-gray-600 font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-gray-50 transition-colors"
              >
                Atrás
              </button>
              <button
                id="btn-enviar-comprobante"
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 py-4 bg-black text-white font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    Enviando...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    Enviar comprobante
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
