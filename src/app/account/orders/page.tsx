"use client";
import Link from "next/link";
import Image from "next/image";
import AccountSidebar from "@/components/AccountSidebar";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function MyOrdersPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch orders and their items
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            quantity,
            price_at_time,
            products (
              id,
              name,
              images,
              features
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        setOrders(data);
      }
      setLoading(false);
    }
    fetchOrders();
  }, [supabase]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center">Cargando compras...</div>;

  return (
    <div className="bg-background text-on-background font-sans min-h-screen">
      <main className="pt-32 pb-20 max-w-[1440px] mx-auto px-20">
        <div className="grid grid-cols-12 gap-8">
          
          <AccountSidebar />

          {/* ORDERS SECTION */}
          <section className="col-span-12 md:col-span-9">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-4xl font-bold text-primary">Mis Compras</h1>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input className="pl-10 pr-4 py-2 border border-outline-variant bg-surface rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-base w-64" placeholder="Buscar compra..." type="text" />
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary">search</span>
                </div>
              </div>
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
              orders.map((order) => (
                <div key={order.id} className={`bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden mb-6 hover:shadow-sm transition-shadow ${order.status === "Devuelto" ? "opacity-80" : ""}`}>
                  <div className="bg-surface-container px-6 py-4 flex items-center justify-between border-b border-outline-variant">
                    <div className="flex items-center space-x-12">
                      {[
                        { label: "Fecha", value: new Date(order.created_at).toLocaleDateString() },
                        { label: "Total", value: `$${order.total_amount}` },
                        { label: "Pedido #", value: order.id.slice(0, 8).toUpperCase() },
                      ].map((info) => (
                        <div key={info.label}>
                          <p className="text-xs text-secondary uppercase font-bold">{info.label}</p>
                          <p className="text-sm font-semibold">{info.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className={`flex items-center px-3 py-1 rounded-full space-x-1 ${order.status === 'Entregado' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                      <span className="text-sm font-semibold">{order.status || "En Tránsito"}</span>
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col gap-6">
                    {order.order_items?.map((item: any, idx: number) => {
                      const product = item.products;
                      const image = product?.images?.[0] || "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800";
                      return (
                        <div key={idx} className="flex items-start justify-between">
                          <div className="flex space-x-6">
                            <div className="relative w-24 h-24 flex-shrink-0">
                              <Image alt={product?.name || "Producto"} src={image} fill className="object-cover border border-outline-variant rounded-lg" unoptimized />
                            </div>
                            <div className="flex flex-col justify-center">
                              <h3 className="text-lg font-bold text-primary">{product?.name || "Producto no disponible"}</h3>
                              <p className="text-sm text-secondary mt-1 max-w-md leading-relaxed">Cantidad: {item.quantity}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-4">
                            <p className="text-xl font-bold">${item.price_at_time}</p>
                            <Link href={`/product/${product?.id}`} className="px-6 py-2 bg-primary text-white text-sm font-bold hover:bg-black transition-all rounded-lg">
                              Volver a Comprar
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
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
