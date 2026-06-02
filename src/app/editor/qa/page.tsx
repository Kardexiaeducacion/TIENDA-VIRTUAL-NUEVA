"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function AdminQAPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const supabase = createClient();

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('product_questions')
      .select('*, products(name)')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setQuestions(data);
    }
    setLoading(false);
  };

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;
    
    try {
      const res = await fetch("/api/qa", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: id, answer: replyText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setReplyingTo(null);
      setReplyText("");
      fetchQuestions();
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (loading) {
    return <div className="p-8">Cargando preguntas...</div>;
  }

  const unanswered = questions.filter(q => !q.answer);
  const answered = questions.filter(q => q.answer);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">Preguntas y Respuestas</h1>
          <p className="text-gray-500 text-sm">Gestiona y responde las dudas de tus clientes sobre los productos.</p>
        </div>
        <div className="flex gap-4 text-sm font-bold">
          <div className="bg-red-50 text-red-600 px-4 py-2 rounded-md border border-red-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {unanswered.length} Pendientes
          </div>
          <div className="bg-green-50 text-green-600 px-4 py-2 rounded-md border border-green-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            {answered.length} Respondidas
          </div>
        </div>
      </div>

      {unanswered.length > 0 && (
        <div className="bg-white p-8 rounded-lg border border-[#EAEAEA] shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-black border-b border-[#EAEAEA] pb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-red-500">mark_email_unread</span>
            Por Responder
          </h2>
          <div className="space-y-6">
            {unanswered.map(q => (
              <div key={q.id} className="bg-[#F9F9F9] p-4 rounded-md border border-[#EAEAEA]">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Producto:</span>
                    <p className="text-sm font-bold text-black">{q.products?.name}</p>
                  </div>
                  <span className="text-xs text-gray-500">{new Date(q.created_at).toLocaleString()}</span>
                </div>
                
                <div className="mt-3">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">Pregunta de {q.user_name || 'Anónimo'}:</span>
                  <p className="text-base text-black mt-1 font-medium">{q.question}</p>
                </div>

                {replyingTo === q.id ? (
                  <div className="mt-4 pt-4 border-t border-[#EAEAEA]">
                    <textarea 
                      className="w-full bg-white border border-[#EAEAEA] rounded-md p-3 text-sm focus:ring-1 focus:ring-black outline-none resize-none"
                      rows={3}
                      placeholder="Escribe tu respuesta pública..."
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button onClick={() => setReplyingTo(null)} className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-black">Cancelar</button>
                      <button onClick={() => handleReply(q.id)} className="px-4 py-2 bg-black text-white rounded-md text-xs font-bold uppercase hover:bg-gray-800">Enviar Respuesta</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setReplyingTo(q.id)} className="mt-4 px-4 py-2 bg-white border border-[#EAEAEA] text-black rounded-md text-xs font-bold uppercase hover:bg-gray-50 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">reply</span> Responder
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white p-8 rounded-lg border border-[#EAEAEA] shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-black border-b border-[#EAEAEA] pb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-gray-500">forum</span>
          Historial de Respuestas
        </h2>
        {answered.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No tienes respuestas anteriores.</p>
        ) : (
          <div className="space-y-6">
            {answered.map(q => (
              <div key={q.id} className="border-b border-[#EAEAEA] pb-4 last:border-0 last:pb-0">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-xs font-bold text-gray-500 uppercase">{q.products?.name}</p>
                  <span className="text-xs text-gray-500">{new Date(q.answered_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-black mb-2"><span className="font-bold">{q.user_name || 'Anónimo'}:</span> {q.question}</p>
                <div className="bg-[#F5F5F5] p-3 rounded-md border-l-2 border-black ml-4">
                  <p className="text-xs font-bold text-black uppercase mb-1">Tu Respuesta:</p>
                  <p className="text-sm text-gray-700">{q.answer}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
