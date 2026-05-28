"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const supabase = createClient();
  const router = useRouter();
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
        
        // If profile doesn't exist yet but user is logged in, use user meta data fallback
        if (data) {
          setProfile({ ...data, email: user.email });
        } else {
          setProfile({ 
            full_name: user.user_metadata.full_name || "Usuario",
            email: user.email,
            created_at: user.created_at
          });
        }
      }
      setLoading(false);
    }
    fetchProfile();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center">Cargando perfil...</div>;
  if (!profile) return null;

  return (
    <div className="bg-background text-on-background font-sans min-h-screen">
      <header className="fixed top-0 w-full h-20 bg-surface border-b border-outline-variant z-50">
        <div className="max-w-[1440px] mx-auto px-20 h-full flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="text-3xl font-extrabold text-primary uppercase tracking-tighter">Cloe</Link>
            <nav className="hidden md:flex items-center space-x-8">
              {["New Arrivals", "Handbags", "Shoes", "Accessories", "Sale"].map((item) => (
                <Link key={item} href="#" className="text-sm font-semibold text-secondary hover:text-primary transition-colors uppercase tracking-wider">{item}</Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/account" className="material-symbols-outlined text-primary">person</Link>
            <button className="material-symbols-outlined text-primary">favorite</button>
            <div className="relative">
              <button className="material-symbols-outlined text-primary">shopping_cart</button>
              <span className="absolute -top-1 -right-1 bg-primary text-on-primary text-[10px] w-4 h-4 rounded-full flex items-center justify-center">2</span>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-40 pb-20 max-w-[1440px] mx-auto px-20">
        <div className="grid grid-cols-12 gap-8">
          {/* SIDEBAR */}
          <aside className="col-span-3">
            <div className="sticky top-28 flex flex-col space-y-4">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-primary">Account</h2>
                <p className="text-base text-secondary">Gestiona tus preferencias</p>
              </div>
              <nav className="flex flex-col space-y-1">
                {[
                  { label: "Detalles del Perfil", icon: "person", href: "/account", active: true },
                  { label: "Mis Compras", icon: "shopping_bag", href: "/account/orders" },
                  { label: "Favoritos", icon: "favorite", href: "/account/favorites" },
                  { label: "Direcciones", icon: "location_on", href: "#" },
                  { label: "Configuración", icon: "settings", href: "#" },
                ].map((item) => (
                  <Link key={item.label} href={item.href}
                    className={`flex items-center space-x-3 p-3 text-sm font-semibold transition-all rounded-lg ${
                      item.active ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    <span className="material-symbols-outlined">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
              <div className="pt-6">
                <button onClick={handleSignOut} className="flex items-center space-x-3 p-3 text-error text-sm font-semibold hover:bg-error-container/10 transition-colors w-full rounded-lg">
                  <span className="material-symbols-outlined">logout</span>
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <section className="col-span-9">
            <h1 className="text-4xl font-bold text-primary mb-8">Detalles del Perfil</h1>

            <div className="grid grid-cols-12 gap-8">
              {/* PROFILE SUMMARY CARD */}
              <div className="col-span-4 bg-surface-container-lowest border border-outline-variant p-8 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-5xl text-secondary">person</span>
                </div>
                <h3 className="text-xl font-bold mb-1">{profile.full_name}</h3>
                <p className="text-sm text-secondary mb-1">{profile.role === 'admin' ? "👑 Administrador" : "Cliente"}</p>
                <p className="text-xs text-secondary mb-6">Miembro desde {new Date(profile.created_at).getFullYear()}</p>
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
              <div className="col-span-8">
                <div className="bg-surface-container-lowest border border-outline-variant p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Información Personal</h3>
                    {profile.role === 'admin' && (
                      <Link href="/editor" className="bg-primary text-on-primary px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-primary-container transition-all flex items-center gap-2">
                        Panel de Administración <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                      </Link>
                    )}
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-on-surface-variant">Nombre Completo</label>
                      <input disabled defaultValue={profile.full_name} className="border border-outline-variant bg-surface p-3 text-base text-secondary cursor-not-allowed" type="text" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-on-surface-variant">Correo Electrónico</label>
                      <input disabled defaultValue={profile.email} className="border border-outline-variant bg-surface p-3 text-base text-secondary cursor-not-allowed" type="email" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-on-surface-variant">Fecha de Nacimiento</label>
                        <input disabled defaultValue={profile.dob || ""} className="border border-outline-variant bg-surface p-3 text-base text-secondary cursor-not-allowed" type="date" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-on-surface-variant">Género</label>
                        <input disabled defaultValue={profile.gender || ""} className="border border-outline-variant bg-surface p-3 text-base text-secondary cursor-not-allowed" type="text" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* QUICK LINKS */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <Link href="/account/orders" className="flex items-center gap-4 p-6 border border-outline-variant hover:border-primary bg-surface-container-lowest transition-colors group">
                    <span className="material-symbols-outlined text-3xl text-primary">shopping_bag</span>
                    <div>
                      <p className="text-sm font-bold group-hover:underline">Mis Compras</p>
                      <p className="text-xs text-secondary">Ver historial</p>
                    </div>
                    <span className="material-symbols-outlined ml-auto text-secondary">chevron_right</span>
                  </Link>
                  <Link href="/account/favorites" className="flex items-center gap-4 p-6 border border-outline-variant hover:border-primary bg-surface-container-lowest transition-colors group">
                    <span className="material-symbols-outlined text-3xl text-primary">favorite</span>
                    <div>
                      <p className="text-sm font-bold group-hover:underline">Favoritos</p>
                      <p className="text-xs text-secondary">Ver wishlist</p>
                    </div>
                    <span className="material-symbols-outlined ml-auto text-secondary">chevron_right</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="w-full py-20 bg-surface-container border-t border-outline-variant">
        <div className="max-w-[1440px] mx-auto px-20 flex flex-col md:flex-row justify-between items-center gap-4">
          <Link href="/" className="text-2xl font-bold text-primary uppercase tracking-tighter">Cloe</Link>
          <p className="text-sm text-secondary">© 2024 Cloe. All rights reserved.</p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Help"].map((l) => <a key={l} href="#" className="text-sm text-secondary hover:text-primary transition-colors">{l}</a>)}
          </div>
        </div>
      </footer>
    </div>
  );
}
