import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cloe | Premium Fashion & Accessories",
  description: "High-end accessories and luggage for the modern world. Precision craft meets timeless elegance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="font-sans">
      <body className="bg-background text-on-background">
        {children}
      </body>
    </html>
  );
}
