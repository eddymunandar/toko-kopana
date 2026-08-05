"use client";
import { useEffect, useState } from 'react';
import { getCategories, saveCategoryAdmin, deleteCategoryAdmin } from "@/lib/api";

export default function AdminKategoriPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({ categoryId: '', name: '', description: '' });

  async function loadData() {
    setLoading(true);
    try {
      const res = await getCategories();
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
        categoryId: form.categoryId || `CAT-${Date.now().toString().slice(-6)}`,
        name: form.name,
        description: form.description
      };
      
      const res = await saveCategoryAdmin(payload);
      if (res.success) {
        setShowForm(false);
        setForm({ categoryId: '', name: '', description: '' });
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

  async function handleDelete(categoryId: string) {
    if (!confirm(`Hapus kategori ini?`)) return;
    try {
      const res = await deleteCategoryAdmin(categoryId);
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
          <h1 className="text-3xl font-black text-foreground">Kategori Produk</h1>
          <p className="text-foreground/60 mt-1">Kelompokkan produk Anda dalam kategori.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setForm({ categoryId: '', name: '', description: '' }); setShowForm(!showForm); }} className="bg-white border text-foreground px-4 py-2 rounded-xl font-bold hover:bg-gray-50 shadow-sm">
            {showForm ? 'Batal' : '+ Tambah Kategori'}
          </button>
          <button onClick={loadData} className="bg-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-primary-hover shadow-sm">
            Muat Ulang
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl border mb-8 shadow-sm">
          <h3 className="font-bold text-lg mb-4">{form.categoryId ? 'Edit Kategori' : 'Tambah Kategori'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nama Kategori</label>
              <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2 border rounded-xl" placeholder="Contoh: Sembako" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Deskripsi <span className="text-gray-400 font-normal">(Opsional)</span></label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-4 py-2 border rounded-xl" rows={2}></textarea>
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
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Deskripsi</th>
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
                    Belum ada data kategori.
                  </td>
                </tr>
              ) : (
                data.map((item: any, i: number) => (
                  <tr key={item.category_id || i} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{item.category_id}</td>
                    <td className="px-6 py-4 font-bold">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.description}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => {
                        setForm({ categoryId: item.category_id, name: item.name, description: item.description || '' });
                        setShowForm(true);
                      }} className="text-blue-500 hover:text-blue-700 text-sm font-bold mr-3">Edit</button>
                      <button onClick={() => handleDelete(item.category_id)} className="text-danger hover:text-red-700 text-sm font-bold">Hapus</button>
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
