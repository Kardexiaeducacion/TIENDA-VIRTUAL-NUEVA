import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";

export default async function CustomPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient();
  const { data: page } = await supabase.from("custom_pages").select("*").eq("slug", params.slug).single();

  if (!page) {
    notFound();
  }

  return (
    <div className="pt-32 pb-20 max-w-[1000px] mx-auto px-8 md:px-20 animate-in fade-in duration-500">
      {page.image_url && (
        <div className="relative w-full h-[300px] md:h-[400px] mb-12 overflow-hidden bg-surface-container">
          <Image src={page.image_url} alt={page.title} fill className="object-cover" unoptimized />
        </div>
      )}
      
      <h1 className="text-4xl md:text-5xl font-extrabold text-black mb-8 tracking-tighter">
        {page.title}
      </h1>
      
      <div className="prose prose-lg max-w-none text-secondary">
        {page.content ? (
          page.content.split("\n").map((paragraph: string, i: number) => (
            <p key={i} className="mb-4 leading-relaxed">{paragraph}</p>
          ))
        ) : (
          <p className="italic text-gray-400">Esta página aún no tiene contenido.</p>
        )}
      </div>
    </div>
  );
}
