import { createClient } from "@/utils/supabase/server";
import ProductClient from "./ProductClient";
import Link from "next/link";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = await createClient();
  const { data: product } = await supabase.from("products").select("name, description, images").eq("id", params.id).single();
  if (!product) return { title: "Producto no encontrado | Cloe" };
  
  let imageUrl = "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800";
  if (product.images) {
    try {
      const parsedImages = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
      if (Array.isArray(parsedImages) && parsedImages.length > 0) imageUrl = parsedImages[0];
    } catch {}
  }
  
  return {
    title: `${product.name} | Cloe`,
    description: product.description?.substring(0, 160) || "Producto exclusivo en Cloe",
    openGraph: {
      images: [imageUrl],
    }
  };
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  
  const { data: product } = await supabase.from("products").select("*").eq("id", params.id).single();
  
  if (!product) {
    return <div className="min-h-screen flex justify-center items-center">Producto no encontrado...</div>;
  }

  if (product.is_active === false) {
    return (
      <div className="bg-background text-on-background font-sans">
        <main className="min-h-screen flex flex-col justify-center items-center pt-20">
          <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">inventory_2</span>
          <h1 className="text-2xl font-bold mb-2">Producto no disponible</h1>
          <p className="text-secondary">Este producto se encuentra pausado temporalmente.</p>
          <Link href="/" className="mt-6 px-6 py-3 bg-primary text-white text-sm font-bold uppercase tracking-widest hover:bg-black transition-colors rounded-lg">
            Volver a la tienda
          </Link>
        </main>
      </div>
    );
  }

  let categoryName = "";
  if (product.category_id) {
    const { data: catData } = await supabase.from("categories").select("name").eq("id", product.category_id).single();
    if (catData) categoryName = catData.name;
  }

  return <ProductClient product={product} categoryName={categoryName} id={params.id} />;
}
