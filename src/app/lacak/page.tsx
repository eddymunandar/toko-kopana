"use client";
import { useState } from 'react';
import { trackOrder, submitPaymentProof } from '@/lib/api';
import Link from 'next/link';

export default function LacakPage() {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');
  
  // Payment Proof
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;
    
    setLoading(true);
    setError('');
    setOrder(null);
    setUploadSuccess(false);
    
    try {
      const res = await trackOrder(orderId);
      if (res.success && res.data) {
        setOrder(res.data);
      } else {
        setError(res.message || 'Pesanan tidak ditemukan');
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !order) return;
    
    if (file.size > 2 * 1024 * 1024) {
      alert("Maksimal ukuran file 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      
      setUploading(true);
      try {
        const res = await submitPaymentProof(order.order_id, base64String);
        if (res.success) {
          setUploadSuccess(true);
          // Refresh order data
          const updated = await trackOrder(order.order_id);
          if (updated.success) setOrder(updated.data);
        } else {
          alert(res.message || "Gagal upload bukti");
        }
      } catch (err) {
        alert("Terjadi kesalahan saat upload");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const getStatusColor = (status: string) => {
    if (status === 'Menunggu Pembayaran' || status === 'Menunggu Verifikasi') return 'bg-warning text-white';
    if (status === 'Telah Dibayar' || status === 'Lunas') return 'bg-blue-500 text-white';
    if (status === 'Sedang Diproses') return 'bg-primary text-white';
    if (status === 'Siap Dikirim' || status === 'Dalam Pengiriman') return 'bg-indigo-500 text-white';
    if (status === 'Selesai') return 'bg-success text-white';
    if (status === 'Dibatalkan') return 'bg-danger text-white';
    return 'bg-gray-200 text-gray-800';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl mb-20 md:mb-0">
      <h1 className="text-3xl font-bold mb-8 text-center">Lacak Pesanan</h1>
      
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm mb-8">
        <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            placeholder="Masukkan Nomor Pesanan (Misal: TKN-20231015-000001)" 
            className="flex-1 px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            className="bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? 'Mencari...' : 'Lacak'}
          </button>
        </form>
        {error && <p className="text-danger mt-4 font-medium text-center">{error}</p>}
      </div>

      {order && (
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-6 border-b border-border gap-4">
              <div>
                <p className="text-sm text-foreground/60">Order ID</p>
                <p className="text-xl font-bold">{order.order_id}</p>
              </div>
              <div className={`px-4 py-2 rounded-full font-bold text-sm ${getStatusColor(order.order_status || 'PENDING')}`}>
                {order.order_status || 'PENDING'}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-foreground/60 mb-1">Tanggal Pesanan</p>
                <p className="font-medium">{new Date(order.date).toLocaleString('id-ID')}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/60 mb-1">Metode Pembayaran</p>
                <p className="font-medium">{order.payment_method || 'Transfer Bank'}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/60 mb-1">Nama Penerima</p>
                <p className="font-medium">{order.customer_name}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/60 mb-1">Total Pembayaran</p>
                <p className="font-bold text-primary text-lg">Rp {Number(order.grand_total).toLocaleString('id-ID')}</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-foreground/60 mb-2">Alamat Pengiriman</p>
              <p className="font-medium bg-gray-50 p-4 rounded-xl border border-gray-100">
                {order.address} {order.village ? `, Ds. ${order.village}` : ''} {order.district ? `, Kec. ${order.district}` : ''}
              </p>
            </div>
            
            {(order.payment_method === 'Transfer Bank' || order.payment_method === 'QRIS') && (
              <div className="border-t border-border pt-6 mt-6">
                <h3 className="font-bold mb-4">Bukti Pembayaran</h3>
                {order.payment && order.payment.payment_proof_url ? (
                  <div className="flex items-center gap-4 bg-success/10 p-4 rounded-xl border border-success/20">
                    <div className="text-success text-2xl">✓</div>
                    <div>
                      <p className="font-bold text-success">Bukti Pembayaran Diterima</p>
                      <p className="text-sm text-success/80">Menunggu verifikasi admin.</p>
                      <a href={order.payment.payment_proof_url} target="_blank" rel="noreferrer" className="text-xs text-primary underline mt-1 inline-block">Lihat Gambar</a>
                    </div>
                  </div>
                ) : (
                  <div className="bg-warning/10 p-4 rounded-xl border border-warning/20">
                    <p className="font-bold text-warning-700 mb-2">Belum ada bukti pembayaran</p>
                    <p className="text-sm text-warning-700 mb-4">Silakan upload bukti transfer agar pesanan dapat segera diproses.</p>
                    
                    {uploadSuccess && <p className="text-success font-bold mb-2">Upload Berhasil!</p>}
                    
                    <label className="block w-full text-center bg-white border-2 border-dashed border-warning text-warning-700 font-bold py-4 rounded-xl cursor-pointer hover:bg-warning/5 transition-colors">
                      {uploading ? 'Mengupload...' : 'Pilih Gambar Bukti Pembayaran'}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold mb-4">Daftar Produk</h3>
            <div className="space-y-4">
              {order.items && order.items.length > 0 ? (
                order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                    <div className="flex gap-4 items-center">
                      <div className="font-medium text-foreground/70">{item.qty}x</div>
                      <div>
                        <p className="font-bold">{item.product_name}</p>
                        <p className="text-sm text-foreground/60">Rp {Number(item.price).toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                    <div className="font-bold">
                      Rp {Number(item.subtotal).toLocaleString('id-ID')}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-foreground/60">Detail item tidak tersedia</p>
              )}
            </div>
            <div className="mt-6 pt-4 border-t border-border flex justify-between font-bold text-lg">
              <span>Subtotal</span>
              <span>Rp {Number(order.subtotal).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between font-medium text-foreground/70 mt-2">
              <span>Ongkos Kirim</span>
              <span>Rp {Number(order.shipping_fee).toLocaleString('id-ID')}</span>
            </div>
            {Number(order.promo_discount) > 0 && (
              <div className="flex justify-between font-medium text-success mt-2">
                <span>Diskon</span>
                <span>- Rp {Number(order.promo_discount).toLocaleString('id-ID')}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
