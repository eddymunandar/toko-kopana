import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { CartProvider } from "@/components/CartProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Toko KOPAMA",
  description: "Beras Berkualitas dan Kebutuhan Pokok Koperasi Pemuda Muhammadiyah",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <CartProvider>
          <Header />
          <main className="flex-1 bg-background">
            {children}
          </main>
        </CartProvider>
      </body>
    </html>
  );
}
