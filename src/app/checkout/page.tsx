"use client";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

const CARRIER_LOGOS: Record<string, string> = {
  FEDEX: "https://upload.wikimedia.org/wikipedia/commons/9/9d/FedEx_Express.svg",
  DHL: "https://upload.wikimedia.org/wikipedia/commons/a/ac/DHL_Logo.svg",
  PAQUETEXPRESS: "/logos/paquetexpress.svg",
  ESTAFETA: "https://upload.wikimedia.org/wikipedia/commons/5/52/Estafeta_logo.svg"
};

const BBVA_LOGO = "https://logodownload.org/wp-content/uploads/2019/10/bbva-logo.png";

export default function CheckoutPage() {
  const { items, totalPrice, totalIva, totalIsr, clearCart } = useCart();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [quoting, setQuoting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"spei" | "oxxo" | "mercadopago">("spei");
  const [mpAvailable, setMpAvailable] = useState(false);

  const [address, setAddress] = useState({
    contact: "",
    email: "",
    phone: "",
    street: "",
    num_ext: "",
    num_int: "",
    colony: "",
    city: "",
    state: "",
    cp: "",
    reference: ""
  });

  const [quotes, setQuotes] = useState<any[]>([]);
  const [selectedQuoteId, setSelectedQuoteId] = useState("");
  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [shippingCost, setShippingCost] = useState(0);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);

  useEffect(() => {
    if (items.length === 0 && !orderCompleted) {
      router.push("/cart");
    }
  }, [items, router, orderCompleted]);

  useEffect(() => {
    const checkMp = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('payment_settings').select('mp_access_token, access_token, enabled').eq('method', 'mercadopago').single();
      if (data?.enabled && (data?.mp_access_token || data?.access_token)) {
        setMpAvailable(true);
      }
    };
    checkMp();
  }, []);

  // Autocomplete & Quote when CP is 5 digits
  useEffect(() => {
    if (address.cp.length === 5) {
      fetchLocationAndQuote();
    }
  }, [address.cp]);

  const fetchLocationAndQuote = async () => {
    // 1. Zippopotamus for location
    try {
      const res = await fetch(`https://api.zippopotam.us/mx/${address.cp}`);
      if (res.ok) {
        const data = await res.json();
        setAddress(prev => ({ ...prev, state: data.places[0]?.state || "" }));
      }
    } catch (e) {
      // ignore
    }

    // 2. Quote Shipping with Indeli
    setQuoting(true);
    setQuotes([]);
    setShippingCost(0);
    setSelectedOptionId("");
    try {
      const res = await fetch("/api/shipping/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, destinationZip: address.cp })
      });
      const data = await res.json();
      if (data.success && data.quote?.options) {
        setQuotes(data.quote.options);
        setSelectedQuoteId(data.quote.quote_id);
        if (data.quote.options.length === 1 && data.quote.options[0].option_id === "free_shipping") {
          setSelectedOptionId("free_shipping");
          setShippingCost(0);
        }
      }
    } catch (error) {
      console.error("Error quoting shipping:", error);
    } finally {
      setQuoting(false);
    }
  };

  const handleSelectOption = (opt: any) => {
    setSelectedOptionId(opt.option_id);
    setShippingCost(opt.price_mxn);
  };

  let discountAmount = 0;
  const rawTotal = totalPrice + shippingCost + totalIva + totalIsr;
  
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percentage') {
      discountAmount = totalPrice * (appliedCoupon.discount_value / 100);
    } else {
      discountAmount = appliedCoupon.discount_value;
    }
    if (rawTotal - discountAmount < 10) {
      discountAmount = rawTotal - 10;
    }
  }

  const finalTotal = rawTotal - discountAmount;

  const applyCoupon = async () => {
    if (!couponCode) return;
    setApplyingCoupon(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, cartTotal: totalPrice })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Cupón inválido");
      
      setAppliedCoupon(data.coupon);
    } catch (e: any) {
      setCouponError(e.message);
      setAppliedCoupon(null);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOptionId && quotes.length > 0) {
      alert("Por favor selecciona una opción de envío.");
      return;
    }

    const selectedOptObj = quotes.find(q => q.option_id === selectedOptionId);

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          totalPrice,
          shippingCost,
          totalIva,
          totalIsr,
          finalTotal,
          discountAmount,
          appliedCoupon,
          shippingAddress: address,
          paymentMethod,
          shippingOption: {
            quote_id: selectedQuoteId,
            option_id: selectedOptionId,
            carrier: selectedOptObj?.carrier || "N/A",
            service: selectedOptObj?.service || "N/A"
          }
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al procesar el pedido");
      
      setOrderCompleted(true);
      clearCart();

      // Mercado Pago: redirigir a Checkout Pro
      if (paymentMethod === 'mercadopago' && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      router.push(`/checkout/confirmacion/${data.orderId}?method=${paymentMethod}`);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="bg-background text-on-background font-sans min-h-screen pt-32 pb-20">
      <main className="max-w-[1200px] mx-auto px-6">
        <div className="flex items-center gap-4 mb-8 border-b border-outline-variant pb-4">
          <Link href="/cart" className="text-secondary hover:text-primary material-symbols-outlined">arrow_back</Link>
          <h1 className="text-3xl font-bold uppercase tracking-tighter">Checkout Seguro</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* ADDRESS FORM */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white p-8 rounded-lg border border-outline-variant shadow-sm">
              <h2 className="text-xl font-bold uppercase tracking-widest mb-6 border-b border-outline-variant pb-4">1. Datos de Contacto</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Nombre Completo</label>
                  <input required type="text" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none mt-1" 
                    value={address.contact} onChange={e => setAddress({...address, contact: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Correo Electrónico</label>
                  <input required type="email" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none mt-1" 
                    value={address.email} onChange={e => setAddress({...address, email: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Teléfono (10 dígitos)</label>
                  <input required type="tel" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none mt-1" 
                    value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg border border-outline-variant shadow-sm">
              <h2 className="text-xl font-bold uppercase tracking-widest mb-6 border-b border-outline-variant pb-4">2. Dirección de Envío</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Código Postal</label>
                  <input required type="text" maxLength={5} className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none mt-1" 
                    value={address.cp} onChange={e => setAddress({...address, cp: e.target.value})} placeholder="Ej. 64000" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Calle</label>
                  <input required type="text" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none mt-1" 
                    value={address.street} onChange={e => setAddress({...address, street: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Num Ext.</label>
                  <input required type="text" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none mt-1" 
                    value={address.num_ext} onChange={e => setAddress({...address, num_ext: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Num Int. (Opcional)</label>
                  <input type="text" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none mt-1" 
                    value={address.num_int} onChange={e => setAddress({...address, num_int: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Colonia</label>
                  <input required type="text" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none mt-1" 
                    value={address.colony} onChange={e => setAddress({...address, colony: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Ciudad / Municipio</label>
                  <input required type="text" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none mt-1" 
                    value={address.city} onChange={e => setAddress({...address, city: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Estado</label>
                  <input required type="text" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none mt-1" 
                    value={address.state} onChange={e => setAddress({...address, state: e.target.value})} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Referencias (Entre calles, color de casa)</label>
                  <input type="text" className="w-full bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none mt-1" 
                    value={address.reference} onChange={e => setAddress({...address, reference: e.target.value})} />
                </div>
              </div>
            </div>

            {/* PAYMENT METHOD */}
            <div className="bg-white p-8 rounded-lg border border-outline-variant shadow-sm">
              <h2 className="text-xl font-bold uppercase tracking-widest mb-6 border-b border-outline-variant pb-4">3. Método de Pago</h2>
              <div className="flex gap-3 mb-6">
                <button
                  type="button"
                  id="btn-pago-spei"
                  onClick={() => setPaymentMethod("spei")}
                  className={`flex items-center gap-3 px-5 py-3 rounded-lg border-2 font-bold text-sm transition-all ${
                    paymentMethod === "spei" ? "border-[#004A97] bg-blue-50 text-[#004A97]" : "border-[#EAEAEA] text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <img src={BBVA_LOGO} alt="BBVA" className="h-5 object-contain" />
                  Transferencia SPEI
                </button>
                <button
                  type="button"
                  id="btn-pago-oxxo"
                  onClick={() => setPaymentMethod("oxxo")}
                  className={`flex items-center gap-3 px-5 py-3 rounded-lg border-2 font-bold text-sm transition-all ${
                    paymentMethod === "oxxo" ? "border-[#E4002B] bg-red-50 text-[#E4002B]" : "border-[#EAEAEA] text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <span className="bg-[#E4002B] text-white text-xs font-black px-2 py-0.5 rounded">OXXO</span>
                  Depósito en tienda
                </button>
                {mpAvailable && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("mercadopago")}
                    className={`flex items-center gap-3 px-5 py-3 rounded-lg border-2 font-bold text-sm transition-all ${
                      paymentMethod === "mercadopago" ? "border-[#009EE3] bg-[#009EE3]/10 text-[#009EE3]" : "border-[#EAEAEA] text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">credit_card</span>
                    Tarjeta / Mercado Pago
                  </button>
                )}
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-500 flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-blue-500">info</span>
                {paymentMethod === 'mercadopago' 
                  ? "Paga de forma segura. Tus datos están protegidos."
                  : "Al confirmar el pedido, recibirás los datos de pago y podrás subir tu comprobante."}
              </div>
            </div>

            {/* SHIPPING OPTIONS */}
            {address.cp.length === 5 && (
              <div className="bg-white p-8 rounded-lg border border-outline-variant shadow-sm">
                <h2 className="text-xl font-bold uppercase tracking-widest mb-6 border-b border-outline-variant pb-4">4. Método de Envío</h2>
                {quoting ? (
                  <div className="flex items-center gap-3 text-secondary text-sm">
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    Cotizando mejores tarifas de envío...
                  </div>
                ) : quotes.length === 1 && quotes[0].option_id === "free_shipping" ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between text-green-800">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-green-600 text-2xl">local_shipping</span>
                      <div>
                        <p className="font-bold uppercase tracking-widest text-sm">ENVÍO GRATIS</p>
                        <p className="text-xs mt-1 font-medium">{quotes[0].service}</p>
                      </div>
                    </div>
                    <div className="font-bold">$0.00</div>
                  </div>
                ) : quotes.length > 0 ? (
                  <div className="space-y-4">
                    {quotes.map((opt: any) => (
                      <label key={opt.option_id} className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${selectedOptionId === opt.option_id ? 'border-black bg-gray-50' : 'border-[#EAEAEA] hover:border-gray-300'}`}>
                        <div className="flex items-center gap-4">
                          <input type="radio" name="shippingOpt" className="w-4 h-4 accent-black" checked={selectedOptionId === opt.option_id} onChange={() => handleSelectOption(opt)} />
                          {CARRIER_LOGOS[opt.carrier.toUpperCase()] && (
                            <div className="w-16 h-8 relative flex-shrink-0">
                              <img src={CARRIER_LOGOS[opt.carrier.toUpperCase()]} alt={opt.carrier} className="w-full h-full object-contain" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold uppercase tracking-widest text-sm">{opt.carrier}</p>
                            <p className="text-xs text-secondary mt-1">{opt.service} (Entrega aprox. {opt.estimated_days} días)</p>
                          </div>
                        </div>
                        <div className="font-bold">${opt.price_mxn.toFixed(2)}</div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-secondary">No se encontraron opciones de envío. Verifica el CP o tu panel logístico.</p>
                )}
              </div>
            )}
          </div>

          {/* ORDER SUMMARY */}
          <div className="lg:col-span-5">
            <div className="bg-surface-container-lowest border border-outline-variant p-8 sticky top-32">
              <h2 className="text-xl font-bold uppercase tracking-widest mb-6 border-b border-outline-variant pb-4">Resumen del Pedido</h2>
              
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <Link href={`/product/${item.productId}`} className="w-16 h-20 relative bg-surface-container shrink-0 border border-outline-variant block hover:opacity-80 transition-opacity">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                      <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold z-10">{item.quantity}</span>
                    </Link>
                    <div className="flex-1">
                      <p className="text-sm font-bold truncate">{item.name}</p>
                      {item.variantName && <p className="text-xs text-secondary">{item.variantName}</p>}
                    </div>
                    <div className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div className="border-t border-outline-variant pt-4 flex flex-col gap-3 mb-6">
                <div className="flex justify-between text-secondary text-sm">
                  <span>Subtotal</span>
                  <span className="font-semibold text-primary">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-secondary text-sm">
                  <span>Envío {quotes.length === 0 && "(Aún no cotizado)"}</span>
                  <span className="font-semibold text-primary">${shippingCost.toFixed(2)}</span>
                </div>
                {(totalIva > 0 || totalIsr > 0) && (
                  <>
                    {totalIva > 0 && (
                      <div className="flex justify-between text-secondary text-sm">
                        <span>IVA Adicional</span>
                        <span className="font-semibold text-primary">+ ${totalIva.toFixed(2)}</span>
                      </div>
                    )}
                    {totalIsr > 0 && (
                      <div className="flex justify-between text-secondary text-sm">
                        <span>Cargos Adicionales (ISR)</span>
                        <span className="font-semibold text-primary">+ ${totalIsr.toFixed(2)}</span>
                      </div>
                    )}
                  </>
                )}
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600 text-sm font-bold">
                    <span>Cupón ({appliedCoupon.code})</span>
                    <span>- ${discountAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* CUPONES */}
              <div className="mb-6 border-b border-outline-variant pb-6">
                <label className="text-xs font-bold text-gray-500 uppercase block mb-2">¿Tienes un código de descuento?</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    className="flex-1 bg-[#F5F5F5] border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none uppercase" 
                    placeholder="Ej. BUENFIN"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    disabled={applyingCoupon || appliedCoupon}
                  />
                  {!appliedCoupon ? (
                    <button 
                      type="button"
                      onClick={applyCoupon}
                      disabled={applyingCoupon || !couponCode}
                      className="bg-black text-white px-4 rounded-md text-sm font-bold uppercase tracking-widest disabled:opacity-50"
                    >
                      {applyingCoupon ? "..." : "Aplicar"}
                    </button>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => { setAppliedCoupon(null); setCouponCode(""); }}
                      className="bg-red-50 text-red-500 px-4 rounded-md text-sm font-bold uppercase tracking-widest border border-red-200 hover:bg-red-100"
                    >
                      Quitar
                    </button>
                  )}
                </div>
                {couponError && <p className="text-xs text-red-500 font-bold mt-2">{couponError}</p>}
                {appliedCoupon && <p className="text-xs text-green-600 font-bold mt-2">¡Cupón aplicado correctamente!</p>}
              </div>

              <div className="flex justify-between items-end pt-2 mb-8">
                <span className="text-lg font-bold uppercase tracking-widest">Total</span>
                <span className="text-2xl font-bold">${finalTotal.toFixed(2)}</span>
              </div>

              <button 
                type="submit"
                disabled={loading || (address.cp.length === 5 && !selectedOptionId)}
                className="w-full py-5 bg-primary text-white text-sm font-bold uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    {paymentMethod === 'mercadopago' ? 'Redirigiendo a Mercado Pago...' : 'Procesando...'}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">
                      {paymentMethod === 'mercadopago' ? 'open_in_new' : 'lock'}
                    </span>
                    {paymentMethod === 'mercadopago' ? 'Pagar con Mercado Pago' : 'Confirmar y Pagar'}
                  </>
                )}
              </button>
            </div>
          </div>

        </form>
      </main>
    </div>
  );
}
