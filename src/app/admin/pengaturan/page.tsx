"use client";
import { useEffect, useState } from 'react';
import { getStoreSettings, saveStoreSettings } from "@/lib/api";

export default function AdminPengaturanPage() {
  const [imgUrl, setImgUrl] = useState('');
  const [shippingFee, setShippingFee] = useState('5000');
  const [freeShippingMin, setFreeShippingMin] = useState('150000');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const settings = await getStoreSettings();
      if (settings) {
        if (settings.STORE_BANNER_IMAGE) setImgUrl(settings.STORE_BANNER_IMAGE);
        if (settings.SHIPPING_FEE) setShippingFee(settings.SHIPPING_FEE);
        if (settings.FREE_SHIPPING_MIN) setFreeShippingMin(settings.FREE_SHIPPING_MIN);
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
      const payload = {
        STORE_BANNER_IMAGE: imgUrl,
        SHIPPING_FEE: shippingFee,
        FREE_SHIPPING_MIN: freeShippingMin
      };
      const res = await saveStoreSettings(payload);
      if (res.success) {
        alert("Pengaturan berhasil disimpan");
      } else {
        alert(res.message || "Gagal menyimpan pengaturan");
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
            
            <div className="space-y-4">
              <h4 className="font-bold text-gray-700 border-b pb-2">Ongkos Kirim</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tarif Ongkir (Rp)</label>
                  <input type="number" required min="0" value={shippingFee} onChange={e => setShippingFee(e.target.value)} className="w-full px-4 py-2 border rounded-xl" placeholder="5000" />
                  <p className="text-xs text-gray-500 mt-1">Tarif tetap ongkir pengiriman kurir.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Minimal Belanja Gratis Ongkir (Rp)</label>
                  <input type="number" required min="0" value={freeShippingMin} onChange={e => setFreeShippingMin(e.target.value)} className="w-full px-4 py-2 border rounded-xl" placeholder="150000" />
                  <p className="text-xs text-gray-500 mt-1">Isi 0 jika tidak ada gratis ongkir.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-bold text-gray-700 border-b pb-2">Tampilan</h4>
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
            </div>
            
            <button disabled={saving} type="submit" className="bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-primary-hover shadow-sm w-full md:w-auto mt-4">
              {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
