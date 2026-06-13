/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

import { getStoreInfo } from "@/utils/storeInfo";

export async function generateMetadata(): Promise<Metadata> {
  const storeInfo = await getStoreInfo();
  return {
    title: `${storeInfo.storeName} | Moda, Accesorios y Equipaje de Lujo Exclusivo`,
    description: `Eleva tu estilo con nuestras colecciones de accesorios, bolsos y equipaje premium. Diseño atemporal y calidad inigualable para quienes exigen lo mejor.`,
    openGraph: {
      title: `${storeInfo.storeName} | Moda, Accesorios y Equipaje de Lujo Exclusivo`,
      description: "Eleva tu estilo con nuestras colecciones exclusivas. Descubre nuestra nueva temporada.",
      url: "https://cloe-app.vercel.app/",
      siteName: storeInfo.storeName,
      images: [
        {
          url: "https://cloe-app.vercel.app/og-image.jpg",
          width: 1200,
          height: 630,
          alt: `${storeInfo.storeName} Premium Fashion`,
        },
      ],
      locale: "es_MX",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${storeInfo.storeName} | Colección Exclusiva`,
      description: "Eleva tu estilo con nuestras colecciones de accesorios, bolsos y equipaje premium.",
      images: ["https://cloe-app.vercel.app/og-image.jpg"],
    },
  };
}

import { CartProvider } from "@/context/CartContext";
import { StoreInfoProvider } from "@/context/StoreInfoContext";
import FloatingChatWidget from "@/components/FloatingChatWidget";
import Footer from "@/components/Footer";
import RecoveryRedirect from "@/components/RecoveryRedirect";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const storeInfo = await getStoreInfo();
  
  const schemaOrg = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": storeInfo.storeName,
    "url": "https://cloe-app.vercel.app/",
    "logo": "https://cloe-app.vercel.app/logo.png"
  };
  return (
    <html lang="es" className="font-sans">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
      </head>
      <body className="bg-background text-on-background">
        <RecoveryRedirect />
        <StoreInfoProvider info={storeInfo}>
          <CartProvider>
            <Navbar />
            <div className="flex-1 flex flex-col min-h-screen">
              {children}
              <Footer />
            </div>
            <FloatingChatWidget />
          </CartProvider>
        </StoreInfoProvider>
      </body>
    </html>
  );
}
