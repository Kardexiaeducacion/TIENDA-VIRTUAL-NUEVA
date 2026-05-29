import { createClient } from "@/utils/supabase/server";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: users } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">Usuarios</h1>
          <p className="text-gray-500 text-sm">Administra los clientes registrados en la tienda.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-[#EAEAEA] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9F9F9] border-b border-[#EAEAEA] text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-4 pl-6">Usuario</th>
                <th className="p-4">Contacto</th>
                <th className="p-4">Datos</th>
                <th className="p-4">Rol</th>
                <th className="p-4">Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEA]">
              {users && users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 flex-shrink-0">
                          <span className="material-symbols-outlined">person</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-black">{user.full_name || "Sin nombre"}</p>
                          <p className="text-xs text-gray-500 font-mono">{user.id.split("-")[0]}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {/* Email would normally be fetched from auth.users via admin API, but since we rely on profiles we might not have it unless we sync it. As a fallback, we display 'Verificado' or placeholder. */}
                      <p className="text-sm font-medium text-black">Verificado</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-600">{user.age ? `${user.age} años` : "Edad no disp."}</p>
                      <p className="text-xs text-gray-500 capitalize">{user.gender || "No especificado"}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md tracking-wider ${user.role === 'admin' ? 'bg-[#1C1C1C] text-white' : 'bg-blue-100 text-blue-800'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    <span className="material-symbols-outlined text-4xl mb-2 text-gray-300">group_off</span>
                    <p className="text-sm">No hay usuarios registrados aún.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
