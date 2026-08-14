"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/components/CartProvider';
import { useTheme } from '@/components/ThemeProvider';
import { useCustomerAuth } from '@/components/CustomerAuthProvider';
import { getNotifications } from '@/lib/api';
import { useEffect, useState } from 'react';

export default function Header() {
  const { totalItems } = useCart();
  const { theme, setTheme } = useTheme();
  
  const { customer } = useCustomerAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (customer?.phone) {
      getNotifications(customer.phone).then(notifs => {
        setUnreadCount(notifs.filter(n => !n.is_read).length);
      });
    } else {
      setUnreadCount(0);
    }
  }, [customer]);

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };
  
  return (
    <header className="sticky top-0 z-50 w-full bg-primary shadow-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Image
              src="/icons/logo-transparent.jpg"
              alt="Logo Toko Kopana"
              width={40}
              height={40}
              className="rounded-lg shadow-sm border border-white/20"
              priority
            />
            <span className="font-bold text-xl tracking-tight text-white">
              Toko KOPANA
            </span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="transition-colors hover:text-white/70 text-white">Beranda</Link>
          <Link href="/#katalog" className="transition-colors hover:text-white/70 text-white">Katalog</Link>
          <Link href="/lacak" className="transition-colors hover:text-white/70 text-white">Cek Pesanan</Link>
          <Link href="/akun" className="transition-colors hover:text-white/70 text-white">Akun</Link>
          <Link href="/admin" className="transition-colors hover:text-white/70 font-bold text-white">Admin Panel</Link>
        </nav>

        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2 text-white hover:text-white/70 transition-colors hover-lift" title={`Tema: ${theme}`}>
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            ) : theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            )}
          </button>
          <Link href="/admin" className="md:hidden p-2 text-white hover:text-white/70 transition-colors hover-lift" title="Admin Panel">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </Link>
          <Link href="/akun" className="hidden md:flex relative p-2 text-white hover:text-white/70 transition-colors hover-lift" title="Notifikasi">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-2 h-3 w-3 bg-red-500 rounded-full border-2 border-primary"></span>
            )}
          </Link>
          <Link href="/keranjang" className="relative p-2 text-white hover:text-white/70 transition-colors hover-lift">
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
