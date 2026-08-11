"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import MobileNav from "./MobileNav";
import { isAdminLoggedIn, logoutAdmin } from "@/lib/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Skip auth check for login page itself
    if (pathname === '/admin/login') {
      setChecked(true);
      return;
    }
    if (!isAdminLoggedIn()) {
      router.replace('/admin/login');
    } else {
      setChecked(true);
    }
  }, [pathname]);

  function handleLogout() {
    logoutAdmin();
    router.replace('/admin/login');
  }

  // Show nothing while checking auth (prevents flash)
  if (!checked) return null;

  // Don't wrap login page in admin layout
  if (pathname === '/admin/login') return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-surface-hover">
      {/* Sidebar */}
      <aside className="w-64 bg-foreground text-background flex flex-col hidden md:flex">
        <div className="p-6">
          <Link href="/admin" className="font-black text-2xl tracking-tight text-white">
            Admin<span className="text-primary-hover">KOPANA</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto pb-4">
          <Link href="/admin" className="block px-4 py-2 hover:bg-white/10 rounded-xl font-medium text-white transition-colors">
            <i className="fa-solid fa-chart-pie w-6"></i> Ringkasan
          </Link>
          <Link href="/admin/pesanan" className="block px-4 py-2 hover:bg-white/10 rounded-xl font-medium text-white/70 transition-colors">
            <i className="fa-solid fa-box w-6"></i> Pesanan
          </Link>
          <Link href="/admin/pengiriman" className="block px-4 py-2 hover:bg-white/10 rounded-xl font-medium text-white/70 transition-colors">
            <i className="fa-solid fa-truck-fast w-6"></i> Pengiriman
          </Link>
          <Link href="/admin/kategori" className="block px-4 py-2 hover:bg-white/10 rounded-xl font-medium text-white/70 transition-colors">
            <i className="fa-solid fa-tags w-6"></i> Kategori
          </Link>
          <Link href="/admin/produk" className="block px-4 py-2 hover:bg-white/10 rounded-xl font-medium text-white/70 transition-colors">
            <i className="fa-solid fa-cube w-6"></i> Produk
          </Link>
          <Link href="/admin/anggota" className="block px-4 py-2 hover:bg-white/10 rounded-xl font-medium text-white/70 transition-colors">
            <i className="fa-solid fa-users w-6"></i> Data Anggota
          </Link>
          <Link href="/admin/pelanggan" className="block px-4 py-2 hover:bg-white/10 rounded-xl font-medium text-white/70 transition-colors">
            <i className="fa-solid fa-address-book w-6"></i> Pelanggan Web
          </Link>
          <div className="pt-4 pb-2 px-4 text-xs font-bold text-white/40 uppercase tracking-wider">Keuangan</div>
          <Link href="/admin/laporan-penjualan" className="block px-4 py-2 hover:bg-white/10 rounded-xl font-medium text-white/70 transition-colors">
            <i className="fa-solid fa-chart-bar w-6"></i> Lap. Penjualan
          </Link>
          <Link href="/admin/pengeluaran" className="block px-4 py-2 hover:bg-white/10 rounded-xl font-medium text-white/70 transition-colors">
            <i className="fa-solid fa-wallet w-6"></i> Pengeluaran
          </Link>
          <Link href="/admin/laporan-belanja" className="block px-4 py-2 hover:bg-white/10 rounded-xl font-medium text-white/70 transition-colors">
            <i className="fa-solid fa-gift w-6"></i> Lap. Belanja Anggota
          </Link>
          <div className="pt-4 pb-2 px-4 text-xs font-bold text-white/40 uppercase tracking-wider">Tampilan</div>
          <Link href="/admin/pengaturan" className="block px-4 py-2 hover:bg-white/10 rounded-xl font-medium text-white/70 transition-colors">
            <i className="fa-solid fa-cog w-6"></i> Pengaturan
          </Link>
          <Link href="/admin/banner" className="block px-4 py-2 hover:bg-white/10 rounded-xl font-medium text-white/70 transition-colors">
            <i className="fa-solid fa-images w-6"></i> Banner
          </Link>
          <Link href="/admin/promo" className="block px-4 py-2 hover:bg-white/10 rounded-xl font-medium text-white/70 transition-colors">
            <i className="fa-solid fa-ticket w-6"></i> Promo
          </Link>
        </nav>
        
        <div className="p-4 mt-auto space-y-2 border-t border-white/10">
          <Link href="/" className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors px-2 py-1.5 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Kembali ke Toko
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Keluar (Logout)
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-foreground text-white flex items-center px-4 justify-between">
          <span className="font-black text-xl">Admin<span className="text-primary-hover">KOPANA</span></span>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-white/50 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </Link>
            <button onClick={handleLogout} className="text-red-400 hover:text-red-300 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          </div>
        </header>
        <MobileNav />
        
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
