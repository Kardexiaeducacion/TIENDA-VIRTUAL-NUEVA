"use client";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalPrice, totalItems, totalIva, totalIsr } = useCart();

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

  const finalTotal = totalPrice + totalIva + totalIsr;

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
                  <Link href={`/product/${item.productId}`} className="w-24 h-32 relative bg-surface-container shrink-0 block hover:opacity-80 transition-opacity">
                    <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
                  </Link>
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
                  <span className="font-semibold text-primary text-xs">Calculado en el checkout</span>
                </div>
                
                {(totalIva > 0 || totalIsr > 0) && (
                  <>
                    <div className="border-t border-outline-variant my-2"></div>
                    {totalIva > 0 && (
                      <div className="flex justify-between text-secondary">
                        <span>IVA Adicional</span>
                        <span className="font-semibold text-primary">+ ${totalIva.toFixed(2)}</span>
                      </div>
                    )}
                    {totalIsr > 0 && (
                      <div className="flex justify-between text-secondary">
                        <span>Cargos Adicionales (ISR)</span>
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

              <Link 
                href="/checkout"
                className="w-full py-5 bg-primary text-white text-sm font-bold uppercase tracking-widest hover:bg-black hover:-translate-y-1 hover:shadow-lg transition-all duration-300 block text-center shadow-md"
              >
                Proceder al Pago
              </Link>
              
              <div className="mt-8 flex flex-col items-center gap-4 bg-surface px-4 py-6 border border-outline-variant">
                <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest">
                  <span className="material-symbols-outlined text-lg text-green-700">verified_user</span>
                  <span className="text-green-700">Checkout 100% Seguro</span>
                </div>
                <div className="flex items-center justify-center gap-6 opacity-80 mix-blend-multiply">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" width="45" height="15" className="object-contain" loading="lazy" decoding="async" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" width="35" height="20" className="object-contain" loading="lazy" decoding="async" />
                  <img src="https://http2.mlstatic.com/frontend-assets/ui-navigation/5.19.5/mercadopago/logo__large.png" alt="Mercado Pago" width="70" height="20" className="object-contain" loading="lazy" decoding="async" />
                </div>
                <div className="flex flex-col items-center text-[10px] text-secondary text-center gap-1 uppercase tracking-wider mt-2">
                  <div className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">local_shipping</span> Envío Gratis desde $1,500</div>
                  <div className="flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">assignment_return</span> 30 Días para Devoluciones</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
