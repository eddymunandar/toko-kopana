"use client";
import { useEffect, useState } from 'react';
import { getAllBannersAdmin, saveBanner, deleteBanner, toggleBannerStatus } from "@/lib/api";

export default function AdminBannerPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({ bannerId: '', title: '', imageUrl: '', link: '', isActive: true });

  async function loadData() {
    setLoading(true);
    try {
      const res = await getAllBannersAdmin();
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
        bannerId: form.bannerId || `BNR-${Date.now().toString().slice(-6)}`,
        title: form.title,
        image_url: form.imageUrl,
        link: form.link,
        is_active: form.isActive
      };
      
      const res = await saveBanner(payload);
      if (res.success) {
        setShowForm(false);
        setForm({ bannerId: '', title: '', imageUrl: '', link: '', isActive: true });
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

  async function handleDelete(bannerId: string) {
    if (!confirm(`Hapus banner ini?`)) return;
    try {
      const res = await deleteBanner(bannerId);
      if (res.success) {
        loadData();
      } else {
        alert(res.message);
      }
    } catch (err) {
      alert("Gagal menghapus data");
    }
  }

  async function handleToggle(bannerId: string) {
    try {
      const res = await toggleBannerStatus(bannerId);
      if (res.success) {
        loadData();
      }
    } catch (err) {
      alert("Gagal mengubah status");
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-foreground">Banner Beranda</h1>
          <p className="text-foreground/60 mt-1">Atur slider banner promo di halaman utama.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setForm({ bannerId: '', title: '', imageUrl: '', link: '', isActive: true }); setShowForm(!showForm); }} className="bg-white border text-foreground px-4 py-2 rounded-xl font-bold hover:bg-gray-50 shadow-sm">
            {showForm ? 'Batal' : '+ Tambah Banner'}
          </button>
          <button onClick={loadData} className="bg-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-primary-hover shadow-sm">
            Muat Ulang
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl border mb-8 shadow-sm">
          <h3 className="font-bold text-lg mb-4">{form.bannerId ? 'Edit Banner' : 'Tambah Banner'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Judul / Keterangan</label>
              <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-4 py-2 border rounded-xl" placeholder="Promo Lebaran" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">URL Gambar</label>
              <input required value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} className="w-full px-4 py-2 border rounded-xl" placeholder="https://..." />
              {form.imageUrl && <div className="mt-2 h-32 rounded-xl border bg-gray-100 bg-cover bg-center" style={{ backgroundImage: `url(${form.imageUrl})` }}></div>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Link Tujuan <span className="text-gray-400 font-normal">(Opsional)</span></label>
              <input value={form.link} onChange={e => setForm({...form, link: e.target.value})} className="w-full px-4 py-2 border rounded-xl" placeholder="/kategori/sembako" />
            </div>
            <div className="flex justify-end pt-2">
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
                <th className="px-6 py-4">Gambar</th>
                <th className="px-6 py-4">Informasi</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
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
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-foreground/50">
                    Belum ada banner.
                  </td>
                </tr>
              ) : (
                data.map((item: any, i: number) => (
                  <tr key={item.banner_id || i} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-32 h-16 rounded overflow-hidden bg-gray-100">
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold">{item.title}</div>
                      <div className="text-xs text-blue-500 truncate max-w-[200px]">{item.link}</div>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleToggle(item.banner_id)} className={`px-3 py-1 rounded-full text-xs font-bold ${item.is_active ? 'bg-success/10 text-success' : 'bg-gray-200 text-gray-500'}`}>
                        {item.is_active ? 'Aktif' : 'Non-Aktif'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => {
                        setForm({ bannerId: item.banner_id, title: item.title, imageUrl: item.image_url, link: item.link || '', isActive: item.is_active });
                        setShowForm(true);
                      }} className="text-blue-500 hover:text-blue-700 text-sm font-bold mr-3">Edit</button>
                      <button onClick={() => handleDelete(item.banner_id)} className="text-danger hover:text-red-700 text-sm font-bold">Hapus</button>
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
