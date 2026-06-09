import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminSidebar from "./AdminSidebar";
import AdminHeaderSearch from "./AdminHeaderSearch";
import NotificationBell from "@/components/NotificationBell";

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile to get name and check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/account");
  }

  return (
    <div className="min-h-screen flex bg-[#FAFAFA] font-sans text-[#1C1C1C]">
      {/* SIDEBAR (Beige Background) */}
      <AdminSidebar profile={profile} email={user.email} />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-h-screen max-w-full overflow-hidden">
        {/* TOP NAVIGATION BAR */}
        <header className="h-20 bg-white border-b border-[#EAEAEA] flex items-center justify-between px-8 sticky top-0 z-30">
          <AdminHeaderSearch />
          <div className="flex items-center gap-6">
            <NotificationBell userId={user.id} />
            <Link href="/" className="flex items-center gap-2 border border-[#EAEAEA] px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors">
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              Ver Tienda
            </Link>
          </div>
        </header>

        {/* DYNAMIC PAGE CONTENT */}
        <main className="flex-1 overflow-auto p-8 lg:p-12">
          {children}
        </main>
      </div>
    </div>
  );
}
