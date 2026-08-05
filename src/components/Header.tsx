"use client";

import Link from 'next/link';
import { useCart } from '@/components/CartProvider';

export default function Header() {
  const { totalItems } = useCart();
  
  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-border/40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-bold text-xl tracking-tight text-primary">
            Toko KOPANA
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="transition-colors hover:text-primary text-foreground/80">Beranda</Link>
          <Link href="/" className="transition-colors hover:text-primary text-foreground/80">Katalog</Link>
          <Link href="/lacak" className="transition-colors hover:text-primary text-foreground/80">Cek Pesanan</Link>
          <Link href="/admin" className="transition-colors hover:text-primary font-bold text-primary">Admin Panel</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/keranjang" className="relative p-2 text-foreground/80 hover:text-primary transition-colors hover-lift">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="21" r="1"></circle>
              <circle cx="19" cy="21" r="1"></circle>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
            </svg>
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 h-4 w-4 bg-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
