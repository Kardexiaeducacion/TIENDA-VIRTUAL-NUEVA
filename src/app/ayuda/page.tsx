"use client";
import { useState, useEffect } from "react";

export default function HelpCenterPage() {
  const [articles, setArticles] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    const res = await fetch('/api/help?activeOnly=true');
    const data = await res.json();
    if (data.success) {
      setArticles(data.articles);
    }
    setLoading(false);
  };

  const categories = ["Todos", ...Array.from(new Set(articles.map(a => a.category)))];

  const filtered = articles.filter(a => {
    const matchesSearch = a.question.toLowerCase().includes(search.toLowerCase()) || a.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "Todos" || a.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-background text-on-background font-sans min-h-screen flex flex-col">
      
      {/* HEADER */}
      <header className="pt-32 pb-16 bg-surface-container border-b border-outline-variant text-center">
        <h1 className="text-4xl font-bold uppercase tracking-tight text-primary mb-4">Centro de Ayuda</h1>
        <p className="text-secondary text-base max-w-lg mx-auto">¿En qué podemos ayudarte hoy? Busca entre nuestras preguntas frecuentes o contacta con soporte.</p>
        
        <div className="mt-8 max-w-xl mx-auto px-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input 
              type="text" 
              placeholder="Buscar (ej. envíos, devoluciones...)" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-outline-variant py-4 pl-12 pr-4 outline-none focus:border-primary text-sm shadow-sm"
            />
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1 max-w-[1000px] w-full mx-auto px-4 py-16">
        
        {/* CATEGORIES */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-colors ${
                activeCategory === cat ? "bg-primary text-white border-primary" : "bg-transparent text-secondary border-outline-variant hover:border-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ARTICLES */}
        {loading ? (
          <p className="text-center text-secondary">Cargando respuestas...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-secondary italic">No se encontraron artículos para tu búsqueda.</p>
        ) : (
          <div className="space-y-6">
            {filtered.map(article => (
              <details key={article.id} className="group bg-white border border-outline-variant p-6 cursor-pointer">
                <summary className="font-bold text-primary flex justify-between items-center list-none outline-none">
                  {article.question}
                  <span className="material-symbols-outlined text-gray-400 group-open:-rotate-180 transition-transform">expand_more</span>
                </summary>
                <div className="mt-4 pt-4 border-t border-outline-variant text-sm text-secondary leading-relaxed">
                  {article.answer}
                </div>
              </details>
            ))}
          </div>
        )}
      </main>

      {/* FOOTER CTA */}
      <div className="bg-primary text-white py-16 text-center">
        <h2 className="text-2xl font-bold uppercase tracking-tight mb-2">¿Aún necesitas ayuda?</h2>
        <p className="text-sm opacity-80 mb-6">Nuestro equipo de soporte está disponible para ti en el chat en vivo.</p>
        <button 
          onClick={() => document.getElementById("chat-widget-btn")?.click()}
          className="px-8 py-3 bg-white text-primary text-sm font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">chat</span>
          Abrir Chat de Soporte
        </button>
      </div>
    </div>
  );
}
