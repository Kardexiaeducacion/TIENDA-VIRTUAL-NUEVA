"use client";
import { useState, useEffect } from "react";

export default function AdminHelpCenter() {
  const [articles, setArticles] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [category, setCategory] = useState("Envíos");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    const res = await fetch('/api/help');
    const data = await res.json();
    if (data.success) setArticles(data.articles);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !answer) return;

    try {
      const res = await fetch('/api/help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, question, answer })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setQuestion("");
      setAnswer("");
      fetchArticles();
    } catch (e: unknown) {
      alert((e as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este artículo?")) return;
    try {
      const res = await fetch(`/api/help?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Error eliminando");
      fetchArticles();
    } catch (e: unknown) {
      alert("Error eliminando FAQ: " + (e as Error).message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-black mb-2">Centro de Ayuda</h1>
        <p className="text-gray-500 text-sm">Administra las Preguntas Frecuentes (FAQs) que ven tus clientes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORM */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg border border-[#EAEAEA] shadow-sm h-fit">
          <h2 className="text-lg font-bold text-black mb-4">Nuevo Artículo</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoría</label>
              <select 
                value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-[#EAEAEA] p-2 text-sm rounded-md focus:ring-1 outline-none"
              >
                <option value="Envíos">Envíos y Entregas</option>
                <option value="Devoluciones">Devoluciones</option>
                <option value="Pagos">Pagos y Facturación</option>
                <option value="Cuenta">Mi Cuenta</option>
                <option value="General">General</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pregunta (Título)</label>
              <input 
                type="text" 
                value={question} onChange={(e) => setQuestion(e.target.value)}
                className="w-full border border-[#EAEAEA] p-2 text-sm rounded-md focus:ring-1 outline-none"
                placeholder="Ej. ¿Cuánto tarda el envío?"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Respuesta (Solución)</label>
              <textarea 
                rows={5}
                value={answer} onChange={(e) => setAnswer(e.target.value)}
                className="w-full border border-[#EAEAEA] p-2 text-sm rounded-md focus:ring-1 outline-none resize-none"
                placeholder="Escribe la solución detallada..."
              />
            </div>
            <button type="submit" className="w-full py-2 bg-black text-white text-sm font-bold uppercase rounded-md hover:bg-gray-800">
              Agregar FAQ
            </button>
          </form>
        </div>

        {/* LIST */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? <p>Cargando...</p> : articles.length === 0 ? <p className="text-sm text-gray-500 italic">No hay artículos. Crea uno nuevo.</p> : (
            articles.map(article => (
              <div key={article.id} className="bg-white p-4 rounded-lg border border-[#EAEAEA] flex justify-between items-start group">
                <div>
                  <span className="text-[10px] font-bold text-primary uppercase bg-[#F5F5F5] px-2 py-1 rounded-sm mb-2 inline-block">{article.category}</span>
                  <p className="font-bold text-black text-sm mb-1">{article.question}</p>
                  <p className="text-xs text-gray-600 line-clamp-2">{article.answer}</p>
                </div>
                <button onClick={() => handleDelete(article.id)} className="material-symbols-outlined text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                  delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
