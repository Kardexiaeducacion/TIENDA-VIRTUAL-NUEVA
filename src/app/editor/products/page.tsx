"use client";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ProductsTable() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const q = searchParams?.get("q") || "";
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (data) setProducts(data);
      setLoading(false);
    };
    fetchProducts();
  }, [supabase]);

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from("products").update({ is_active: !currentStatus }).eq("id", id);
    if (!error) {
      setProducts(products.map(p => p.id === id ? { ...p, is_active: !currentStatus } : p));
    } else {
      alert("Error al actualizar estado");
    }
  };

  const deleteProduct = async (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este producto permanentemente?")) {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (!error) {
        setProducts(products.filter(p => p.id !== id));
      } else {
        alert("Error al eliminar el producto");
      }
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-500">Cargando inventario...</div>;
  }

  const filteredProducts = products.filter(p => {
    if (!q) return true;
    const term = q.toLowerCase();
    return (p.name || "").toLowerCase().includes(term) || (p.sku || "").toLowerCase().includes(term);
  });

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
                <th className="p-4">Estado</th>
                <th className="p-4">Stock</th>
                <th className="p-4 pr-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEAEA]">
              {filteredProducts && filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className={`hover:bg-gray-50 transition-colors group ${product.is_active === false ? 'opacity-60 bg-gray-50' : ''}`}>
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
                          <p className="text-xs font-mono text-gray-500 mb-1">{product.sku || "Sin SKU"}</p>
                          <p className="text-[10px] text-gray-400 line-clamp-1">{product.description}</p>
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
                    <td className="p-4">
                      {product.is_active !== false ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-[10px] font-bold uppercase rounded-md tracking-wider">Activo</span>
                      ) : (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-[10px] font-bold uppercase rounded-md tracking-wider">Pausado</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-600">{product.stock}</td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/product/${product.id}`} target="_blank" className="w-8 h-8 rounded border border-[#EAEAEA] flex items-center justify-center text-gray-600 hover:text-black hover:border-black transition-all bg-white" title="Ver en tienda">
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                        </Link>
                        <button onClick={() => toggleStatus(product.id, product.is_active !== false)} className="w-8 h-8 rounded border border-[#EAEAEA] flex items-center justify-center text-gray-600 hover:text-black hover:border-black transition-all bg-white" title={product.is_active !== false ? "Pausar publicación" : "Reanudar publicación"}>
                          <span className="material-symbols-outlined text-[18px]">{product.is_active !== false ? "pause" : "play_arrow"}</span>
                        </button>
                        <Link href={`/editor/products/edit/${product.id}`} className="w-8 h-8 rounded border border-[#EAEAEA] flex items-center justify-center text-gray-600 hover:text-black hover:border-black transition-all bg-white" title="Editar">
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </Link>
                        <button onClick={() => deleteProduct(product.id)} className="w-8 h-8 rounded border border-[#EAEAEA] flex items-center justify-center text-red-500 hover:bg-red-50 hover:border-red-200 transition-all bg-white" title="Eliminar">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-500">
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

export default function AdminProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-500">Cargando...</div>}>
      <ProductsTable />
    </Suspense>
  );
}
