"use client";
import { useEffect, useState } from 'react';
import { getPromosAdmin, savePromo, deletePromo, togglePromoStatus } from "@/lib/api";

export default function AdminPromoPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({ promoId: '', code: '', discountType: 'Nominal', discountValue: '', minPurchase: '0', maxDiscount: '0', isActive: true });

  async function loadData() {
    setLoading(true);
    try {
      const res = await getPromosAdmin();
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
        promoId: form.promoId || `PRM-${Date.now().toString().slice(-6)}`,
        code: form.code,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minPurchase: Number(form.minPurchase),
        maxDiscount: Number(form.maxDiscount),
        isActive: form.isActive
      };
      
      const res = await savePromo(payload);
      if (res.success) {
        setShowForm(false);
        setForm({ promoId: '', code: '', discountType: 'Nominal', discountValue: '', minPurchase: '0', maxDiscount: '0', isActive: true });
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

  async function handleDelete(promoId: string) {
    if (!confirm(`Hapus promo ini?`)) return;
    try {
      const res = await deletePromo(promoId);
      if (res.success) {
        loadData();
      } else {
        alert(res.message);
      }
    } catch (err) {
      alert("Gagal menghapus data");
    }
  }

  async function handleToggle(promoId: string) {
    try {
      const res = await togglePromoStatus(promoId);
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
          <h1 className="text-3xl font-black text-foreground">Promo & Voucher</h1>
          <p className="text-foreground/60 mt-1">Kelola kode diskon untuk pelanggan.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setForm({ promoId: '', code: '', discountType: 'Nominal', discountValue: '', minPurchase: '0', maxDiscount: '0', isActive: true }); setShowForm(!showForm); }} className="bg-white border text-foreground px-4 py-2 rounded-xl font-bold hover:bg-gray-50 shadow-sm">
            {showForm ? 'Batal' : '+ Tambah Promo'}
          </button>
          <button onClick={loadData} className="bg-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-primary-hover shadow-sm">
            Muat Ulang
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl border mb-8 shadow-sm">
          <h3 className="font-bold text-lg mb-4">{form.promoId ? 'Edit Promo' : 'Tambah Promo'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Kode Promo</label>
              <input required value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} className="w-full px-4 py-2 border rounded-xl uppercase" placeholder="KOPANA10" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipe Diskon</label>
              <select value={form.discountType} onChange={e => setForm({...form, discountType: e.target.value})} className="w-full px-4 py-2 border rounded-xl bg-white">
                <option value="Nominal">Nominal (Rp)</option>
                <option value="Persen">Persentase (%)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Besar Diskon</label>
              <input required type="number" value={form.discountValue} onChange={e => setForm({...form, discountValue: e.target.value})} className="w-full px-4 py-2 border rounded-xl" placeholder="5000 / 10" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Minimal Belanja (Rp)</label>
              <input required type="number" value={form.minPurchase} onChange={e => setForm({...form, minPurchase: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
            </div>
            {form.discountType === 'Persen' && (
              <div>
                <label className="block text-sm font-medium mb-1">Maksimal Diskon (Rp)</label>
                <input required type="number" value={form.maxDiscount} onChange={e => setForm({...form, maxDiscount: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
              </div>
            )}
            <div className="md:col-span-2 flex justify-end pt-2">
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
                <th className="px-6 py-4">Kode Promo</th>
                <th className="px-6 py-4">Diskon</th>
                <th className="px-6 py-4">Syarat</th>
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
                    Belum ada promo.
                  </td>
                </tr>
              ) : (
                data.map((item: any, i: number) => (
                  <tr key={item.promo_id || i} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-primary px-3 py-1 bg-primary/10 rounded-lg border border-primary/20">{item.code}</span>
                    </td>
                    <td className="px-6 py-4 font-bold">
                      {item.discount_type === 'Persen' ? `${item.discount_value}%` : `Rp ${Number(item.discount_value).toLocaleString('id-ID')}`}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      Min. Rp {Number(item.min_purchase).toLocaleString('id-ID')}
                      {item.discount_type === 'Persen' && item.max_discount > 0 && <span className="block text-gray-500 text-xs">Maks. Rp {Number(item.max_discount).toLocaleString('id-ID')}</span>}
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleToggle(item.promo_id)} className={`px-3 py-1 rounded-full text-xs font-bold ${item.is_active ? 'bg-success/10 text-success' : 'bg-gray-200 text-gray-500'}`}>
                        {item.is_active ? 'Aktif' : 'Non-Aktif'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => {
                        setForm({ promoId: item.promo_id, code: item.code, discountType: item.discount_type, discountValue: item.discount_value, minPurchase: item.min_purchase, maxDiscount: item.max_discount || '0', isActive: item.is_active });
                        setShowForm(true);
                      }} className="text-blue-500 hover:text-blue-700 text-sm font-bold mr-3">Edit</button>
                      <button onClick={() => handleDelete(item.promo_id)} className="text-danger hover:text-red-700 text-sm font-bold">Hapus</button>
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
