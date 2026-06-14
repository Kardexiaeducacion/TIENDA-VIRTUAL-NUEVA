"use client";
import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import { useCart } from "@/context/CartContext";



function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  const supabase = createClient();
  const { items, addToCart, removeFromCart } = useCart();

  useEffect(() => {
    async function fetchSearch() {
      setLoading(true);
      let query = supabase.from("products").select("*").neq("is_active", false);

      if (!q.trim()) {
        // If no query, just fetch all active products
        const { data } = await query.order("created_at", { ascending: false });
        setProducts(data || []);
      } else {
        // First try to find if the query matches a category name
        const { data: cats } = await supabase.from("categories").select("id").ilike("name", `%${q}%`);
        const catIds = cats ? cats.map(c => c.id) : [];

        if (catIds.length > 0) {
          // If it matches a category, show all products in those categories, OR products that match name/sku
          const catIdsStr = `(${catIds.join(",")})`;
          query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%,category_id.in.${catIdsStr}`);
        } else {
          // Just name and sku
          query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%`);
        }

        const { data } = await query.order("created_at", { ascending: false });
        setProducts(data || []);
      }
      setLoading(false);
    }
    
    fetchSearch();
  }, [q, supabase]);

  return (
    <div className="bg-background text-on-background font-sans min-h-screen pt-32 pb-20">
      <main className="max-w-[1440px] mx-auto px-6 md:px-20">
        
        <div className="mb-12 border-b border-outline-variant pb-6">
          <h1 className="text-4xl font-bold uppercase tracking-tighter mb-2">
            {q ? (
              <>Resultados para: <span className="text-primary">&quot;{q}&quot;</span></>
            ) : (
              "Todos los Productos"
            )}
          </h1>
          <p className="text-secondary text-sm font-semibold uppercase tracking-widest">
            {products.length} productos encontrados
          </p>
        </div>

        {loading ? (
          <div className="min-h-[50vh] flex items-center justify-center">
            <span className="material-symbols-outlined animate-spin text-4xl text-secondary">progress_activity</span>
          </div>
        ) : products.length === 0 ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">search_off</span>
            <h2 className="text-2xl font-bold uppercase mb-2">No se encontraron resultados</h2>
            <p className="text-secondary mb-8">Intenta buscar con otros términos, ID o categorías.</p>
            <Link href="/" className="px-8 py-4 border border-primary text-primary font-bold uppercase tracking-widest hover:bg-surface-container transition-colors">
              Volver al Inicio
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => {
              const productImages = product.images as string[] | undefined;
              const firstImage = productImages?.[0] || "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800";
              
              return (
                <div key={product.id as string} className="group cursor-pointer">
                  <div className="relative aspect-[3/4] overflow-hidden bg-surface-container mb-3 rounded-xl">
                    <Link href={`/product/${product.id}`}>
                      <Image alt={product.name as string} src={firstImage} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    </Link>
                    <FavoriteButton productId={product.id as string} />
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        const hasVariants = (product.variants as Record<string, unknown>[])?.length > 0;
                        if (hasVariants) {
                          router.push(`/product/${product.id}`);
                          return;
                        }
                        const cartItemId = `${product.id}_base`;
                        const isInCart = items.some((i) => i.id === cartItemId);
                        if (isInCart) {
                          removeFromCart(cartItemId);
                        } else {
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          addToCart(product as any);
                        }
                      }}
                      className={`absolute bottom-0 left-0 w-full py-4 text-center text-xs font-semibold uppercase tracking-widest translate-y-full group-hover:translate-y-0 transition-all duration-300 ${
                        items.some((i) => i.id === `${product.id}_base`)
                          ? "bg-primary text-white"
                          : "bg-white/90 backdrop-blur-sm hover:bg-primary hover:text-on-primary"
                      }`}
                    >
                      {(product.variants as Record<string, unknown>[])?.length > 0
                        ? "VER DETALLES"
                        : items.some((i) => i.id === `${product.id}_base`) 
                          ? "QUITAR DEL CARRITO" 
                          : "AGREGAR AL CARRITO"}
                    </button>
                  </div>
                  <Link href={`/product/${product.id}`}>
                    <h4 className="text-sm font-medium text-primary/70 mb-1 line-clamp-1">{product.name as string}</h4>
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold text-primary">${Number(product.price).toFixed(2)}</span>
                      <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1 rounded">{product.sku as string || "Sin ID"}</span>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
        
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="pt-32 text-center text-primary font-bold">Cargando Búsqueda...</div>}>
      <SearchContent />
    </Suspense>
  );
}
