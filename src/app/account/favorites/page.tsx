"use client";
import Link from "next/link";
import Image from "next/image";
import AccountSidebar from "@/components/AccountSidebar";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function FavoritesPage() {
  const supabase = createClient();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFavorites() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);

      const { data } = await supabase
        .from("favorites")
        .select(`
          id,
          product_id,
          products (
            id,
            name,
            price,
            images
          )
        `)
        .eq("user_id", user.id);

      if (data) {
        setFavorites(data);
      }
      setLoading(false);
    }
    fetchFavorites();
  }, [supabase]);

  const removeFavorite = async (favId: string) => {
    if (!userId) return;
    
    // Optimistic UI update
    setFavorites(favorites.filter(f => f.id !== favId));

    await supabase
      .from("favorites")
      .delete()
      .eq("id", favId)
      .eq("user_id", userId);
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center">Cargando favoritos...</div>;

  return (
    <div className="bg-background text-on-background font-sans min-h-screen">
      <main className="pt-32 pb-20 max-w-[1440px] mx-auto px-20">
        <div className="grid grid-cols-12 gap-8">
          
          <AccountSidebar />

          <section className="col-span-12 md:col-span-9">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-primary mb-2">Lista de Deseos</h1>
                <p className="text-secondary">{favorites.length} artículos guardados</p>
              </div>
            </div>

            {favorites.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant p-12 text-center rounded-xl flex flex-col items-center">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">favorite_border</span>
                <h3 className="text-xl font-bold text-primary mb-2">Tu lista está vacía</h3>
                <p className="text-secondary mb-6">Guarda tus artículos favoritos haciendo clic en el corazón mientras compras.</p>
                <Link href="/" className="px-8 py-3 bg-primary text-white text-sm font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-colors">
                  Descubrir Productos
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {favorites.map((fav) => {
                  const product = fav.products;
                  if (!product) return null;
                  
                  const image = product.images?.[0] || "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800";
                  
                  return (
                    <div key={fav.id} className="group relative">
                      <div className="relative aspect-[3/4] overflow-hidden bg-surface-container mb-4 rounded-xl">
                        <Link href={`/product/${product.id}`}>
                          <Image alt={product.name} src={image} fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />
                        </Link>
                        <button 
                          onClick={() => removeFavorite(fav.id)}
                          className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary hover:text-error transition-colors shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[20px] text-error" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                        </button>
                      </div>
                      <Link href={`/product/${product.id}`}>
                        <h4 className="text-sm font-bold text-primary mb-1 line-clamp-1">{product.name}</h4>
                        <div className="flex items-center justify-between">
                          <p className="text-base text-secondary">${Number(product.price).toFixed(2)}</p>
                        </div>
                      </Link>
                      <button className="w-full mt-4 py-3 bg-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors rounded-lg">
                        Añadir al Carrito
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
