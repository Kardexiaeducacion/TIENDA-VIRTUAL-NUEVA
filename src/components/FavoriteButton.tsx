"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function FavoriteButton({ productId }: { productId: string }) {
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
    e.preventDefault(); // Prevent navigating if this is inside a Link
    if (!userId) {
      alert("Inicia sesión para guardar productos en favoritos");
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

  if (loading) {
    return (
      <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center text-gray-300 pointer-events-none z-10 shadow-sm">
        <span className="material-symbols-outlined text-[18px]">favorite_border</span>
      </button>
    );
  }

  return (
    <button 
      onClick={toggleFavorite}
      className={`absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center transition-colors z-10 shadow-sm ${
        isFavorite ? "text-error" : "text-secondary hover:text-error"
      }`}
    >
      <span 
        className="material-symbols-outlined text-[18px] transition-all" 
        style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}
      >
        favorite
      </span>
    </button>
  );
}
