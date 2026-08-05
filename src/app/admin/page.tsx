"use client";
import { useEffect, useState } from 'react';
import { getDashboardData } from "@/lib/api";

export default function AdminOverviewPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const data = await getDashboardData();
      setDashboard(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-foreground">Ringkasan</h1>
          <p className="text-foreground/60 mt-1">Pantau kinerja toko Anda hari ini.</p>
        </div>
        <button onClick={loadData} className="bg-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-primary-hover shadow-sm flex items-center gap-2">
          {loading ? 'Memuat...' : 'Muat Ulang'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
          <p className="text-sm font-medium text-foreground/60 mb-1">Total Pendapatan</p>
          <p className="text-3xl font-black text-primary">
            Rp {Number(dashboard?.total_revenue || 0).toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-foreground/50 mt-2">Dari {dashboard?.total_orders || 0} pesanan</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
          <p className="text-sm font-medium text-foreground/60 mb-1">Laba Bersih</p>
          <p className="text-3xl font-black text-success">
            Rp {Number(dashboard?.net_profit || 0).toLocaleString('id-ID')}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
          <p className="text-sm font-medium text-foreground/60 mb-1">Total Pengeluaran</p>
          <p className="text-3xl font-black text-danger">
            Rp {Number(dashboard?.total_expenses || 0).toLocaleString('id-ID')}
          </p>
        </div>
      </div>
      
      <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-primary mb-2">Selamat Datang di Admin Panel!</h2>
        <p className="text-foreground/80">Silakan gunakan navigasi di sebelah kiri untuk mengelola pesanan, katalog produk, anggota koperasi, dan melihat laporan keuangan toko.</p>
      </div>
    </div>
  );
}
