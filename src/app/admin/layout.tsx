import Link from "next/link";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          <Link href="/admin/kategori" className="block px-4 py-2 hover:bg-white/10 rounded-xl font-medium text-white/70 transition-colors">
            <i className="fa-solid fa-tags w-6"></i> Kategori
          </Link>
          <Link href="/admin/produk" className="block px-4 py-2 hover:bg-white/10 rounded-xl font-medium text-white/70 transition-colors">
            <i className="fa-solid fa-cube w-6"></i> Produk
          </Link>
          <Link href="/admin/anggota" className="block px-4 py-2 hover:bg-white/10 rounded-xl font-medium text-white/70 transition-colors">
            <i className="fa-solid fa-users w-6"></i> Anggota
          </Link>
          <div className="pt-4 pb-2 px-4 text-xs font-bold text-white/40 uppercase tracking-wider">Keuangan</div>
          <Link href="/admin/laporan-penjualan" className="block px-4 py-2 hover:bg-white/10 rounded-xl font-medium text-white/70 transition-colors">
            <i className="fa-solid fa-chart-bar w-6"></i> Lap. Penjualan
          </Link>
          <Link href="/admin/pengeluaran" className="block px-4 py-2 hover:bg-white/10 rounded-xl font-medium text-white/70 transition-colors">
            <i className="fa-solid fa-wallet w-6"></i> Pengeluaran
          </Link>
          <Link href="/admin/laporan-belanja" className="block px-4 py-2 hover:bg-white/10 rounded-xl font-medium text-white/70 transition-colors">
            <i className="fa-solid fa-gift w-6"></i> Lap. Belanja (RAT)
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
        
        <div className="p-4 mt-auto">
          <Link href="/" className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Kembali ke Toko
          </Link>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-foreground text-white flex items-center px-4">
          <span className="font-black text-xl">Admin<span className="text-primary-hover">KOPANA</span></span>
        </header>
        
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
