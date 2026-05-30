"use client";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalPrice, totalItems } = useCart();
  const router = useRouter();

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

  const shippingCost = totalPrice > 1500 ? 0 : 150;
  const finalTotal = totalPrice + shippingCost;

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
                    <Link href={`/product/${item.id}`} className="text-lg font-bold hover:underline mb-1">
                      {item.name}
                    </Link>
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
                  <span className="font-semibold text-primary">
                    {shippingCost === 0 ? "Gratis" : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                {shippingCost > 0 && (
                  <p className="text-xs text-secondary mt-[-10px]">
                    Faltan ${(1500 - totalPrice).toFixed(2)} para envío gratis.
                  </p>
                )}
              </div>

              <div className="flex justify-between items-end border-t border-outline-variant pt-4 mb-8">
                <span className="text-lg font-bold uppercase tracking-widest">Total</span>
                <span className="text-2xl font-bold">${finalTotal.toFixed(2)}</span>
              </div>

              <button 
                onClick={() => alert("¡Pronto conectaremos esto con una pasarela de pago!")}
                className="w-full py-5 bg-primary text-white text-sm font-bold uppercase tracking-widest hover:bg-black transition-colors"
              >
                Proceder al Pago
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
