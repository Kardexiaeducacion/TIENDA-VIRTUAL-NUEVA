"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import FavoriteTextButton from "@/components/FavoriteTextButton";
import { useCart } from "@/context/CartContext";
import ProductQA from "@/components/ProductQA";
import ProductReviews from "@/components/ProductReviews";

const defaultImages = [
  "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800",
];

export default function ProductClient({ product, categoryName, id }: { product: any, categoryName: string, id: string }) {
  const supabase = createClient();
  const { items, addToCart, removeFromCart } = useCart();
  
  const [activeImg, setActiveImg] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<Record<string, unknown> | null>(null);
  const [session, setSession] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  let parsedImages = defaultImages;
  if (product.images) {
    try {
      parsedImages = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
      if (!Array.isArray(parsedImages) || parsedImages.length === 0) parsedImages = defaultImages;
    } catch {
      parsedImages = defaultImages;
    }
  }
  const productImages = parsedImages;

  let parsedVariants: any[] = [];
  if (product.variants) {
    try {
      parsedVariants = typeof product.variants === 'string' ? JSON.parse(product.variants) : product.variants;
      if (!Array.isArray(parsedVariants)) parsedVariants = [];
    } catch {
      parsedVariants = [];
    }
  }
  const productVariants = parsedVariants;

  return (
    <div className="bg-background text-on-background font-sans">
      <main className="pt-20">
        <div className="max-w-[1440px] mx-auto px-20 py-20">
          <div className="grid grid-cols-12 gap-8">
            {/* GALLERY */}
            <div className="col-span-12 lg:col-span-7">
              <div className="flex flex-col gap-6">
                <div className="aspect-[4/5] bg-surface-container-low overflow-hidden border border-outline-variant relative group">
                  <Image alt={product.name as string} src={productImages[activeImg]} fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {productImages.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`aspect-square bg-surface-container overflow-hidden border-2 transition-colors ${i === activeImg ? "border-primary" : "border-outline-variant hover:border-primary"}`}
                    >
                      <Image alt={`View ${i + 1}`} src={img} width={120} height={120} className="w-full h-full object-cover" unoptimized />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* DETAILS */}
            <div className="col-span-12 lg:col-span-5">
              <div className="lg:sticky lg:top-28 flex flex-col gap-6">
                <div className="border-b border-outline-variant pb-6">
                  <span className="text-xs font-semibold text-secondary uppercase tracking-widest mb-2 block">{categoryName || "Exclusivo Cloe"}</span>
                  <h1 className="text-3xl font-bold text-primary mb-2 leading-tight">{product.name as string}</h1>
                  <p className="text-3xl font-bold text-primary">${Number(product.price).toFixed(2)}</p>
                </div>

                {/* VARIANTS */}
                {productVariants.length > 0 && (
                  <div className="pt-4 border-t border-outline-variant">
                    <span className="text-sm font-bold uppercase block mb-3">Selecciona una Opción:</span>
                    <div className="flex flex-wrap gap-2">
                      {productVariants.map(variant => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariant(variant)}
                          className={`px-4 py-2 text-sm font-semibold border transition-colors ${
                            selectedVariant?.id === variant.id 
                              ? "border-primary bg-primary text-white" 
                              : "border-outline-variant text-secondary hover:border-primary"
                          } ${variant.stock <= 0 ? "opacity-50 cursor-not-allowed line-through" : ""}`}
                          disabled={variant.stock <= 0}
                        >
                          {variant.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div className="flex flex-col gap-4 pt-4">
                  {(() => {
                    const hasVariants = productVariants.length > 0;
                    const stock = hasVariants 
                      ? (selectedVariant ? selectedVariant.stock : (product.stock as number || 0))
                      : (product.stock as number || 0);

                    const isOutOfStock = hasVariants ? (selectedVariant && selectedVariant.stock <= 0) : (stock <= 0);

                    return (
                      <>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`w-2 h-2 rounded-full ${stock > 0 ? "bg-green-500" : "bg-red-500"}`}></span>
                          <span className="text-sm font-semibold">{stock > 0 ? `${stock} disponibles` : "Agotado"}</span>
                        </div>
                        <button 
                          onClick={() => {
                            if (!session) {
                              window.location.href = "/login";
                              return;
                            }
                            if (isOutOfStock) return;
                            if (hasVariants && !selectedVariant) {
                              alert("Por favor, selecciona una opción antes de añadir al carrito.");
                              return;
                            }
                            
                            const cartItemId = `${product.id}_${selectedVariant?.id || 'base'}`;
                            const isInCart = items.some((i: any) => i.id === cartItemId);
                            
                            if (isInCart) {
                              removeFromCart(cartItemId);
                            } else {
                              addToCart(product, 1, selectedVariant);
                            }
                          }}
                          disabled={isOutOfStock && !!session}
                          className={`w-full py-5 text-sm font-bold uppercase tracking-widest transition-all duration-300 border border-primary shadow-sm hover:shadow-md ${
                            !session
                              ? "bg-primary text-white hover:bg-black"
                              : isOutOfStock 
                                ? "bg-surface-container text-secondary border-outline-variant cursor-not-allowed opacity-50"
                                : items.some((i: any) => i.id === `${product.id}_${selectedVariant?.id || 'base'}`)
                                  ? "bg-transparent text-primary hover:bg-surface-container-low"
                                  : "bg-primary text-white hover:bg-black hover:-translate-y-1"
                          }`}
                        >
                          {!session 
                            ? "Inicia Sesión para Comprar"
                            : isOutOfStock 
                              ? "Agotado"
                              : items.some((i: any) => i.id === `${product.id}_${selectedVariant?.id || 'base'}`) 
                                ? "Quitar del Carrito" 
                                : "Añadir al Carrito"}
                        </button>
                      </>
                    );
                  })()}
                  <FavoriteTextButton productId={product.id as string} />
                </div>

                {/* SHARE */}
                <div className="flex items-center gap-4 pt-2">
                  <span className="text-xs font-semibold text-secondary uppercase tracking-widest">Compartir:</span>
                  <button 
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: product.name as string, url: window.location.href }).catch(console.error);
                      } else {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Enlace copiado al portapapeles');
                      }
                    }}
                    title="Compartir"
                    className="material-symbols-outlined text-secondary hover:text-primary transition-colors text-xl"
                  >
                    share
                  </button>
                  <button 
                    onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent('Mira este increíble producto: ' + product.name + ' - ' + window.location.href)}`, '_blank')}
                    className="text-secondary hover:text-primary transition-colors text-sm font-semibold"
                  >
                    WhatsApp
                  </button>
                  <button 
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                    className="text-secondary hover:text-primary transition-colors text-sm font-semibold"
                  >
                    Facebook
                  </button>
                </div>

                {/* COLLAPSIBLES */}
                <div className="mt-4 border-t border-outline-variant">
                  {/* Product Details */}
                  <div className="border-b border-outline-variant">
                    <button
                      className="w-full flex items-center justify-between py-4 cursor-pointer"
                      onClick={() => setDetailsOpen(!detailsOpen)}
                    >
                      <span className="text-sm font-bold uppercase">Detalles del Producto</span>
                      <span className={`material-symbols-outlined transition-transform ${detailsOpen ? "rotate-180" : ""}`}>expand_more</span>
                    </button>
                    {detailsOpen && (
                      <div className="pb-4 text-secondary text-base leading-relaxed">
                        <p>{product.description as string}</p>
                        
                        <div className="mt-6">
                          <h4 className="text-sm font-bold text-primary uppercase mb-3">Especificaciones</h4>
                          <ul className="space-y-2 text-sm border-t border-outline-variant pt-3">
                            {product.sku && <li><strong>SKU:</strong> {product.sku as string}</li>}
                            {product.condition && <li><strong>Condición:</strong> {product.condition as string}</li>}
                            {product.features && Object.entries(product.features as Record<string, string>).map(([key, value]) => (
                              <li key={key}><strong>{key}:</strong> {value}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Shipping */}
                  <div className="border-b border-outline-variant">
                    <button
                      className="w-full flex items-center justify-between py-4 cursor-pointer"
                      onClick={() => setShippingOpen(!shippingOpen)}
                    >
                      <span className="text-sm font-bold uppercase">Envíos y Devoluciones</span>
                      <span className={`material-symbols-outlined transition-transform ${shippingOpen ? "rotate-180" : ""}`}>expand_more</span>
                    </button>
                    {shippingOpen && (
                      <div className="pb-4 text-secondary text-base leading-relaxed">
                        <p>Envío estándar gratuito en todos los pedidos superiores a $1,500. La entrega estándar normalmente llega entre 3 a 5 días hábiles.</p>
                        <p className="mt-2">Se aceptan devoluciones dentro de los 30 días posteriores a la compra. Los artículos deben estar en su condición original y con todas sus etiquetas.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QA AND REVIEWS */}
          <div className="mt-20 pt-10 border-t border-outline-variant">
            <ProductQA productId={id} />
            <ProductReviews productId={id} />
          </div>

        </div>
      </main>
    </div>
  );
}
