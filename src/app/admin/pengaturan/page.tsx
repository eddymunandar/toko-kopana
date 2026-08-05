"use client";
import { useEffect, useState } from 'react';
import { getSettingBanner, saveSettingBanner } from "@/lib/api";

export default function AdminPengaturanPage() {
  const [imgUrl, setImgUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const res = await getSettingBanner();
      if (res) {
        setImgUrl(res);
      }
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
      const res = await saveSettingBanner(imgUrl);
      if (res.success) {
        alert("Pengaturan berhasil disimpan");
      } else {
        alert(res.message);
      }
    } catch (err) {
      alert("Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-foreground">Pengaturan Toko</h1>
          <p className="text-foreground/60 mt-1">Atur konfigurasi umum untuk toko Anda.</p>
        </div>
      </div>

      <div className="bg-white border border-border rounded-2xl p-6 mb-8 shadow-sm max-w-2xl">
        <h3 className="font-bold text-lg mb-4">Pengaturan Global</h3>
        
        {loading ? (
          <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1">Banner Popup Checkout (URL Gambar)</label>
              <input value={imgUrl} onChange={e => setImgUrl(e.target.value)} className="w-full px-4 py-2 border rounded-xl" placeholder="https://..." />
              <p className="text-xs text-gray-500 mt-1">Gambar ini akan muncul sebagai popup saat pelanggan selesai checkout.</p>
              
              {imgUrl && (
                <div className="mt-4 p-2 border rounded-xl bg-gray-50">
                  <p className="text-xs font-bold text-gray-500 mb-2">Pratinjau:</p>
                  <img src={imgUrl} alt="Preview" className="max-h-64 rounded mx-auto" />
                </div>
              )}
            </div>
            
            <button disabled={saving} type="submit" className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-primary-hover shadow-sm">
              {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
