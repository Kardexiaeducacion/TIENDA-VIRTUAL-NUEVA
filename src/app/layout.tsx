import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cloe Store",
  description: "Tienda virtual Cloe - Catálogo de productos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
