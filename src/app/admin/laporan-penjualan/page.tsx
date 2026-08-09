"use client";
import { useEffect, useState } from 'react';
import { getSalesReport } from "@/lib/api";

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

export default function LaporanPenjualanPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
    setStartDate(firstDay);
    setEndDate(today);
  }, []);

  async function loadData() {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      const res = await getSalesReport(startDate, endDate);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (startDate && endDate) loadData();
  }, [startDate, endDate]);

  const fmt = (n: number) => `Rp ${Number(n || 0).toLocaleString('id-ID')}`;
  const revenue = Number(data?.total_revenue || 0);
  const cogs = Number(data?.total_cogs || 0);
  const expenses = Number(data?.total_expenses || 0);
  const grossProfit = revenue - cogs;
  const netProfit = data?.net_profit ?? (grossProfit - expenses);
  const isProfit = netProfit >= 0;

  function exportExcel() {
    if (!data) return;
    const header = "Omzet,HPP,Laba Kotor,Pengeluaran,Laba Bersih\n";
    const row = `${revenue},${cogs},${grossProfit},${expenses},${netProfit}\n`;
    
    let csv = header + row + "\n";
    csv += "Produk Terlaris\nNama Produk,Terjual,Pendapatan\n";
    if (data.top_products) {
      data.top_products.forEach((p: any) => {
        csv += `"${p.name}",${p.qty},${p.revenue}\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Penjualan_${startDate}_${endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function printPDF() {
    window.print();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8 print:hidden">
        <div>
          <h1 className="text-3xl font-black text-foreground">Laporan Penjualan &amp; Laba Rugi</h1>
          <p className="text-foreground/60 mt-1">Laporan lengkap omzet, HPP, dan laba bersih dalam periode tertentu.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={printPDF} disabled={!data || loading} className="bg-gray-800 text-white px-4 py-2 rounded-xl font-bold hover:bg-gray-700 shadow-sm disabled:opacity-50 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            Cetak PDF
          </button>
          <button onClick={exportExcel} disabled={!data || loading} className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-green-700 shadow-sm disabled:opacity-50 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Export Excel
          </button>
          <button onClick={loadData} disabled={loading} className="bg-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-primary-hover shadow-sm flex items-center gap-2 disabled:opacity-50">
            {loading ? 'Memuat...' : 'Muat Ulang'}
          </button>
        </div>
      </div>

      <div className="bg-white border border-border rounded-2xl p-6 mb-6 shadow-sm flex items-end gap-4 flex-wrap print:hidden">
        <div className="flex-1 min-w-[140px]">
          <label className="block text-sm font-medium mb-1">Mulai Tanggal</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-4 py-2 border rounded-xl" />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-sm font-medium mb-1">Sampai Tanggal</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-4 py-2 border rounded-xl" />
        </div>
        <button onClick={loadData} className="bg-gray-800 text-white px-6 py-2 rounded-xl font-bold">Filter</button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
      ) : data ? (
        <div className="space-y-8">
          <section>
            <h2 className="text-xs font-bold text-foreground/50 mb-3 uppercase tracking-widest">📦 Ringkasan Pesanan</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Pesanan" value={data.total_orders} icon="🛒" bg="bg-white" color="text-foreground" />
              <StatCard label="Pesanan Selesai" value={data.completed_orders} icon="✅" bg="bg-green-50" color="text-success" />
              <StatCard label="Pesanan Dibatalkan" value={data.canceled_orders || 0} icon="❌" bg="bg-red-50" color="text-danger" />
              <StatCard label="Pesanan Anggota" value={data.member_orders || 0} icon="👥" bg="bg-blue-50" color="text-blue-600" />
            </div>
          </section>

          <section>
            <h2 className="text-xs font-bold text-foreground/50 mb-3 uppercase tracking-widest">💰 Laporan Laba Rugi</h2>
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

          <section>
            <h2 className="text-xs font-bold text-foreground/50 mb-3 uppercase tracking-widest">🏆 Produk Terlaris</h2>
            <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-sm">#</th>
                    <th className="px-4 py-3 text-sm">Produk</th>
                    <th className="px-4 py-3 text-sm">Terjual</th>
                    <th className="px-4 py-3 text-sm">Pendapatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.top_products?.length > 0 ? data.top_products.map((p: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-bold text-gray-400">#{i + 1}</td>
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3">{p.qty} pcs</td>
                      <td className="px-4 py-3 font-bold text-primary">Rp {Number(p.revenue).toLocaleString('id-ID')}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Belum ada data</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {data.shopper_list && data.shopper_list.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-foreground/50 mb-3 uppercase tracking-widest">👤 Daftar Pembeli</h2>
              <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-sm">Nama</th>
                      <th className="px-4 py-3 text-sm">No. Anggota</th>
                      <th className="px-4 py-3 text-sm">No. HP</th>
                      <th className="px-4 py-3 text-sm text-center">Jml Pesanan</th>
                      <th className="px-4 py-3 text-sm">Total Belanja</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.shopper_list.map((s: any, i: number) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{s.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{s.member_no || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{s.whatsapp}</td>
                        <td className="px-4 py-3 text-center text-sm">{s.total_orders}</td>
                        <td className="px-4 py-3 font-bold text-primary">Rp {Number(s.total_spend).toLocaleString('id-ID')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-12">Tidak ada data untuk periode ini.</p>
      )}
    </div>
  );
}
