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
            Admin<span className="text-primary-hover">KOPAMA</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link href="/admin" className="block px-4 py-3 bg-white/10 rounded-xl font-medium text-white transition-colors">
            Pesanan
          </Link>
          <Link href="/admin/produk" className="block px-4 py-3 hover:bg-white/5 rounded-xl font-medium text-white/70 transition-colors">
            Katalog Produk
          </Link>
          <Link href="/admin/laporan" className="block px-4 py-3 hover:bg-white/5 rounded-xl font-medium text-white/70 transition-colors">
            Laporan Keuangan
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
          <span className="font-black text-xl">Admin<span className="text-primary-hover">KOPAMA</span></span>
        </header>
        
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
