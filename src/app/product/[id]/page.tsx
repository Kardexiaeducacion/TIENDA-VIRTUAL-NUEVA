"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import Navbar from "@/components/Navbar";
import FavoriteTextButton from "@/components/FavoriteTextButton";
import { useCart } from "@/context/CartContext";
import ProductQA from "@/components/ProductQA";
import ProductReviews from "@/components/ProductReviews";

const defaultImages = [
  "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800",
];

const related = [
  { name: "Tote Bag Edition", price: "$1,290.00", img: "https://lh3.googleusercontent.com/aida/ADBb0uju1fFs4ma-OQzjplOHYau1v136qUHm_3Ww41kjvhlCgXnfseVtFOmu3BzNy9NMJy6dYiFWLv1hNPLj8b4Bmnmp5GBEST1jOMt31OMKgSWa9IjJtdlXeNRuTt0AEL8d8nMx9VPYTFnd7-7ct223ezwPT-XcKQme9fsssHvWjWJsg0b5PQb8Udn3rf4d2G4-s1gSGAUjBRGlwsnHu9TiSaSpSSkkWlFfBnllgxNb0zCgQ6GKFaoEP4o2AFT8" },
  { name: "Satchel Premium", price: "$3,450.00", img: "https://lh3.googleusercontent.com/aida/ADBb0uj_fTD_OOrWfu1JL-xzC26MivraWGMoUPCYuSORArNGFjvViUz6re7pFhmmIjWLsC3Gbsdvd5y7zCChkLy0ZPh5iVJrDAH6zLxTC57wV-SDKXslLLUy3-91RxZAm3cjXfL00Q-2UqbxvwIb_QvVuD1UzVV7Tt8zyPn6dLLBPreVTDrNpeYb_e-n8-fVZpR-zL7FVndZT-DwbIaFcCll-YAEVm5vBZ8vEkXPUBFiuoja3Ra0G643SiPTvW4" },
  { name: "Clutch Noir", price: "$890.00", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC2VIs7ItAqyvYI9z3jXpkF1Gf7sR9em8HQwXXbntXqIjQNi1oYa2W9I-FIeKJ0bT9woziuvt0SsTpZOaH_TSM5vOcFzeoq0_RlDUnM7DRx_Fxz2cDks_7oUuRVWJEPkIpi_O_LSmCQ96wX332aImX2clrwWvNXTF7YaRR3mFVU5-K9_Or-nlV8ABqL2eHEPuVx14PX2oVS2EByTeRneUGoKhutN7YeWiXSoVnQ9x9Wo31XCgmplnCWRsRO6DWmGuSihCr8dtjhfzv5" },
  { name: "Mini Crossbody Red", price: "$1,990.00", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBAcg_AwJCGAL6eAawrH4nJkDUYXMFgO4l405yjxMD6zC4-A7HePWX5Cp8qnvVgkan4L6BCwym9BL9Bxznn1guDlSUBQ-RuUqLTY_sTGYtjKipTYzI5bZaWenEnQmxQ0JA-thkSyXkVAkURB9ztTYsIcq0fNN5ftO6yvteQ-X9Th7Wo286ZT46gPfOH9CI_Gbr900c6UWR2L5qhR1gL7_yaXvqMNpUbMF6ibXhWhzSnWduVPvgXiWcTjbOqh0A4yA0kmPgwkvGpwNov" },
];

export default function ProductPage() {
  const params = useParams();
  const id = params?.id as string;
  const supabase = createClient();
  const { items, addToCart, removeFromCart } = useCart();
  
  const [product, setProduct] = useState<Record<string, unknown> | null>(null);
  const [categoryName, setCategoryName] = useState<string>("");
  const [activeImg, setActiveImg] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  useEffect(() => {
    async function fetchProduct() {
      if (id) {
        const { data } = await supabase.from("products").select("*").eq("id", id).single();
        if (data) {
          setProduct(data);
          if (data.category_id) {
            const { data: catData } = await supabase.from("categories").select("name").eq("id", data.category_id).single();
            if (catData) setCategoryName(catData.name);
          }
        }
      }
    }
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!product) {
    return <div className="min-h-screen flex justify-center items-center">Cargando producto...</div>;
  }

  if (product.is_active === false) {
    return (
      <div className="bg-background text-on-background font-sans">
        <Navbar />
        <main className="min-h-screen flex flex-col justify-center items-center pt-20">
          <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">inventory_2</span>
          <h1 className="text-2xl font-bold mb-2">Producto no disponible</h1>
          <p className="text-secondary">Este producto se encuentra pausado temporalmente.</p>
          <Link href="/" className="mt-6 px-6 py-3 bg-primary text-white text-sm font-bold uppercase tracking-widest hover:bg-black transition-colors rounded-lg">
            Volver a la tienda
          </Link>
        </main>
      </div>
    );
  }

  let parsedImages = defaultImages;
  if (product.images) {
    try {
      parsedImages = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
      if (!Array.isArray(parsedImages) || parsedImages.length === 0) parsedImages = defaultImages;
    } catch (e) {
      parsedImages = defaultImages;
    }
  }
  const productImages = parsedImages;

  let parsedVariants: any[] = [];
  if (product.variants) {
    try {
      parsedVariants = typeof product.variants === 'string' ? JSON.parse(product.variants) : product.variants;
      if (!Array.isArray(parsedVariants)) parsedVariants = [];
    } catch (e) {
      parsedVariants = [];
    }
  }
  const productVariants = parsedVariants;

  return (
    <div className="bg-background text-on-background font-sans">
      {/* NAV */}
      <Navbar />

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
                          disabled={isOutOfStock}
                          className={`w-full py-5 text-sm font-semibold uppercase tracking-widest transition-all duration-300 border border-primary ${
                            isOutOfStock 
                              ? "bg-surface-container text-secondary border-outline-variant cursor-not-allowed opacity-50"
                              : items.some((i: any) => i.id === `${product.id}_${selectedVariant?.id || 'base'}`)
                                ? "bg-primary text-white hover:bg-black"
                                : "bg-transparent text-primary hover:bg-surface-container-low"
                          }`}
                        >
                          {isOutOfStock 
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
                  <button className="material-symbols-outlined text-secondary hover:text-primary transition-colors text-xl">share</button>
                  <button className="text-secondary hover:text-primary transition-colors text-sm font-semibold">WhatsApp</button>
                  <button className="text-secondary hover:text-primary transition-colors text-sm font-semibold">Facebook</button>
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

          {/* YOU MAY ALSO LIKE */}
          <section className="mt-20 pt-20 border-t border-outline-variant">
            <h2 className="text-4xl font-bold text-primary mb-12 uppercase tracking-tight">También te podría gustar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {related.map((item) => (
                <Link href="/product/2" key={item.name} className="group cursor-pointer">
                  <div className="aspect-square bg-surface-container border border-outline-variant overflow-hidden mb-4 relative">
                    <Image alt={item.name} src={item.img} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                    <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 bg-white/90 backdrop-blur-sm transition-transform duration-300 border-t border-outline-variant">
                      <button className="w-full py-2 bg-primary text-on-primary text-xs font-semibold uppercase">Agregar</button>
                    </div>
                  </div>
                  <h3 className="text-sm font-bold uppercase group-hover:underline">{item.name}</h3>
                  <p className="text-secondary text-base mt-1">{item.price}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full py-20 bg-surface-container border-t border-outline-variant mt-20">
        <div className="max-w-[1440px] mx-auto px-20 grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-4 mb-8 lg:mb-0">
            <Link href="/" className="text-2xl font-bold text-primary uppercase block mb-6 tracking-tighter">Cloe</Link>
            <p className="text-base text-secondary max-w-xs mb-8 leading-relaxed">Elevando la moda con estética editorial de autoridad desde 1988.</p>
            <div className="flex gap-6">
              {["public", "share", "alternate_email"].map((icon) => (
                <span key={icon} className="material-symbols-outlined text-secondary cursor-pointer hover:text-primary transition-colors">{icon}</span>
              ))}
            </div>
          </div>
          {[
            { title: "Tienda", links: ["Novedades", "Bolsas", "Zapatos", "Accesorios"] },
            { title: "Soporte", links: ["Centro de Ayuda", "Política de Envíos", "Devoluciones", "Contáctanos"] },
          ].map((col) => (
            <div key={col.title} className="col-span-6 lg:col-span-2">
              <h5 className="text-sm font-semibold text-primary uppercase tracking-widest mb-6">{col.title}</h5>
              <ul className="space-y-3">
                {col.links.map((l) => (<li key={l}><a href="#" className="text-sm text-secondary hover:text-primary transition-colors">{l}</a></li>))}
              </ul>
            </div>
          ))}
          <div className="col-span-12 lg:col-span-4 mt-8 lg:mt-0">
            <h5 className="text-sm font-semibold text-primary uppercase tracking-widest mb-6">Mantente Inspirado</h5>
            <p className="text-sm text-secondary mb-4">Regístrate para recibir acceso anticipado y actualizaciones.</p>
            <div className="flex border-b border-primary py-2">
              <input className="bg-transparent border-none outline-none text-sm w-full" placeholder="Correo Electrónico" type="email" />
              <button className="text-sm font-bold uppercase tracking-widest px-4">Unirme</button>
            </div>
          </div>
          <div className="col-span-12 pt-8 flex flex-col md:flex-row justify-between border-t border-outline-variant mt-8">
            <p className="text-sm text-secondary mb-4 md:mb-0">© 2024 Cloe. Todos los derechos reservados.</p>
            <div className="flex gap-8">
              {["Privacidad", "Términos", "Accesibilidad"].map((l) => (<a key={l} href="#" className="text-sm text-secondary hover:text-primary transition-colors">{l}</a>))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
