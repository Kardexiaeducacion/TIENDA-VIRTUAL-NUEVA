import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase.from("products").select("*").order("created_at", { ascending: false });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-black mb-2">Productos</h1>
          <p className="text-gray-500 text-sm">Gestiona el inventario de tu tienda.</p>
        </div>
        <Link href="/editor/products/new" className="flex items-center gap-2 bg-[#1C1C1C] text-white px-5 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors shadow-sm">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Nuevo Producto
        </Link>
      </div>

      <div className="bg-white rounded-lg border border-[#EAEAEA] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F9F9F9] border-b border-[#EAEAEA] text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-4 pl-6">Producto</th>
                <th className="p-4">Precio</th>
                <th className="p-4">Envío</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Fecha</th>
                <th className="p-4 pr-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEA]">
              {products && products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden relative flex-shrink-0">
                          {product.images && product.images.length > 0 ? (
                            <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">image</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-black line-clamp-1">{product.name}</p>
                          <p className="text-xs text-gray-500 line-clamp-1">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-bold text-black">${Number(product.price).toLocaleString()}</td>
                    <td className="p-4">
                      {Number(product.shipping_cost) === 0 ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-[10px] font-bold uppercase rounded-md tracking-wider">Gratis</span>
                      ) : (
                        <span className="text-sm text-gray-600">${Number(product.shipping_cost).toLocaleString()}</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-600">{product.stock}</td>
                    <td className="p-4 text-xs text-gray-500">{new Date(product.created_at).toLocaleDateString()}</td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/editor/products/edit/${product.id}`} className="w-8 h-8 rounded border border-[#EAEAEA] flex items-center justify-center text-gray-600 hover:text-black hover:border-black transition-all bg-white" title="Editar">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </Link>
                        <button className="w-8 h-8 rounded border border-[#EAEAEA] flex items-center justify-center text-red-500 hover:bg-red-50 hover:border-red-200 transition-all bg-white" title="Eliminar">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-500">
                    <span className="material-symbols-outlined text-4xl mb-2 text-gray-300">inventory_2</span>
                    <p className="text-sm">No hay productos publicados aún.</p>
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
