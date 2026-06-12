/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Cloe | Premium Fashion & Accessories",
  description: "High-end accessories and luggage for the modern world. Precision craft meets timeless elegance.",
  openGraph: {
    title: "Cloe | Premium Fashion & Accessories",
    description: "High-end accessories and luggage for the modern world. Precision craft meets timeless elegance.",
    url: "https://cloe-app.vercel.app/",
    siteName: "Cloe",
    images: [
      {
        url: "https://cloe-app.vercel.app/og-image.jpg", // Cambiar por la URL real de tu banner principal
        width: 1200,
        height: 630,
        alt: "Cloe Premium Fashion",
      },
    ],
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cloe | Premium Fashion & Accessories",
    description: "High-end accessories and luggage for the modern world. Precision craft meets timeless elegance.",
    images: ["https://cloe-app.vercel.app/og-image.jpg"],
  },
};

import { CartProvider } from "@/context/CartContext";
import FloatingChatWidget from "@/components/FloatingChatWidget";
import Footer from "@/components/Footer";
import RecoveryRedirect from "@/components/RecoveryRedirect";

const schemaOrg = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Cloe",
  "url": "https://cloe-app.vercel.app/",
  "logo": "https://cloe-app.vercel.app/logo.png"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        <CartProvider>
          <Navbar />
          <div className="flex-1 flex flex-col min-h-screen">
            {children}
            <Footer />
          </div>
          <FloatingChatWidget />
        </CartProvider>
      </body>
    </html>
  );
}
