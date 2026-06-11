"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import FavoriteButton from "@/components/FavoriteButton";
import { useCart } from "@/context/CartContext";

export default function TrendingCarousel({ products }: { products: any[] }) {
  const router = useRouter();
  const carouselRef = useRef<HTMLDivElement>(null);
  const { items, addToCart, removeFromCart } = useCart();

  if (!products || products.length === 0) return null;

  return (
    <section className="max-w-[1440px] mx-auto px-20 py-20">
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-4xl font-medium tracking-normal text-primary">Tendencias</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => carouselRef.current?.scrollBy({ left: -carouselRef.current.offsetWidth, behavior: 'smooth' })}
            className="w-10 h-10 flex items-center justify-center border border-outline hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button 
            onClick={() => carouselRef.current?.scrollBy({ left: carouselRef.current.offsetWidth, behavior: 'smooth' })}
            className="w-10 h-10 flex items-center justify-center border border-outline hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
      <div 
        ref={carouselRef}
        className="flex overflow-x-auto snap-x snap-mandatory gap-8 pb-8 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => (
          <Link href={`/product/${product.id}`} key={product.id} className="group shrink-0 snap-start w-full md:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)]">
            <div className="aspect-[3/4] relative overflow-hidden bg-surface-container-low mb-3">
              <Image
                alt={product.name as string}
                src={(product.images as string[])?.[0] || "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800"}
                fill className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <FavoriteButton productId={product.id as string} />
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  const hasVariants = (product.variants as any[])?.length > 0;
                  if (hasVariants) {
                    router.push(`/product/${product.id}`);
                    return;
                  }
                  const cartItemId = `${product.id}_base`;
                  const isInCart = items.some((i: any) => i.id === cartItemId);
                  if (isInCart) {
                    removeFromCart(cartItemId);
                  } else {
                    addToCart(product);
                  }
                }}
                className={`absolute bottom-0 left-0 w-full py-4 text-center text-xs font-semibold uppercase tracking-widest translate-y-full group-hover:translate-y-0 transition-all duration-300 ${
                  items.some((i: any) => i.id === `${product.id}_base`)
                    ? "bg-primary text-white"
                    : "bg-white/90 backdrop-blur-sm hover:bg-primary hover:text-on-primary"
                }`}
              >
                {(product.variants as any[])?.length > 0
                  ? "VER OPCIONES"
                  : items.some((i: any) => i.id === `${product.id}_base`) 
                    ? "EN CARRITO (QUITAR)" 
                    : "VISTA RÁPIDA / AGREGAR"}
              </button>
            </div>
            <h4 className="text-sm font-medium text-primary mb-1">{product.name}</h4>
            <p className="text-sm text-secondary mb-2">${Number(product.price).toFixed(2)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
