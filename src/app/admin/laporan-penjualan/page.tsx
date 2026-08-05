"use client";
import { useEffect, useState } from 'react';
import { getSalesReport } from "@/lib/api";

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
    if (startDate && endDate) {
      loadData();
    }
  }, [startDate, endDate]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-foreground">Laporan Penjualan</h1>
          <p className="text-foreground/60 mt-1">Laporan omzet penjualan dalam periode tertentu.</p>
        </div>
        <button onClick={loadData} className="bg-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-primary-hover shadow-sm flex items-center gap-2">
          {loading ? 'Memuat...' : 'Muat Ulang'}
        </button>
      </div>
      
      <div className="bg-white border border-border rounded-2xl p-6 mb-8 shadow-sm flex items-end gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Mulai Tanggal</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-4 py-2 border rounded-xl" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Sampai Tanggal</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-4 py-2 border rounded-xl" />
        </div>
        <button onClick={loadData} className="bg-gray-800 text-white px-6 py-2 rounded-xl font-bold">Filter</button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
      ) : data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 border rounded-xl">
              <p className="text-xs text-gray-500">Total Pesanan</p>
              <p className="text-2xl font-black">{data.total_orders}</p>
            </div>
            <div className="bg-white p-4 border rounded-xl">
              <p className="text-xs text-gray-500">Pesanan Selesai</p>
              <p className="text-2xl font-black text-success">{data.completed_orders}</p>
            </div>
            <div className="bg-white p-4 border rounded-xl">
              <p className="text-xs text-gray-500">Omzet</p>
              <p className="text-2xl font-black text-primary">Rp {Number(data.total_revenue).toLocaleString('id-ID')}</p>
            </div>
          </div>
          
          <h3 className="font-bold text-lg">Produk Terlaris</h3>
          <div className="bg-white border rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-sm">Produk</th>
                  <th className="px-4 py-3 text-sm">Terjual</th>
                  <th className="px-4 py-3 text-sm">Pendapatan</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.top_products?.map((p: any, i: number) => (
                  <tr key={i}>
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3">{p.qty}</td>
                    <td className="px-4 py-3 font-bold text-primary">Rp {Number(p.revenue).toLocaleString('id-ID')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-12">Tidak ada data untuk periode ini.</p>
      )}
    </div>
  );
}
