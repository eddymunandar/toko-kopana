"use client";
import { useEffect, useState } from 'react';
import { getAllMembers, saveMember, deleteMember } from "@/lib/api";

export default function AdminAnggotaPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({ memberNo: '', name: '', address: '', whatsapp: '', branch: '', status: 'Aktif' });

  async function loadData() {
    setLoading(true);
    try {
      const res = await getAllMembers();
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        member_no: form.memberNo,
        name: form.name,
        address: form.address,
        whatsapp: form.whatsapp,
        branch: form.branch,
        status: form.status
      };
      const res = await saveMember(payload);
      if (res.success) {
        setShowForm(false);
        setForm({ memberNo: '', name: '', address: '', whatsapp: '', branch: '', status: 'Aktif' });
        loadData();
      } else {
        alert(res.message);
      }
    } catch (err) {
      alert("Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(memberNo: string) {
    if (!confirm(`Hapus anggota ${memberNo}?`)) return;
    try {
      const res = await deleteMember(memberNo);
      if (res.success) {
        loadData();
      } else {
        alert(res.message);
      }
    } catch (err) {
      alert("Gagal menghapus data");
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-foreground">Anggota Koperasi</h1>
          <p className="text-foreground/60 mt-1">Manajemen daftar anggota koperasi (Digunakan untuk verifikasi diskon member).</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowForm(!showForm)} className="bg-white border text-foreground px-4 py-2 rounded-xl font-bold hover:bg-gray-50 shadow-sm">
            {showForm ? 'Batal' : '+ Tambah Anggota'}
          </button>
          <button onClick={loadData} className="bg-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-primary-hover shadow-sm">
            Muat Ulang
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl border mb-8 shadow-sm">
          <h3 className="font-bold text-lg mb-4">Tambah / Edit Anggota</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nomor Anggota (ID)</label>
              <input required value={form.memberNo} onChange={e => setForm({...form, memberNo: e.target.value})} className="w-full px-4 py-2 border rounded-xl" placeholder="Contoh: KPM-001" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
              <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2 border rounded-xl" placeholder="Nama Lengkap" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">WhatsApp</label>
              <input value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} className="w-full px-4 py-2 border rounded-xl" placeholder="08..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cabang/Unit</label>
              <input value={form.branch} onChange={e => setForm({...form, branch: e.target.value})} className="w-full px-4 py-2 border rounded-xl" placeholder="Cabang..." />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Alamat Lengkap</label>
              <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full px-4 py-2 border rounded-xl" rows={2}></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-4 py-2 border rounded-xl bg-white">
                <option value="Aktif">Aktif</option>
                <option value="Non-Aktif">Non-Aktif</option>
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end mt-2">
              <button disabled={saving} type="submit" className="bg-gray-800 text-white px-6 py-2 rounded-xl font-bold">
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-hover border-b border-border text-sm font-semibold text-foreground/70">
                <th className="px-6 py-4">No Anggota</th>
                <th className="px-6 py-4">Nama</th>
                <th className="px-6 py-4">WhatsApp</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-foreground/50">
                    Belum ada data anggota.
                  </td>
                </tr>
              ) : (
                data.map((item: any, i: number) => (
                  <tr key={i} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-primary">{item.member_no}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.address}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">{item.whatsapp}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.status === 'Aktif' ? 'bg-success/10 text-success' : 'bg-gray-200 text-gray-600'}`}>
                        {item.status || 'Aktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => {
                        setForm({ memberNo: item.member_no, name: item.name, address: item.address, whatsapp: item.whatsapp, branch: item.branch, status: item.status || 'Aktif' });
                        setShowForm(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }} className="text-blue-500 hover:text-blue-700 text-sm font-bold mr-3">Edit</button>
                      <button onClick={() => handleDelete(item.member_no)} className="text-danger hover:text-red-700 text-sm font-bold">Hapus</button>
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
