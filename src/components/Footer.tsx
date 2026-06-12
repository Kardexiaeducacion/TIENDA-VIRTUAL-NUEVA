"use client";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export default function Footer() {
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [socials, setSocials] = useState<Record<string, string>>({});
  const supabase = createClient();

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from("categories").select("*");
      if (data) setCategories(data);
    }
    async function fetchSocials() {
      const { data } = await supabase.from("custom_pages").select("content").eq("slug", "social_links").single();
      if (data && data.content) {
        try { setSocials(JSON.parse(data.content)); } catch { /* ignore */ }
      }
    }
    fetchCategories();
    fetchSocials();
  }, [supabase]);

  const SocialIcon = ({ type, url }: { type: string, url: string }) => {
    if (!url) return null;
    const icons: Record<string, React.ReactNode> = {
      instagram: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>,
      facebook: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>,
      tiktok: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>,
      x: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"></path><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path></svg>
    };
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-outline-variant hover:border-black hover:text-white transition-all text-black">
        {icons[type]}
      </a>
    );
  };

  return (
    <footer className="bg-surface-container py-20 border-t border-outline-variant mt-auto">
      <div className="max-w-[1440px] mx-auto px-20 grid grid-cols-12 gap-8 mb-20">
        <div className="col-span-12 md:col-span-3">
          <Link href="/" className="text-2xl font-bold text-primary uppercase mb-6 block tracking-tighter">Cloe</Link>
          <p className="text-base text-secondary mb-6 pr-4 leading-relaxed">Accesorios de alta gama y equipaje para el mundo moderno. Precisión artesanal se encuentra con la elegancia atemporal.</p>
          <div className="flex gap-3">
            {Object.keys(socials).some(k => socials[k]) ? (
              Object.entries(socials).map(([key, url]) => (
                <SocialIcon key={key} type={key} url={url} />
              ))
            ) : (
              <p className="text-xs text-secondary italic">Redes no configuradas</p>
            )}
          </div>
        </div>
        
        {/* TIENDA */}
        <div className="col-span-6 md:col-span-2">
          <h5 className="text-sm font-semibold text-primary mb-6 uppercase tracking-widest">Tienda</h5>
          <ul className="space-y-3">
            <li><Link href="/search" className="text-sm text-secondary hover:text-primary transition-colors">Todas las Bolsas</Link></li>
            {categories?.map((cat) => (
              <li key={cat.id}>
                <Link href={`/category/${cat.slug}`} className="text-sm text-secondary hover:text-primary transition-colors">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* COMPAÑÍA */}
        <div className="col-span-6 md:col-span-2">
          <h5 className="text-sm font-semibold text-primary mb-6 uppercase tracking-widest">Compañía</h5>
          <ul className="space-y-3">
            <li><Link href="/pages/historia" className="text-sm text-secondary hover:text-primary transition-colors">Nuestra Historia</Link></li>
            <li><Link href="/pages/sustentabilidad" className="text-sm text-secondary hover:text-primary transition-colors">Sustentabilidad</Link></li>
            <li><Link href="/stores" className="text-sm text-secondary hover:text-primary transition-colors">Buscador de Tiendas</Link></li>
          </ul>
        </div>

        {/* SOPORTE */}
        <div className="col-span-6 md:col-span-2">
          <h5 className="text-sm font-semibold text-primary mb-6 uppercase tracking-widest">Soporte</h5>
          <ul className="space-y-3">
            <li>
              <button 
                onClick={() => document.getElementById('chat-widget-btn')?.click()} 
                className="text-sm text-secondary hover:text-primary transition-colors text-left"
              >
                Contáctanos
              </button>
            </li>
            <li><Link href="/pages/envios" className="text-sm text-secondary hover:text-primary transition-colors">Envíos</Link></li>
            <li><Link href="/pages/devoluciones" className="text-sm text-secondary hover:text-primary transition-colors">Devoluciones</Link></li>
            <li><Link href="/ayuda" className="text-sm text-secondary hover:text-primary transition-colors">Preguntas Frecuentes</Link></li>
          </ul>
        </div>

        {/* CUENTA */}
        <div className="col-span-6 md:col-span-2">
          <h5 className="text-sm font-semibold text-primary mb-6 uppercase tracking-widest">Cuenta</h5>
          <ul className="space-y-3">
            <li><Link href="/login" className="text-sm text-secondary hover:text-primary transition-colors">Iniciar Sesión / Registro</Link></li>
            <li><Link href="/account/orders" className="text-sm text-secondary hover:text-primary transition-colors">Estado de Orden</Link></li>
            <li><Link href="/account/favorites" className="text-sm text-secondary hover:text-primary transition-colors">Lista de Deseos</Link></li>
          </ul>
        </div>

      </div>
      <div className="max-w-[1440px] mx-auto px-20 pt-8 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="text-sm text-secondary">© 2026 Cloe. Todos los derechos reservados.</span>
        <div className="flex gap-8">
          {["Privacidad", "Términos", "Ayuda", "Contacto"].map((l) => (
            <a key={l} href="#" className="text-sm text-secondary hover:text-primary transition-colors">{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}
