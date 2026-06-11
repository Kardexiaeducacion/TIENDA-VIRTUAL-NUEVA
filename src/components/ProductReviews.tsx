"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";

export default function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState("");
  const supabase = createClient();
  const [session, setSession] = useState<any>(null);
  const [canReview, setCanReview] = useState(false);
  const [cannotReviewReason, setCannotReviewReason] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkEligibility();
      }
    });
    fetchReviews();
  }, [productId]);

  const checkEligibility = async () => {
    const res = await fetch(`/api/reviews/can-review?productId=${productId}`);
    const data = await res.json();
    if (data.canReview) {
      setCanReview(true);
    } else {
      setCanReview(false);
      setCannotReviewReason(data.reason);
    }
  };

  const fetchReviews = async () => {
    const res = await fetch(`/api/reviews?productId=${productId}`);
    const data = await res.json();
    if (data.success) {
      setReviews(data.reviews);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen no debe superar los 5MB");
        return;
      }
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setLoading(true);
    setErrorMsg("");
    
    try {
      let imageUrl = null;
      
      // Upload image if exists
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("product-reviews").upload(fileName, imageFile);
        
        if (uploadError) {
          throw new Error(`Error subiendo foto: ${uploadError.message}`);
        }
        
        const { data: { publicUrl } } = supabase.storage.from("product-reviews").getPublicUrl(fileName);
        imageUrl = publicUrl;
      }

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment, imageUrl }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setComment("");
      setRating(5);
      setImageFile(null);
      setPreview("");
      fetchReviews();
      alert("¡Gracias por tu reseña!");
    } catch (e: any) {
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="py-8 border-t border-outline-variant mt-8">
      <div className="flex items-center gap-4 mb-8">
        <h3 className="text-xl font-bold uppercase">Reseñas de Clientes</h3>
        {reviews.length > 0 && (
          <div className="flex items-center gap-1 bg-surface-container px-3 py-1 rounded-full">
            <span className="material-symbols-outlined text-amber-500 text-lg">star</span>
            <span className="font-bold">{avgRating}</span>
            <span className="text-sm text-secondary">({reviews.length})</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Formulario */}
        <div className="lg:col-span-5">
          {session ? (
            <div className="bg-surface-container p-6 rounded-lg border border-outline-variant">
              <h4 className="text-sm font-bold uppercase mb-4">Deja tu opinión</h4>
              
              {canReview ? (
                <>
                  <p className="text-xs text-secondary mb-6">Comparte tu experiencia con otros clientes.</p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-secondary uppercase mb-2">Calificación</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button 
                            key={star} 
                            type="button"
                            onClick={() => setRating(star)}
                            className={`material-symbols-outlined text-2xl transition-colors ${rating >= star ? 'text-amber-500' : 'text-gray-300'}`}
                          >
                            star
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-secondary uppercase mb-2">Comentario (Opcional)</label>
                      <textarea 
                        rows={3} 
                        className="w-full bg-background border border-outline-variant p-3 outline-none focus:border-primary resize-none text-sm"
                        placeholder="¿Qué te pareció el producto?"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-secondary uppercase mb-2">Fotografía (Opcional)</label>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange}
                        className="text-xs text-secondary file:mr-4 file:py-2 file:px-4 file:border-0 file:text-xs file:font-bold file:bg-primary file:text-white hover:file:bg-black cursor-pointer"
                      />
                      {preview && (
                        <div className="mt-4 relative w-32 h-32">
                          <Image src={preview} alt="Preview" fill className="object-cover border border-outline-variant" />
                          <button 
                            type="button" 
                            onClick={() => { setImageFile(null); setPreview(""); }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>

                    {errorMsg && <p className="text-red-500 text-sm font-semibold">{errorMsg}</p>}

                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full py-3 bg-primary text-white text-sm font-bold uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Enviando...' : 'Publicar Reseña'}
                    </button>
                  </form>
                </>
              ) : (
                <div className="bg-background border border-outline-variant p-6 text-center rounded">
                  <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">
                    {cannotReviewReason === 'already_reviewed' ? 'star_half' : 'shopping_bag'}
                  </span>
                  <p className="text-sm font-semibold text-primary mb-1">
                    {cannotReviewReason === 'already_reviewed' 
                      ? 'Ya calificaste este producto' 
                      : cannotReviewReason === 'not_completed'
                        ? 'Pedido en proceso'
                        : 'Aún no compras este producto'}
                  </p>
                  <p className="text-xs text-secondary">
                    {cannotReviewReason === 'already_reviewed' 
                      ? 'Gracias por haber compartido tu experiencia.' 
                      : cannotReviewReason === 'not_completed'
                        ? 'Podrás dejar tu reseña cuando el pedido haya sido marcado como "concluido".'
                        : 'Solo los clientes que han comprado y recibido este producto pueden dejar una reseña.'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-surface-container-low p-8 text-center border border-outline-variant flex flex-col items-center justify-center">
              <p className="text-sm font-semibold text-primary mb-4 uppercase tracking-widest">Debes iniciar sesión para calificar</p>
              <a href="/login" className="px-6 py-3 bg-primary text-white font-bold uppercase text-xs tracking-widest hover:bg-black transition-colors inline-block">
                Iniciar Sesión
              </a>
            </div>
          )}
        </div>

        {/* Lista de Reseñas */}
        <div className="lg:col-span-7 space-y-6">
          {reviews.length === 0 ? (
            <p className="text-secondary text-sm italic">Aún no hay reseñas para este producto.</p>
          ) : (
            reviews.map(r => (
              <div key={r.id} className="border-b border-outline-variant pb-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-primary">{r.user_name}</p>
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} className={`material-symbols-outlined text-[14px] ${r.rating >= star ? 'text-amber-500' : 'text-gray-300'}`}>star</span>
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-secondary">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                
                {r.comment && <p className="text-sm text-primary mt-3">{r.comment}</p>}
                
                {r.image_url && (
                  <div className="mt-4 relative w-32 h-32 border border-outline-variant cursor-pointer group">
                    <Image src={r.image_url} alt="Review" fill className="object-cover group-hover:opacity-90 transition-opacity" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
