"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useStoreInfo } from "@/context/StoreInfoContext";

export default function AdminSidebar({ profile, email }: { profile: Record<string, unknown> | null, email: string | undefined }) {
  const pathname = usePathname();
  const supabase = createClient();
  const router = useRouter();
  const [pendingPayments, setPendingPayments] = useState(0);
  const { storeName } = useStoreInfo();
  
  const firstName = storeName.split(" ")[0];
  const secondName = storeName.split(" ").slice(1).join(" ") || "Studio";

  useEffect(() => {
    supabase
      .from("orders")
      .select("id", { count: "exact" })
      .eq("payment_status", "proof_uploaded")
      .then(({ count }) => setPendingPayments(count || 0));
  }, [supabase]);

  const menuItems = [
    { label: "Resumen", icon: "dashboard", href: "/editor" },
    { label: "Productos", icon: "inventory_2", href: "/editor/products" },
    { label: "Categorías", icon: "category", href: "/editor/categories" },
    { label: "Ventas", icon: "point_of_sale", href: "/editor/orders" },
    { label: "Pagos", icon: "payments", href: "/editor/payments", badge: pendingPayments },
    { label: "Envíos", icon: "local_shipping", href: "/editor/shipping" },
    { label: "Usuarios", icon: "group", href: "/editor/users" },
    { label: "Preguntas y Respuestas", icon: "forum", href: "/editor/qa" },
    { label: "Soporte (Chat)", icon: "support_agent", href: "/editor/support" },
    { label: "Centro de Ayuda", icon: "help_center", href: "/editor/help-center" },
    { label: "Banners", icon: "view_carousel", href: "/editor/banners" },
    { label: "Páginas", icon: "article", href: "/editor/pages" },
    { label: "Sucursales", icon: "store", href: "/editor/stores" },
    { label: "Cupones", icon: "sell", href: "/editor/coupons" },
    { label: "Configuración", icon: "settings", href: "/editor/settings" },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="w-[280px] bg-[#F2EFE8] flex flex-col border-r border-[#E5E2DA] z-40 sticky top-0 h-screen">
      {/* LOGO */}
      <div className="p-8 pb-6">
        <Link href="/editor" className="block text-3xl font-extrabold uppercase tracking-tighter leading-none text-black">
          {firstName}<br/>{secondName}
        </Link>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/editor");
          return (
            <Link 
              key={item.label} 
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-md text-[13px] font-bold uppercase tracking-wider transition-all ${
                isActive 
                  ? "bg-[#1C1C1C] text-white shadow-sm" 
                  : "text-gray-600 hover:bg-[#EAE6DD] hover:text-black"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {(item as any).badge > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {(item as any).badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* USER PROFILE */}
      <div className="p-4 mt-auto">
        <div className="flex items-center justify-between hover:bg-[#EAE6DD] p-3 rounded-md transition-colors cursor-pointer group">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-[#1C1C1C] rounded-md flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">{profile?.full_name?.charAt(0) || "A"}</span>
            </div>
            <div className="overflow-hidden">
              <p className="text-[13px] font-bold text-black truncate">{profile?.full_name || "Propietario"}</p>
              <p className="text-[11px] text-gray-500 truncate">{email}</p>
            </div>
          </div>
          <button onClick={handleSignOut} className="material-symbols-outlined text-gray-500 hover:text-black transition-colors" title="Cerrar Sesión">
            logout
          </button>
        </div>
      </div>
    </aside>
  );
}
