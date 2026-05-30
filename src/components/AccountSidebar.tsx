"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const navItems = [
    { label: "Detalles del Perfil", icon: "person", href: "/account", exact: true },
    { label: "Mis Compras", icon: "shopping_bag", href: "/account/orders", exact: false },
    { label: "Lista de Deseos", icon: "favorite", href: "/account/favorites", exact: false },
    { label: "Direcciones", icon: "location_on", href: "/account/addresses", exact: false },
    { label: "Configuración", icon: "settings", href: "/account/settings", exact: false },
  ];

  return (
    <aside className="col-span-12 md:col-span-3">
      <div className="sticky top-28 flex flex-col space-y-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-primary">Mi Cuenta</h2>
          <p className="text-base text-secondary">Gestiona tus preferencias</p>
        </div>
        <nav className="flex flex-col space-y-1">
          {navItems.map((item) => {
            const isActive = item.exact 
              ? pathname === item.href 
              : pathname.startsWith(item.href);

            return (
              <Link key={item.label} href={item.href}
                className={`flex items-center space-x-3 p-3 text-sm font-semibold transition-all rounded-lg ${
                  isActive ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="pt-6 border-t border-outline-variant mt-4">
          <button onClick={handleSignOut} className="flex items-center space-x-3 p-3 text-error text-sm font-semibold hover:bg-error-container/10 transition-colors w-full rounded-lg">
            <span className="material-symbols-outlined">logout</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
