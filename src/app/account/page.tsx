"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import AccountSidebar from "@/components/AccountSidebar";

export default function AccountPage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (data) {
          setProfile({ ...data, email: user.email });
        } else {
          setProfile({ 
            full_name: user.user_metadata?.full_name || "Usuario",
            email: user.email,
            created_at: user.created_at
          });
        }
      }
      setLoading(false);
    }
    fetchProfile();
  }, [supabase]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center">Cargando perfil...</div>;
  if (!profile) return <div className="min-h-screen bg-background flex items-center justify-center">No estás autenticado.</div>;

  return (
    <div className="bg-background text-on-background font-sans min-h-screen">
      <main className="pt-32 pb-20 max-w-[1440px] mx-auto px-20">
        <div className="grid grid-cols-12 gap-8">
          
          <AccountSidebar />

          {/* MAIN CONTENT */}
          <section className="col-span-12 md:col-span-9">
            <h1 className="text-4xl font-bold text-primary mb-8">Detalles del Perfil</h1>

            <div className="grid grid-cols-12 gap-8">
              {/* PROFILE SUMMARY CARD */}
              <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest border border-outline-variant p-8 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-5xl text-secondary">person</span>
                </div>
                <h3 className="text-xl font-bold mb-1">{profile.full_name as string}</h3>
                <p className="text-sm text-secondary mb-1">{profile.role === 'admin' ? "👑 Administrador" : "Cliente"}</p>
                <p className="text-xs text-secondary mb-6">Miembro desde {new Date(profile.created_at as string).getFullYear()}</p>
                <div className="w-full space-y-3">
                  <div className="flex justify-between border-b border-outline-variant pb-2">
                    <span className="text-xs text-secondary uppercase tracking-wide">Compras</span>
                    <span className="text-sm font-bold">0</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant pb-2">
                    <span className="text-xs text-secondary uppercase tracking-wide">Favoritos</span>
                    <span className="text-sm font-bold">0</span>
                  </div>
                </div>
              </div>

              {/* FORM */}
              <div className="col-span-12 lg:col-span-8">
                <div className="bg-surface-container-lowest border border-outline-variant p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Información Personal</h3>
                    {profile.role === 'admin' && (
                      <Link href="/editor" className="bg-primary text-white px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-primary-container transition-all flex items-center gap-2 rounded-md">
                        Panel Admin <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                      </Link>
                    )}
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-on-surface-variant">Nombre Completo</label>
                      <input disabled defaultValue={profile.full_name as string} className="border border-outline-variant bg-surface p-3 text-base text-secondary cursor-not-allowed rounded-md" type="text" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-on-surface-variant">Correo Electrónico</label>
                      <input disabled defaultValue={profile.email as string} className="border border-outline-variant bg-surface p-3 text-base text-secondary cursor-not-allowed rounded-md" type="email" />
                    </div>
                  </div>
                </div>

                {/* QUICK LINKS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <Link href="/account/orders" className="flex items-center gap-4 p-6 border border-outline-variant hover:border-primary bg-surface-container-lowest transition-colors group rounded-lg">
                    <span className="material-symbols-outlined text-3xl text-primary">shopping_bag</span>
                    <div>
                      <p className="text-sm font-bold group-hover:underline">Mis Compras</p>
                      <p className="text-xs text-secondary">Ver historial</p>
                    </div>
                    <span className="material-symbols-outlined ml-auto text-secondary">chevron_right</span>
                  </Link>
                  <Link href="/account/favorites" className="flex items-center gap-4 p-6 border border-outline-variant hover:border-primary bg-surface-container-lowest transition-colors group rounded-lg">
                    <span className="material-symbols-outlined text-3xl text-primary">favorite</span>
                    <div>
                      <p className="text-sm font-bold group-hover:underline">Lista de Deseos</p>
                      <p className="text-xs text-secondary">Ver artículos guardados</p>
                    </div>
                    <span className="material-symbols-outlined ml-auto text-secondary">chevron_right</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
