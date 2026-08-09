"use client";
import { useEffect, useState } from 'react';
import { getAllCustomers } from "@/lib/api";

export default function AdminPelangganPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('Semua');

  async function loadData() {
    setLoading(true);
    try {
      const res = await getAllCustomers();
      setData(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredData = data.filter(item => {
    if (filterRole === 'Semua') return true;
    if (filterRole === 'Member') return item.role?.toLowerCase() === 'member';
    if (filterRole === 'Umum') return item.role?.toLowerCase() === 'umum';
    return true;
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground">Pelanggan Terdaftar</h1>
          <p className="text-foreground/60 mt-1">Daftar semua akun pelanggan (Umum & Koperasi) yang mendaftar di website.</p>
        </div>
        <div className="flex gap-2 items-center">
          <select 
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value)}
            className="bg-white border text-foreground px-4 py-2 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="Semua">Semua Pelanggan</option>
            <option value="Umum">Hanya Umum</option>
            <option value="Member">Hanya Anggota</option>
          </select>
          <button onClick={loadData} className="bg-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-primary-hover shadow-sm">
            Muat Ulang
          </button>
        </div>
      </div>

      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-hover border-b border-border text-sm font-semibold text-foreground/70">
                <th className="px-6 py-4">ID Akun</th>
                <th className="px-6 py-4">Nama & Kontak</th>
                <th className="px-6 py-4">Status / Role</th>
                <th className="px-6 py-4 min-w-[200px]">Alamat Lengkap</th>
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
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-foreground/50">
                    Belum ada pelanggan terdaftar.
                  </td>
                </tr>
              ) : (
                filteredData.map((item: any, i: number) => {
                  const isMember = item.role?.toLowerCase() === 'member';
                  return (
                    <tr key={i} className="hover:bg-surface-hover/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-sm text-gray-500">{item.account_id}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-foreground">{item.name}</div>
                        <div className="text-sm font-mono text-primary flex items-center gap-1 mt-1">
                          <i className="fa-brands fa-whatsapp"></i> {item.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          isMember ? 'bg-success/15 text-success' : 'bg-gray-100 text-gray-600'
                        }`}>
                          <i className={`fa-solid ${isMember ? 'fa-user-check' : 'fa-user'}`}></i>
                          {isMember ? 'Anggota Koperasi' : 'Umum'}
                        </div>
                        {isMember && item.member_no && (
                          <div className="text-xs text-gray-500 font-mono mt-1 ml-1">{item.member_no}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-foreground/80 line-clamp-2" title={item.address}>{item.address || '-'}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {[item.village, item.district, item.city].filter(Boolean).join(', ') || 'Belum diisi'}
                        </div>
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
