"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, use } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

type Category = { id: string; name: string; slug: string };
type Subcategory = { id: string; category_id: string; name: string; slug: string };

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const searchParams = useSearchParams();
  const subSlug = searchParams.get("sub");
  const router = useRouter();
  
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // 1. Fetch Category by slug
      const { data: catData, error: catError } = await supabase.from("categories").select("*").eq("slug", slug).single();
      if (catError || !catData) {
        setLoading(false);
        return; // Category not found
      }
      setCategory(catData);

      // 2. Fetch Subcategories for this category
      const { data: subData } = await supabase.from("subcategories").select("*").eq("category_id", catData.id).order("name");
      if (subData) setSubcategories(subData);

      // 3. Fetch Products
      let query = supabase.from("products").select("*").eq("category_id", catData.id).order("created_at", { ascending: false });
      
      // Filter by subcategory if subSlug is present
      if (subSlug && subData) {
        const selectedSub = subData.find(s => s.slug === subSlug);
        if (selectedSub) {
          query = query.eq("subcategory_id", selectedSub.id);
        }
      }

      const { data: prodData } = await query;
      if (prodData) setProducts(prodData);
      
      setLoading(false);
    }
    fetchData();
  }, [slug, subSlug, supabase]);

  const handleSubcategoryClick = (clickedSubSlug: string) => {
    if (subSlug === clickedSubSlug) {
      // Toggle off if clicking the already selected one
      router.push(`/category/${slug}`);
    } else {
      router.push(`/category/${slug}?sub=${clickedSubSlug}`);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">Cargando...</div>;
  }

  if (!category) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-2xl font-bold uppercase">Categoría no encontrada</div>;
  }

  return (
    <div className="bg-background text-on-background font-sans min-h-screen">


      <main className="pt-20 min-h-screen">
        {/* HERO TITLE */}
        <section className="max-w-[1440px] mx-auto px-20 py-20">
          <div className="border-b border-outline-variant pb-6">
            <h1 className="text-6xl font-bold text-primary uppercase mb-3 tracking-tighter">{category.name}</h1>
            <p className="text-xl text-secondary max-w-2xl leading-relaxed">Explora nuestra colección exclusiva de {category.name.toLowerCase()}.</p>
          </div>
        </section>

        {/* PRODUCT LISTING */}
        <section className="max-w-[1440px] mx-auto px-20 grid grid-cols-12 gap-8 mb-20">
          {/* SIDEBAR */}
          <aside className="col-span-3 border-r border-outline-variant pr-8 sticky top-28 h-fit">
            <div className="space-y-10">
              {subcategories.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-6">Subcategorías</h3>
                  <ul className="space-y-3">
                    {subcategories.map((sub) => (
                      <li key={sub.id}>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            checked={subSlug === sub.slug} 
                            onChange={() => handleSubcategoryClick(sub.slug)}
                            className="border-outline text-primary focus:ring-primary cursor-pointer" 
                            type="checkbox" 
                          />
                          <span className={`text-sm font-semibold transition-colors ${subSlug === sub.slug ? "text-primary" : "text-secondary group-hover:text-primary"}`}>
                            {sub.name}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Keep other filters static for now */}
              <div>
                <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-6">Precio</h3>
                <div className="space-y-2">
                  <input className="w-full accent-black bg-surface-container h-1" type="range" />
                  <div className="flex justify-between text-xs text-secondary">
                    <span>$0</span><span>$1500+</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* PRODUCT GRID */}
          <div className="col-span-9">
            <div className="flex justify-between items-center mb-8">
              <span className="text-xs text-secondary uppercase tracking-wide">{products.length} productos</span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-primary uppercase">Ordenar por:</span>
                <select className="border-none bg-transparent text-sm font-semibold text-primary focus:ring-0 cursor-pointer outline-none">
                  <option>Más Recientes</option>
                  <option>Precio: Mayor a Menor</option>
                  <option>Precio: Menor a Mayor</option>
                </select>
              </div>
            </div>
            
            {products.length === 0 ? (
              <div className="py-20 text-center text-gray-500">
                No se encontraron productos en esta categoría.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-x-8 gap-y-16">
                {products.map((product) => {
                  const productImages = product.images as string[] | undefined;
                  const firstImage = productImages?.[0] || "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800";
                  return (
                    <Link href={`/product/${product.id}`} key={product.id as string} className="group cursor-pointer">
                      <div className="relative aspect-[3/4] overflow-hidden bg-surface-container mb-3">
                        <Image alt={product.name as string} src={firstImage} fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />
                        <div className="absolute bottom-0 left-0 w-full bg-white/90 backdrop-blur-sm py-4 text-center text-sm font-semibold uppercase tracking-widest translate-y-full group-hover:translate-y-0 transition-transform duration-300 hover:bg-primary hover:text-on-primary">
                          Ver Detalles
                        </div>
                      </div>
                      <h4 className="text-lg font-semibold text-primary mb-1">{product.name as string}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-secondary">${Number(product.price).toFixed(2)}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      
      {/* FOOTER OMITTED FOR BREVITY OR KEEP SIMPLE */}
    </div>
  );
}
