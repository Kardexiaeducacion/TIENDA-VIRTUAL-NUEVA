"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function FavoriteTextButton({ productId }: { productId: string }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function checkFavorite() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      setUserId(user.id);

      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .single();

      if (data) {
        setIsFavorite(true);
      }
      setLoading(false);
    }
    checkFavorite();
  }, [productId, supabase]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!userId) {
      alert("Inicia sesión para guardar productos en tu lista de deseos");
      return;
    }

    setLoading(true);
    if (isFavorite) {
      await supabase
        .from("favorites")
        .delete()
        .eq("user_id", userId)
        .eq("product_id", productId);
      setIsFavorite(false);
    } else {
      await supabase
        .from("favorites")
        .insert([{ user_id: userId, product_id: productId }]);
      setIsFavorite(true);
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={toggleFavorite}
      disabled={loading}
      className={`w-full py-5 border border-primary text-sm font-semibold uppercase tracking-widest transition-all duration-300 flex justify-center items-center gap-2 ${
        isFavorite 
          ? "bg-primary text-white hover:bg-black" 
          : "bg-transparent text-primary hover:bg-surface-container-low"
      }`}
    >
      <span className="material-symbols-outlined" style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}>
        favorite
      </span>
      {isFavorite ? "Eliminar de Lista de Deseos" : "Añadir a Lista de Deseos"}
    </button>
  );
}
