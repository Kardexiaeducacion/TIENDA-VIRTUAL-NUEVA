import { createClient } from "@/utils/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch orders and calculate balance
  const { data: orders } = await supabase.from("orders").select("total_amount, status");
  const { count: usersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
  
  
  const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
  
  // Calculate expenses (simulated as 40% of revenue for demonstration)
  const simulatedExpenses = totalRevenue * 0.4;
  const netProfit = totalRevenue - simulatedExpenses;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-black mb-2">Dashboard</h1>
        <p className="text-gray-500 text-sm">Resumen general del rendimiento de tu tienda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Ingresos Totales", value: `$${totalRevenue.toLocaleString()}`, icon: "payments", color: "text-green-600" },
          { title: "Egresos Estimados", value: `$${simulatedExpenses.toLocaleString()}`, icon: "trending_down", color: "text-red-500" },
          { title: "Ganancia Neta", value: `$${netProfit.toLocaleString()}`, icon: "account_balance", color: "text-blue-600" },
          { title: "Clientes Registrados", value: usersCount || 0, icon: "group", color: "text-purple-600" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-lg border border-[#EAEAEA] shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{stat.title}</p>
              <h3 className="text-3xl font-extrabold text-black">{stat.value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gray-50 ${stat.color}`}>
              <span className="material-symbols-outlined text-[24px]">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border border-[#EAEAEA] shadow-sm p-6">
          <h3 className="text-lg font-bold text-black mb-6">Últimas Ventas</h3>
          {orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.slice(0, 5).map((order: Record<string, unknown>, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-4 border border-[#EAEAEA] rounded-md">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center">
                      <span className="material-symbols-outlined text-gray-500">shopping_bag</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-black">Pedido #{Math.floor(Math.random() * 10000)}</p>
                      <p className="text-xs text-gray-500">{order.status}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-black">${Number(order.total_amount).toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-gray-400">
              <span className="material-symbols-outlined text-5xl mb-4">inbox</span>
              <p className="text-sm">Aún no hay ventas registradas.</p>
            </div>
          )}
        </div>

        <div className="bg-[#1C1C1C] rounded-lg shadow-sm p-8 text-white flex flex-col justify-between">
          <div>
            <span className="material-symbols-outlined text-4xl mb-4 text-[#C1A87D]">diamond</span>
            <h3 className="text-2xl font-bold mb-2">Cloe Premium</h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Tu tienda está configurada y lista para recibir clientes. El panel centralizado te permite controlar inventario, ventas y envíos en un solo lugar.
            </p>
          </div>
          <button className="w-full bg-white text-black py-3 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors">
            Crear Campaña
          </button>
        </div>
      </div>
    </div>
  );
}
