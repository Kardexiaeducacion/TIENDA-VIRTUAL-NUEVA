"use client";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalPrice, totalItems, totalShipping, totalIva, totalIsr, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [requireFactura, setRequireFactura] = useState(false);
  const [facturaData, setFacturaData] = useState({ rfc: "", razonSocial: "", regimen: "" });

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-background text-on-background px-4">
        <span className="material-symbols-outlined text-6xl text-secondary mb-4">shopping_bag</span>
        <h1 className="text-3xl font-bold uppercase mb-2">Tu Carrito está vacío</h1>
        <p className="text-secondary mb-8">Parece que aún no has añadido nada a tu carrito.</p>
        <Link 
          href="/" 
          className="px-8 py-4 bg-primary text-white font-bold uppercase tracking-widest hover:bg-black transition-colors"
        >
          Ir a Comprar
        </Link>
      </div>
    );
  }

  const shippingCost = totalShipping;
  let finalTotal = totalPrice + shippingCost;
  
  if (requireFactura) {
    finalTotal += totalIva + totalIsr;
  }

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, totalPrice, shippingCost, finalTotal })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al procesar el pago");
      
      alert("¡Pago procesado con éxito! El stock ha sido descontado.");
      clearCart();
      router.push("/account/orders");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background font-sans min-h-screen pt-32 pb-20">
      <main className="max-w-[1440px] mx-auto px-6 md:px-20">
        <h1 className="text-4xl font-bold uppercase tracking-tighter mb-12">Tu Carrito ({totalItems})</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* ITEMS LIST */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="hidden md:grid grid-cols-12 text-xs font-bold text-secondary uppercase tracking-widest border-b border-outline-variant pb-4">
              <div className="col-span-6">Producto</div>
              <div className="col-span-2 text-center">Precio</div>
              <div className="col-span-2 text-center">Cantidad</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 items-center gap-6 py-6 border-b border-outline-variant">
                
                {/* Product Info */}
                <div className="md:col-span-6 flex gap-6">
                  <div className="w-24 h-32 relative bg-surface-container shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                  </div>
                  <div className="flex flex-col justify-center">
                    <Link href={`/product/${item.productId}`} className="text-lg font-bold hover:underline mb-1">
                      {item.name}
                    </Link>
                    {item.variantName && (
                      <span className="text-sm text-secondary mb-2 uppercase tracking-widest">{item.variantName}</span>
                    )}
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-xs font-semibold text-error text-left uppercase tracking-widest mt-auto hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                {/* Price (Desktop) */}
                <div className="hidden md:block md:col-span-2 text-center font-semibold">
                  ${item.price.toFixed(2)}
                </div>

                {/* Quantity */}
                <div className="md:col-span-2 flex justify-center">
                  <div className="flex items-center border border-outline-variant">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-surface-container transition-colors"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-surface-container transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Total Item Price */}
                <div className="md:col-span-2 text-right font-bold text-lg">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
            
            {/* FACTURACIÓN SECTION */}
            <div className="mt-8 bg-surface-container-lowest p-8 border border-outline-variant">
              <label className="flex items-center gap-3 cursor-pointer mb-4">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 accent-primary" 
                  checked={requireFactura} 
                  onChange={(e) => setRequireFactura(e.target.checked)} 
                />
                <span className="text-lg font-bold uppercase tracking-widest">Requiero Factura (Con RFC)</span>
              </label>
              
              {requireFactura && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-secondary uppercase">RFC</label>
                    <input 
                      type="text" 
                      className="w-full bg-background border border-outline-variant p-3 text-sm focus:outline-none focus:border-primary uppercase"
                      value={facturaData.rfc}
                      onChange={(e) => setFacturaData({...facturaData, rfc: e.target.value})}
                      placeholder="Ej. XAXX010101000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-secondary uppercase">Razón Social</label>
                    <input 
                      type="text" 
                      className="w-full bg-background border border-outline-variant p-3 text-sm focus:outline-none focus:border-primary uppercase"
                      value={facturaData.razonSocial}
                      onChange={(e) => setFacturaData({...facturaData, razonSocial: e.target.value})}
                      placeholder="Nombre o Empresa"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-secondary uppercase">Régimen Fiscal</label>
                    <select 
                      className="w-full bg-background border border-outline-variant p-3 text-sm focus:outline-none focus:border-primary"
                      value={facturaData.regimen}
                      onChange={(e) => setFacturaData({...facturaData, regimen: e.target.value})}
                    >
                      <option value="">Seleccionar Régimen</option>
                      <option value="601">601 - General de Ley Personas Morales</option>
                      <option value="612">612 - Personas Físicas con Actividades Empresariales</option>
                      <option value="626">626 - Régimen Simplificado de Confianza (RESICO)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ORDER SUMMARY */}
          <div className="lg:col-span-4">
            <div className="bg-surface-container-lowest border border-outline-variant p-8 sticky top-32">
              <h2 className="text-xl font-bold uppercase tracking-widest mb-6 border-b border-outline-variant pb-4">Resumen del Pedido</h2>
              
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between text-secondary">
                  <span>Subtotal</span>
                  <span className="font-semibold text-primary">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-secondary">
                  <span>Envío</span>
                  <span className="font-semibold text-primary">
                    {shippingCost === 0 ? "Gratis" : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                {shippingCost > 0 && (
                  <p className="text-xs text-secondary mt-[-10px]">
                    Basado en las opciones de envío de los productos.
                  </p>
                )}
                
                {requireFactura && (totalIva > 0 || totalIsr > 0) && (
                  <>
                    <div className="border-t border-outline-variant my-2"></div>
                    {totalIva > 0 && (
                      <div className="flex justify-between text-secondary">
                        <span>IVA (16%)</span>
                        <span className="font-semibold text-primary">+ ${totalIva.toFixed(2)}</span>
                      </div>
                    )}
                    {totalIsr > 0 && (
                      <div className="flex justify-between text-secondary">
                        <span>ISR Retenido</span>
                        <span className="font-semibold text-primary">+ ${totalIsr.toFixed(2)}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex justify-between items-end border-t border-outline-variant pt-4 mb-8">
                <span className="text-lg font-bold uppercase tracking-widest">Total</span>
                <span className="text-2xl font-bold">${finalTotal.toFixed(2)}</span>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-5 bg-primary text-white text-sm font-bold uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50"
              >
                {loading ? "Procesando..." : "Comprar Ahora (Simulado)"}
              </button>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-secondary text-xs">
                <span className="material-symbols-outlined text-sm">lock</span>
                Pago seguro y encriptado
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
