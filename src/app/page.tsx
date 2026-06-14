import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import TrendingCarousel from "@/components/TrendingCarousel";

export const revalidate = 3600; // ISR caché por 1 hora

export default async function HomePage() {
  const supabase = await createClient();

  const { data: prodData } = await supabase.from("products").select("*").neq("is_active", false).order("created_at", { ascending: false }).limit(12);

  const { data: banData } = await supabase.from("banners").select("*");
  const banners: Record<string, Record<string, unknown>> = {};
  if (banData) {
    banData.forEach((curr: Record<string, unknown>) => {
      banners[curr.section as string] = curr;
    });
  }

  return (
    <div className="bg-background text-on-background font-sans">
      <main className="mt-20">
        {/* HERO */}
        <section className="relative w-full h-[90vh] overflow-hidden bg-surface-container">
          <div className="absolute inset-0">
            <img
              alt={banners['hero']?.title as string || "COLECCIÓN ICÓNICA"}
              src={banners['hero']?.image_url as string || "https://lh3.googleusercontent.com/aida/ADBb0ui2sG7W4QW_Ljn_heyx-0-p7qNeJm6B-6JnxUbYdWEdkY7Zskp4lA4lsye2Vzeb6I-JyvyxEOkcY8Bpht9cRqNipnV0JSE8UnV45g7Prlm6ENDG8UWeD9tTaOsdmcX_N1_UfKMQ__ybTxv8wW7QuTN10axNgkD1A11zw_jtGdEEybg3V_aYRzCPZ2sR5qoUSTdvvTmuF1kUf7j5OvdZScqPbipqF4aau9kgQOtH1LoRijE1mPM3jU9Qzuwh"}
              className="absolute inset-0 w-full h-full object-cover object-center" 
              fetchpriority="high"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-transparent" />
          </div>
          <div className="relative h-full max-w-[1440px] mx-auto px-6 lg:px-20 flex flex-col justify-center items-start">
            <div className="max-w-2xl">
              <span className="text-xs font-semibold text-primary tracking-[0.2em] uppercase mb-4 block">{banners['hero']?.subtitle as string || "Lujo que perdura"}</span>
              <h1 className="text-7xl lg:text-8xl font-medium text-primary leading-none mb-6 tracking-tighter">{banners['hero']?.title as string || "COLECCIÓN ICÓNICA"}</h1>
              <p className="text-xl text-on-surface mb-12 max-w-md leading-relaxed">
                {banners['hero']?.description as string || "Descuentos finales en nuestras piezas más codiciadas. Asegura la tuya antes de que se agoten."}
              </p>
              <Link href={(banners['hero']?.link_url as string) || "/handbags"} className="inline-block bg-primary text-white px-10 py-4 text-sm font-semibold hover:bg-primary-container transition-colors uppercase tracking-widest">
                {banners['hero']?.link_text as string || "LO QUIERO"}
              </Link>
            </div>
          </div>
        </section>

        {/* SHOP BY CATEGORY */}
        <section className="max-w-[1440px] mx-auto px-6 lg:px-20 py-10 lg:py-20">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-xs font-semibold text-secondary uppercase tracking-[0.2em] block mb-2">Colecciones</span>
              <h2 className="text-4xl font-medium tracking-normal text-primary">Comprar por Categoría</h2>
            </div>
            <Link href="/handbags" className="text-sm font-medium text-primary border-b border-primary pb-1 hover:opacity-70 transition-opacity">
              Ver Todas las Categorías
            </Link>
          </div>
          <div className="grid grid-cols-12 gap-8">
            {/* Handbags - Large */}
            <Link href="/handbags" className="col-span-12 md:col-span-8 group cursor-pointer overflow-hidden border border-outline-variant">
              <div className="relative h-[600px] overflow-hidden">
                <img
                  alt="Premium Handbags Collection"
                  src={banners['category_handbags']?.image_url as string || "https://lh3.googleusercontent.com/aida/ADBb0ugjbPyixeRauJe0OfGwmJdqgCnX56IqvPi5JiTtdLvDvexhkoOfZ36Xr42zEkMIAU4jgLHboIyk3jFUTizTaeptdsTj2a4CI9mmF7x5UNj4JBcqQE83GZo6eyuX4YFr6Tfk0D9Y1HaK9JvvRPZ5AwhPpR5FdGiNYrmX08ZCvPb_IzZfR-TDZ0DgvRMMUWncPgH1AlXpFE9hjMrqgjCqZTmNPACcpaNo0eaD9GBC7tqy94iYRV8SfGjigmM9"}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-300" />
                <div className="absolute bottom-10 left-10 text-white">
                  <h3 className="text-3xl font-semibold mb-2">{banners['category_handbags']?.title as string || "Bolsas"}</h3>
                  <p className="text-sm font-semibold opacity-80 group-hover:opacity-100 transition-opacity">{banners['category_handbags']?.subtitle as string || "Descubre Siluetas Icónicas"}</p>
                </div>
              </div>
            </Link>
            {/* Stacked Side */}
            <div className="col-span-12 md:col-span-4 flex flex-col gap-8">
              <div className="group cursor-pointer border border-outline-variant flex-1 overflow-hidden">
                <div className="relative h-[284px] overflow-hidden">
                  <img
                    alt="Durable Designer Luggage"
                    src={banners['category_luggage']?.image_url as string || "https://lh3.googleusercontent.com/aida/ADBb0uhc8GHbds5co_BPboOA41MvSYlGWiz3-S2jDikp7i9ez_pr9LacPUzeNv_pGP_CK8l3btrH8Ow1zffApzbqQhjjkHVIbLU4Qv9Y8pxmRHc4-nXN0pbmXzUx9yiJi4mCBuc3F9Aw5MpMNsk9VYV175Hney7iq__3VQxdr_z_6CK6UJ2AIc_tOOcE18fewEPciyKER-Al4UuBvThkX-i6rHgTyns-fcs7YqA-DxzENeE2IXPar3ZXIBPb4N0"}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                  <div className="absolute bottom-6 left-6">
                    <h3 className="text-2xl font-semibold text-white mb-1">{banners['category_luggage']?.title as string || "Equipaje"}</h3>
                    <span className="text-xs font-semibold text-white/80 uppercase">{banners['category_luggage']?.subtitle as string || "Viaja con Estilo"}</span>
                  </div>
                </div>
              </div>
              <div className="group cursor-pointer border border-outline-variant flex-1 overflow-hidden bg-surface-container-low">
                <div className="relative h-[284px] flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-full h-full absolute inset-0 opacity-20">
                    <img
                      alt="Luxury Accessories"
                      src={banners['category_accessories']?.image_url as string || "https://lh3.googleusercontent.com/aida/ADBb0uj_fTD_OOrWfu1JL-xzC26MivraWGMoUPCYuSORArNGFjvViUz6re7pFhmmIjWLsC3Gbsdvd5y7zCChkLy0ZPh5iVJrDAH6zLxTC57wV-SDKXslLLUy3-91RxZAm3cjXfL00Q-2UqbxvwIb_QvVuD1UzVV7Tt8zyPn6dLLBPreVTDrNpeYb_e-n8-fVZpR-zL7FVndZT-DwbIaFcCll-YAEVm5vBZ8vEkXPUBFiuoja3Ra0G643SiPTvW4"}
                      className="absolute inset-0 w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-2xl font-semibold text-primary mb-2">{banners['category_accessories']?.title as string || "Accesorios"}</h3>
                    <p className="text-base text-secondary mb-4">{banners['category_accessories']?.subtitle as string || "El toque final para cada look."}</p>
                    <span className="inline-block px-4 py-2 border border-primary text-xs font-semibold hover:bg-primary hover:text-white transition-colors">{banners['category_accessories']?.link_text as string || "EXPLORAR"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* LIMITED EDITION */}
        <section className="relative w-full min-h-[600px] flex items-center bg-surface-container overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              alt="Whimsical Limited Edition"
              src={banners['limited_edition']?.image_url as string || "https://lh3.googleusercontent.com/aida/ADBb0ugCvuL3sSd2ER-Tf66oGRNrOBGuaInCYGxlud7suG51GxsXeCoCxAgExKoXXVLhwB9CVQ7rtnkdjrmCgMZvbm8Z37RSuQEwSmrPaj99rToyyPTYrjnMi8QijNgqtH0KgKb6G_GOtg4TTFO8nP03HlB2Paq0VmrFKqFr2iW6vWMuTw5ZnRGCpGV-Ou1x5P8ZvR7yez3-0aojdQ84ck_aR3C41LcvLCtoTL09P4-H5-Q2Ci9c3PaNZUiXyWKD"}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-white/60 via-transparent to-transparent" />
          </div>
          <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-20 flex justify-end w-full">
            <div className="max-w-xl bg-white/80 backdrop-blur-md p-8 lg:p-20 border border-outline-variant shadow-lg">
              <h2 className="text-5xl font-medium tracking-normal text-primary leading-tight mb-4">{banners['limited_edition']?.title as string || "Edición Limitada"}</h2>
              <p className="text-xl text-secondary mb-8 leading-relaxed">
                {banners['limited_edition']?.subtitle as string || "Experimenta nuestra última colaboración. Una fusión de encanto nostálgico y artesanía de lujo moderna."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={(banners['limited_edition']?.link_url as string) || "/handbags"} className="bg-primary text-white px-8 py-4 text-sm font-medium hover:bg-primary-container transition-all uppercase tracking-widest">{banners['limited_edition']?.link_text as string || "LO QUIERO"}</Link>
                <Link href="/search" className="border border-primary text-primary px-8 py-4 text-sm font-medium hover:bg-primary hover:text-white transition-all uppercase tracking-widest">Ver Catálogo</Link>
              </div>
            </div>
          </div>
        </section>

        {/* TRENDING NOW */}
        <TrendingCarousel products={prodData || []} />

      </main>
    </div>
  );
}
