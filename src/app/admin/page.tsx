"use client";
import { useEffect, useState } from 'react';
import { getDashboardData, getSalesReport, getAllProductsAdmin } from "@/lib/api";

function StatCard({ label, value, sub, color, bg, icon }: any) {
  return (
    <div className={`${bg} p-5 rounded-2xl border border-border shadow-sm`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-foreground/60">{label}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className={`text-xl font-black ${color}`}>{value}</p>
      {sub && <p className="text-xs text-foreground/50 mt-1">{sub}</p>}
    </div>
  );
}

// Simple bar chart component
function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-36">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 h-full">
          <span className="text-[10px] text-gray-500 font-medium h-4 flex items-end">
            {d.value > 0 ? (d.value >= 1000000 ? `${(d.value/1000000).toFixed(1)}jt` : `${(d.value/1000).toFixed(0)}k`) : ''}
          </span>
          <div
            className="w-full rounded-t-lg bg-primary transition-all duration-500"
            style={{ height: `${Math.max((d.value / max) * 100, d.value > 0 ? 4 : 0)}%` }}
            title={`Rp ${d.value.toLocaleString('id-ID')}`}
          />
          <span className="text-[10px] text-gray-400 font-medium mt-1">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

export default function AdminOverviewPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [salesData, setSalesData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<{ label: string; value: number }[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const LOW_STOCK_THRESHOLD = 5;

  async function loadData() {
    setLoading(true);
    try {
      const now = new Date();
      const currentMonthStart = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`;
      const endOfMonthD = new Date(now.getFullYear(), now.getMonth()+1, 0);
      const currentMonthEnd = `${endOfMonthD.getFullYear()}-${String(endOfMonthD.getMonth()+1).padStart(2,'0')}-${String(endOfMonthD.getDate()).padStart(2,'0')}`;

      const [dashData, products, currentSales] = await Promise.all([
        getDashboardData(),
        getAllProductsAdmin(),
        getSalesReport(currentMonthStart, currentMonthEnd),
      ]);
      setDashboard(dashData);
      setSalesData(currentSales);

      // Build 6-month sales chart using getSalesReport
      const months: { label: string; value: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const start = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`;
        const endD = new Date(d.getFullYear(), d.getMonth()+1, 0);
        const end = `${endD.getFullYear()}-${String(endD.getMonth()+1).padStart(2,'0')}-${String(endD.getDate()).padStart(2,'0')}`;
        try {
          // Optimization: If it's the current month, just use currentSales
          if (i === 0) {
            months.push({ label: MONTHS[d.getMonth()], value: Number(currentSales?.total_revenue || 0) });
          } else {
            const rep = await getSalesReport(start, end);
            months.push({ label: MONTHS[d.getMonth()], value: Number(rep?.total_revenue || 0) });
          }
        } catch {
          months.push({ label: MONTHS[d.getMonth()], value: 0 });
        }
      }
      setChartData(months);

      // Low stock products
      const low = (products || []).filter((p: any) => {
        const threshold = p.min_stock !== undefined ? Number(p.min_stock) : LOW_STOCK_THRESHOLD;
        return Number(p.stock) <= threshold && Number(p.stock) >= 0;
      });
      setLowStockProducts(low);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const fmt = (n: number) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`;
  const revenue = Number(salesData?.total_revenue || 0);
  const cogs = Number(salesData?.total_cogs || 0);
  const expenses = Number(salesData?.total_expenses || 0);
  const grossProfit = revenue - cogs;
  const netProfit = salesData?.net_profit ?? (grossProfit - expenses);
  const isProfit = netProfit >= 0;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground">Ringkasan</h1>
          <p className="text-foreground/60 mt-1 text-sm">Pantau kinerja toko secara real-time.</p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="bg-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-primary-hover shadow-sm flex items-center gap-2 text-sm disabled:opacity-70"
        >
          {loading ? (
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          )}
          Muat Ulang
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
      ) : (
        <>
          {/* Laporan Laba Rugi */}
          <section className="mb-6">
            <h2 className="text-xs font-bold text-foreground/50 mb-3 uppercase tracking-widest flex items-center gap-2"><i className="fa-solid fa-sack-dollar text-primary"></i> Laporan Laba Rugi Bulan Ini</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard label="Omzet (Pendapatan Kotor)" value={fmt(revenue)} sub="Total penjualan pesanan selesai" icon="💵" bg="bg-blue-50" color="text-primary" />
              <StatCard label="Total HPP (Modal)" value={fmt(cogs)} sub="Harga pokok produk yang terjual" icon="📦" bg="bg-orange-50" color="text-orange-600" />
              <StatCard label="Laba Kotor" value={fmt(grossProfit)} sub="Omzet dikurangi HPP" icon="📊" bg={grossProfit >= 0 ? "bg-green-50" : "bg-red-50"} color={grossProfit >= 0 ? "text-success" : "text-danger"} />
              <StatCard label="Total Pengeluaran" value={fmt(expenses)} sub="Biaya operasional dan ongkos kirim" icon="💸" bg="bg-red-50" color="text-danger" />
              <StatCard label="Margin Keuntungan" value={revenue > 0 ? `${((grossProfit / revenue) * 100).toFixed(1)}%` : '0%'} sub="Laba kotor dibagi Omzet" icon="📈" bg="bg-purple-50" color="text-purple-600" />
              <div className={`${isProfit ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'} p-5 rounded-2xl border-2 shadow-sm`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-foreground/70">LABA BERSIH</p>
                  <span className="text-2xl">{isProfit ? '🤑' : '😟'}</span>
                </div>
                <p className={`text-2xl font-black ${isProfit ? 'text-green-700' : 'text-red-700'}`}>{fmt(netProfit)}</p>
                <p className="text-xs text-foreground/50 mt-1">Laba Kotor - Total Pengeluaran</p>
              </div>
            </div>
          </section>

          {/* Ringkasan Pesanan */}
          <section className="mb-6">
            <h2 className="text-xs font-bold text-foreground/50 mb-3 uppercase tracking-widest flex items-center gap-2"><i className="fa-solid fa-box text-primary"></i> Ringkasan Pesanan Bulan Ini</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Pesanan" value={salesData?.total_orders || 0} icon="🛒" bg="bg-white" color="text-foreground" />
              <StatCard label="Pesanan Selesai" value={salesData?.completed_orders || 0} icon="✅" bg="bg-green-50" color="text-success" />
              <StatCard label="Pesanan Dibatalkan" value={salesData?.canceled_orders || 0} icon="❌" bg="bg-red-50" color="text-danger" />
              <StatCard label="Pesanan Anggota" value={salesData?.member_orders || 0} icon="👥" bg="bg-blue-50" color="text-blue-600" />
            </div>
          </section>
        </>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
          <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
            📊 Grafik Penjualan 6 Bulan Terakhir
          </h2>
          {loading ? (
            <div className="h-36 bg-gray-100 animate-pulse rounded-xl" />
          ) : chartData.length > 0 ? (
            <BarChart data={chartData} />
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">Belum ada data penjualan</p>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
          <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
            ⚠️ Stok Menipis
            {lowStockProducts.length > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {lowStockProducts.length}
              </span>
            )}
          </h2>
          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-100 animate-pulse rounded-xl"/>)}
            </div>
          ) : lowStockProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <span className="text-3xl mb-2">✅</span>
              <p className="text-sm text-gray-500">Semua stok aman!</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {lowStockProducts.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                  <span className="text-sm font-semibold text-gray-700 truncate max-w-[70%]">{p.name}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${Number(p.stock) === 0 ? 'bg-red-500 text-white' : 'bg-orange-100 text-orange-700'}`}>
                    Sisa {p.stock}
                  </span>
                </div>
              ))}
            </div>
          )}
          {lowStockProducts.length > 0 && (
            <p className="text-xs text-gray-400 mt-2">* Produk dengan stok di bawah atau sama dengan batas minimum</p>
          )}
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5">
        <h2 className="text-lg font-bold text-primary mb-1">🏪 Selamat Datang di Admin KOPANA!</h2>
        <p className="text-foreground/80 text-sm">Gunakan navigasi di sebelah kiri untuk mengelola pesanan, produk, anggota, dan laporan keuangan.</p>
      </div>
    </div>
  );
}
