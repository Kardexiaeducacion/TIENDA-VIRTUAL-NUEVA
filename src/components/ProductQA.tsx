"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";

export default function ProductQA({ productId }: { productId: string }) {
  const [questions, setQuestions] = useState<Record<string, unknown>[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchQuestions = useCallback(async () => {
    const res = await fetch(`/api/qa?productId=${productId}`);
    const data = await res.json();
    if (data.success) {
      setQuestions(data.questions);
    }
  }, [productId]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
    fetchQuestions();
  }, [fetchQuestions, supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !isAuthenticated) return;

    setLoading(true);
    try {
      const res = await fetch("/api/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, question: newQuestion }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setNewQuestion("");
      fetchQuestions(); // Refresh
      alert("Tu pregunta ha sido enviada. Te responderemos pronto.");
    } catch (e: unknown) {
      alert((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8">
      <h3 className="text-xl font-bold uppercase mb-6">Preguntas y Respuestas</h3>
      
      {/* Formulario de nueva pregunta */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <label className="block text-sm font-bold text-secondary mb-2 uppercase">¿Tienes alguna duda sobre este producto?</label>
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="text" 
              className="flex-1 bg-surface-container border border-outline-variant p-3 outline-none focus:border-primary"
              placeholder="Escribe tu pregunta aquí..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
            />
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-3 bg-primary text-white font-bold uppercase text-sm tracking-widest hover:bg-black disabled:opacity-50 transition-colors"
            >
              {loading ? "Enviando..." : "Preguntar"}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 bg-surface-container-low p-6 text-center border border-outline-variant flex flex-col items-center justify-center">
          <p className="text-sm font-semibold text-primary mb-4 uppercase tracking-widest">Debes iniciar sesión para preguntar</p>
          <a href="/login" className="px-6 py-3 bg-primary text-white font-bold uppercase text-xs tracking-widest hover:bg-black transition-colors inline-block">
            Iniciar Sesión
          </a>
        </div>
      )}

      {/* Lista de preguntas */}
      <div className="space-y-6">
        {questions.length === 0 ? (
          <p className="text-secondary text-sm">Aún no hay preguntas. ¡Sé el primero en preguntar!</p>
        ) : (
          questions.map(q => (
            <div key={q.id} className="border-b border-outline-variant pb-4">
              <p className="font-bold text-primary mb-1">
                <span className="material-symbols-outlined text-[16px] mr-2 text-secondary align-middle">person</span>
                {q.user_name || "Usuario"} <span className="text-xs text-secondary font-normal ml-2">{new Date(q.created_at).toLocaleDateString()}</span>
              </p>
              <p className="text-base text-primary pl-6">{q.question}</p>
              
              {q.answer ? (
                <div className="mt-3 pl-6 ml-2 border-l-2 border-outline-variant">
                  <p className="font-bold text-secondary text-xs uppercase mb-1">Respuesta de Cloe</p>
                  <p className="text-sm text-secondary">{q.answer}</p>
                </div>
              ) : (
                <div className="mt-2 pl-6">
                  <p className="text-xs text-secondary italic">Esperando respuesta...</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
