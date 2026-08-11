"use client";

import { useRouter, usePathname } from 'next/navigation';

import { useState } from 'react';
import Link from 'next/link';

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { href: '/admin', label: '📊 Ringkasan' },
    { href: '/admin/pesanan', label: '🛒 Pesanan' },
    { href: '/admin/kategori', label: '🏷️ Kategori' },
    { href: '/admin/produk', label: '📦 Produk' },
    { href: '/admin/anggota', label: '👥 Data Anggota' },
    { href: '/admin/pelanggan', label: '📖 Pelanggan Web' },
    { label: '--- KEUANGAN ---', isDivider: true },
    { href: '/admin/laporan-penjualan', label: '📈 Lap. Penjualan' },
    { href: '/admin/pengeluaran', label: '💸 Pengeluaran' },
    { href: '/admin/laporan-belanja', label: '🎁 Lap. Belanja Anggota' },
    { label: '--- TAMPILAN ---', isDivider: true },
    { href: '/admin/pengaturan', label: '⚙️ Pengaturan' },
    { href: '/admin/banner', label: '🖼️ Banner' },
    { href: '/admin/promo', label: '🎫 Promo' },
  ];

  const currentMenu = menuItems.find(m => m.href === pathname)?.label || 'Menu Admin';

  return (
    <div className="md:hidden bg-foreground border-t border-white/10 relative z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-white bg-white/5"
      >
        <span className="font-medium">{currentMenu}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-foreground border-t border-white/10 shadow-xl max-h-[60vh] overflow-y-auto">
          <div className="flex flex-col py-2">
            {menuItems.map((item, idx) => (
              item.isDivider ? (
                <div key={idx} className="px-4 py-2 text-xs font-bold text-white/40 mt-2">
                  {item.label}
                </div>
              ) : (
                <Link 
                  key={idx}
                  href={item.href!}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 text-sm transition-colors ${pathname === item.href ? 'bg-primary text-white font-bold' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                >
                  {item.label}
                </Link>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
