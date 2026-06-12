import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase.from('products').select('*').eq('id', id).single();
  
  if (!product) return {};

  const images: string[] = [];
  try {
    const parsedImages = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
    if (Array.isArray(parsedImages) && parsedImages.length > 0) {
      images.push(parsedImages[0]);
    }
  } catch {}
  
  return {
    title: `${product.name} | Cloe`,
    description: String(product.description || `Compra ${product.name} en Cloe.`).substring(0, 160),
    openGraph: {
      title: `${product.name} | Cloe`,
      description: String(product.description || `Compra ${product.name} en Cloe.`).substring(0, 160),
      url: `https://cloe-app.vercel.app/product/${id}`,
      siteName: "Cloe",
      images: images.length > 0 ? [{ url: images[0] }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Cloe`,
      description: String(product.description || `Compra ${product.name} en Cloe.`).substring(0, 160),
      images: images.length > 0 ? [images[0]] : [],
    }
  }
}

export default async function ProductLayout({ 
  children, 
  params 
}: { 
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase.from('products').select('*').eq('id', id).single();

  let schemaOrg = null;
  if (product) {
    let images: string[] = [];
    try {
      images = typeof product.images === 'string' ? JSON.parse(product.images) : product.images || [];
    } catch {}

    schemaOrg = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "image": images[0] || "",
      "description": product.description || product.name,
      "sku": product.id,
      "offers": {
        "@type": "Offer",
        "url": `https://cloe-app.vercel.app/product/${id}`,
        "priceCurrency": "MXN",
        "price": product.price,
        "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "itemCondition": "https://schema.org/NewCondition"
      }
    };
  }

  return (
    <>
      {schemaOrg && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
      )}
      {children}
    </>
  );
}
