"use client";
import { useEffect, useState } from 'react';
import { getMemberYearlyReport } from "@/lib/api";

export default function LaporanBelanjaPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear().toString());

  async function loadData() {
    setLoading(true);
    try {
      const res = await getMemberYearlyReport(year);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [year]);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-foreground">Laporan Belanja Anggota</h1>
          <p className="text-foreground/60 mt-1">Laporan tahunan untuk Sisa Hasil Usaha (RAT).</p>
        </div>
        <button onClick={loadData} className="bg-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-primary-hover shadow-sm flex items-center gap-2">
          {loading ? 'Memuat...' : 'Muat Ulang'}
        </button>
      </div>

      <div className="bg-white border border-border rounded-2xl p-6 mb-8 shadow-sm flex items-end gap-4 max-w-sm">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Tahun Laporan</label>
          <select value={year} onChange={e => setYear(e.target.value)} className="w-full px-4 py-2 border rounded-xl bg-white">
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>
        </div>
        <button onClick={loadData} className="bg-gray-800 text-white px-6 py-2 rounded-xl font-bold">Cari</button>
      </div>

      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-hover border-b border-border text-sm font-semibold text-foreground/70">
                <th className="px-6 py-4">Peringkat</th>
                <th className="px-6 py-4">Nomor Anggota</th>
                <th className="px-6 py-4">Nama</th>
                <th className="px-6 py-4 text-right">Total Belanja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </td>
                </tr>
              ) : !data || data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-foreground/50">
                    Belum ada data belanja untuk tahun {year}.
                  </td>
                </tr>
              ) : (
                data.map((item: any, index: number) => (
                  <tr key={item.member_no} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-gray-500">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 font-mono text-sm">
                      {item.member_no}
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      {item.member_name}
                    </td>
                    <td className="px-6 py-4 font-bold text-primary text-right">
                      Rp {Number(item.total_spent).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
