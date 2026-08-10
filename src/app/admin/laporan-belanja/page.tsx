"use client";
import { useEffect, useState } from 'react';
import { getMemberYearlyReport } from "@/lib/api";

const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

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

  useEffect(() => { loadData(); }, [year]);

  // Build monthly totals per member if data has monthly_breakdown
  function getMonthly(item: any, monthIdx: number): number | null {
    if (item.months && typeof item.months === 'object') {
      const mName = MONTHS[monthIdx];
      return item.months[mName] || null;
    }
    // Fallbacks for older data formats if needed
    if (item.monthly && Array.isArray(item.monthly)) return item.monthly[monthIdx] || null;
    if (item.monthly_breakdown && Array.isArray(item.monthly_breakdown)) return item.monthly_breakdown[monthIdx] || null;
    return null;
  }

  function exportExcel() {
    if (!data || data.length === 0) return;
    let csv = 'No,No Anggota,Nama,' + MONTHS.join(',') + ',Total Belanja\n';
    data.forEach((item: any, i: number) => {
      const months = MONTHS.map((_, mi) => {
        const v = getMonthly(item, mi);
        return v ? v : '-';
      }).join(',');
      const total = Number(item.total_spend || item.total_spent || 0);
      const memberNo = String(item.member_no || '').replace(/^CAT-MS/i, '').replace(/^MS/i, '');
      csv += `${i+1},${memberNo},${item.name || item.member_name || ''},${months},${total}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-belanja-${year}.csv`;
    a.click();
  }

  return (
    <div>
      {/* Blue Header Bar */}
      <div className="bg-primary text-white px-6 py-5 rounded-2xl mb-6 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎁</span>
          <div>
            <h1 className="text-xl font-black">Laporan Belanja Anggota</h1>
            <p className="text-white/70 text-sm">Laporan tahunan untuk Sisa Hasil Usaha (RAT)</p>
          </div>
        </div>
        <span className="bg-white/20 text-white text-sm font-bold px-3 py-1 rounded-full">{year}</span>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-end gap-3 mb-6">
        <div>
          <label className="block text-xs font-semibold text-foreground/60 mb-1">Tahun</label>
          <input
            type="number"
            value={year}
            onChange={e => setYear(e.target.value)}
            className="border border-border rounded-xl px-4 py-2 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="bg-primary text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-hover transition-colors shadow-sm"
        >
          {loading ? (
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          )}
          Tampilkan
        </button>
        <button
          onClick={exportExcel}
          className="ml-auto border-2 border-green-600 text-green-600 bg-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-green-600 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          Export Excel
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-surface border-b border-border">
                <th className="px-4 py-3 text-left font-semibold text-foreground/70" rowSpan={2}>No</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground/70" rowSpan={2}>No Anggota</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground/70" rowSpan={2}>Nama</th>
                <th className="px-2 py-3 text-center font-semibold text-foreground/70" colSpan={12}>Bulan</th>
                <th className="px-4 py-3 text-right font-semibold text-foreground/70" rowSpan={2}>Total Bel.</th>
              </tr>
              <tr className="bg-surface border-b border-border">
                {MONTHS.map(m => (
                  <th key={m} className="px-1 py-2 text-center text-xs font-semibold text-foreground/60">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={16} className="py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"/>
                    </div>
                  </td>
                </tr>
              ) : !data || data.length === 0 ? (
                <tr>
                  <td colSpan={16} className="py-12 text-center text-foreground/50">
                    Belum ada data belanja untuk tahun {year}.
                  </td>
                </tr>
              ) : (
                data.map((item: any, index: number) => {
                  // Remove "CAT-MS" or "MS" prefix from member number
                  const memberNo = String(item.member_no || '').replace(/^CAT-MS/i, '').replace(/^MS/i, '');
                  const total = Number(item.total_spend || item.total_spent || 0);
                  return (
                    <tr key={item.member_no} className="hover:bg-blue-50/40 transition-colors">
                      <td className="px-4 py-3 text-foreground/60 font-medium">{index + 1}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-xs font-bold">
                          {memberNo}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {item.name || item.member_name || ''}
                      </td>
                      {MONTHS.map((_, mi) => {
                        const val = getMonthly(item, mi);
                        return (
                          <td key={mi} className="px-1 py-3 text-center text-xs text-foreground/60">
                            {val ? `Rp${(val/1000).toFixed(0)}k` : '-'}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-right font-bold text-primary">
                        Rp {total.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
