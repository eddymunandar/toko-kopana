"use client";

import { useCart } from "@/components/CartProvider";
import { useCustomerAuth } from "@/components/CustomerAuthProvider";
import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { checkout, verifyMember, submitPaymentProof, getStoreSettings } from "@/lib/api";

export default function KeranjangPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderPayment, setOrderPayment] = useState("");
  const [error, setError] = useState("");
  
  // Payment proof state
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  // Settings state
  const [shippingFeeSetting, setShippingFeeSetting] = useState(5000);
  const [freeShippingMinSetting, setFreeShippingMinSetting] = useState(150000);

  useEffect(() => {
    getStoreSettings().then(settings => {
      if (settings.SHIPPING_FEE) setShippingFeeSetting(Number(settings.SHIPPING_FEE));
      if (settings.FREE_SHIPPING_MIN) setFreeShippingMinSetting(Number(settings.FREE_SHIPPING_MIN));
    }).catch(console.error);
  }, []);

  const { customer: authCustomer } = useCustomerAuth();
  
  // Form state
  const [customer, setCustomer] = useState({
    name: authCustomer?.name || "",
    phone: authCustomer?.phone || "",
    address: authCustomer?.address || "",
    district: authCustomer?.district || "",
    village: authCustomer?.village || "",
    city: authCustomer?.city || "",
    notes: "",
    shipping: "delivery", // pickup | delivery
    isMember: authCustomer?.role === "member",
    memberNo: authCustomer?.member_no || "",
    influencerNo: "",
    paymentMethod: "Transfer Bank" // Transfer Bank | QRIS | COD
  });

  useEffect(() => {
    if (authCustomer) {
      setCustomer(prev => ({
        ...prev,
        name: authCustomer.name || prev.name,
        phone: authCustomer.phone || prev.phone,
        address: authCustomer.address || prev.address,
        district: authCustomer.district || prev.district,
        village: authCustomer.village || prev.village,
        city: authCustomer.city || prev.city,
        isMember: authCustomer.role === "member",
        memberNo: authCustomer.member_no || prev.memberNo
      }));
    }
  }, [authCustomer]);

  const [memberInfo, setMemberInfo] = useState<any>(null);
  const [memberError, setMemberError] = useState("");
  const [verifying, setVerifying] = useState(false);

  const handleVerifyMember = async () => {
    if (!customer.memberNo) return;
    setVerifying(true);
    setMemberError("");
    setMemberInfo(null);
    try {
      const res = await verifyMember(customer.memberNo);
      if (res.success && res.data) {
        setMemberInfo(res.data);
        if (res.data.name) {
          setCustomer(prev => ({ ...prev, name: res.data.name }));
        }
      } else {
        setMemberError(res.message || "Member tidak ditemukan");
      }
    } catch (err) {
      setMemberError("Gagal memverifikasi member");
    } finally {
      setVerifying(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !orderId) return;
    
    if (file.size > 2 * 1024 * 1024) {
      alert("Maksimal ukuran file 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      
      setUploading(true);
      try {
        const res = await submitPaymentProof(orderId, base64String);
        if (res.success) {
          setUploadSuccess(true);
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

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    setError("");

    // Manual validation
    if (!customer.name.trim()) return setError("Mohon isi Nama Lengkap");
    if (!customer.phone.trim()) return setError("Mohon isi No. WhatsApp");
    if (!customer.address.trim()) return setError("Mohon isi Alamat Lengkap");
    if (customer.isMember && !customer.memberNo.trim()) return setError("Mohon isi Nomor Anggota");
    if (customer.isMember && !memberInfo) return setError("Mohon klik tombol Cek untuk verifikasi Nomor Anggota");

    setLoading(true);
    
    try {
      const shippingFee = customer.shipping === 'delivery' ? (totalPrice >= freeShippingMinSetting ? 0 : shippingFeeSetting) : 0;
      const grandTotal = totalPrice + shippingFee;
      
      const payload = {
        customer: {
          name: customer.name,
          whatsapp: customer.phone,
          address: customer.address,
          district: customer.district,
          village: customer.village,
          city: customer.city,
          courier_notes: (customer.shipping === 'pickup' ? '[Ambil Sendiri] ' : '[Dikirim] ') + customer.notes
        },
        summary: {
          subtotal: totalPrice,
          shipping_fee: shippingFee,
          grand_total: grandTotal
        },
        cart: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          qty: item.quantity,
          subtotal: item.price * item.quantity
        })),
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          qty: item.quantity,
          subtotal: item.price * item.quantity
        })),
        customer_name: customer.name,
        whatsapp: customer.phone,
        address: customer.address,
        district: customer.district,
        village: customer.village,
        city: customer.city,
        notes: customer.notes,
        is_member: customer.isMember,
        member_no: memberInfo ? memberInfo.member_no : customer.memberNo,
        influencer_no: customer.influencerNo,
        payment_method: customer.paymentMethod,
        promo_code: "",
        promo_discount: 0
      };
      
      const res = await checkout(payload);
      if (res.success) {
        setOrderId(res.data?.order_id || res.order_id || "");
        setOrderTotal(grandTotal);
        setOrderPayment(customer.paymentMethod);
        setSuccess(true);
        clearCart();
      } else {
        setError(res.message || "Gagal melakukan checkout.");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg mb-20 md:mb-0">
        <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <h1 className="text-3xl font-black mb-4">Pesanan Berhasil!</h1>
        {orderId && (
          <p className="text-lg font-bold text-primary mb-4">No. Order: {orderId}</p>
        )}
        
        <div className="bg-surface border border-border rounded-2xl p-6 text-left mb-8">
          <h2 className="font-bold mb-4">Detail Pembayaran</h2>
          <div className="flex justify-between mb-2">
            <span className="text-foreground/70">Metode</span>
            <span className="font-semibold">{orderPayment}</span>
          </div>
          <div className="flex justify-between mb-4 pb-4 border-b border-border">
            <span className="text-foreground/70">Total Bayar</span>
            <span className="font-bold text-primary text-lg">Rp {orderTotal.toLocaleString('id-ID')}</span>
          </div>
          
          {orderPayment === 'Transfer Bank' && (
            <div className="bg-primary/10 p-4 rounded-xl mt-4">
              <p className="text-sm font-semibold mb-2">Silakan transfer ke:</p>
              <p className="font-mono font-bold text-lg text-primary">BCA 1234567890</p>
              <p className="text-sm text-foreground/70">a.n. Koperasi KOPANA</p>
            </div>
          )}
        </div>
        
        {(orderPayment === 'Transfer Bank' || orderPayment === 'QRIS') && (
          <div className="mb-8">
            {uploadSuccess ? (
              <div className="bg-success/10 p-4 rounded-xl border border-success/20 flex flex-col items-center">
                <div className="w-12 h-12 bg-success text-white rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <p className="font-bold text-success text-center">Bukti Pembayaran Diterima</p>
                <p className="text-sm text-success/80 text-center mt-1">Pesanan akan diverifikasi admin</p>
              </div>
            ) : (
              <div className="bg-warning/10 p-4 rounded-xl border border-warning/20">
                <p className="font-bold text-warning-700 mb-2">Upload Bukti Transfer</p>
                <p className="text-sm text-warning-700 mb-4">Silakan upload bukti transfer agar pesanan dapat diproses.</p>
                <label className="block w-full text-center bg-white border-2 border-dashed border-warning text-warning-700 font-bold py-4 rounded-xl cursor-pointer hover:bg-warning/5 transition-colors">
                  {uploading ? 'Mengupload...' : 'Pilih Gambar'}
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

        <p className="text-foreground/70 mb-8">Terima kasih telah berbelanja di Toko KOPANA. Pesanan Anda sedang kami proses.</p>
        <div className="flex flex-col gap-4">
          <Link href="/lacak" className="inline-block bg-primary text-white font-bold px-8 py-3 rounded-full hover:bg-primary-hover transition-colors">
            Lacak Pesanan
          </Link>
          <Link href="/" className="inline-block bg-surface text-primary border border-primary font-bold px-8 py-3 rounded-full hover:bg-gray-50 transition-colors">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl mb-20 md:mb-0">
      <h1 className="text-3xl font-bold mb-8">Keranjang Belanja</h1>
      
      {cart.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-border rounded-2xl">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-border mb-4"><circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path></svg>
          <p className="text-lg text-foreground/60 mb-6">Keranjang Anda masih kosong.</p>
          <Link href="/" className="inline-block bg-primary text-white font-bold px-6 py-2 rounded-full hover:bg-primary-hover transition-colors">
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 bg-surface border border-border rounded-2xl relative">
                <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-xs text-gray-400">IMG</span>
                </div>
                <div className="flex-1 flex flex-col">
                  <h3 className="font-bold text-lg leading-tight">{item.name}</h3>
                  <p className="text-primary font-bold mt-1">Rp {item.price.toLocaleString('id-ID')}</p>
                  
                  <div className="mt-auto flex items-center gap-4">
                    <div className="flex items-center border border-border rounded-full">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-foreground/70 hover:text-primary">-</button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-foreground/70 hover:text-primary">+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-danger text-sm font-medium hover:underline">Hapus</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Form */}
          <div className="bg-surface border border-border rounded-2xl p-6 h-fit lg:sticky lg:top-24">
            <h2 className="text-xl font-bold mb-6">Ringkasan Pesanan</h2>
            
            <div className="flex justify-between mb-2 text-foreground/80">
              <span>Subtotal</span>
              <span className="font-medium">Rp {totalPrice.toLocaleString('id-ID')}</span>
            </div>
            
            <div className="flex justify-between mb-6 pb-6 border-b border-border text-foreground/80">
              <span>Ongkir</span>
              <span className="font-medium">
                {customer.shipping === 'delivery' ? (totalPrice >= freeShippingMinSetting ? 'Gratis' : `Rp ${shippingFeeSetting.toLocaleString('id-ID')}`) : 'Gratis'}
              </span>
            </div>

            <div className="flex justify-between mb-6 text-lg font-black">
              <span>Total</span>
              <span className="text-primary">
                Rp {(totalPrice + (customer.shipping === 'delivery' ? (totalPrice >= freeShippingMinSetting ? 0 : shippingFeeSetting) : 0)).toLocaleString('id-ID')}
              </span>
            </div>

            {/* Promo Ongkir Message */}
            {customer.shipping === 'delivery' && freeShippingMinSetting > 0 && (
              <div className="mb-6 mt-[-10px]">
                {totalPrice >= freeShippingMinSetting ? (
                  <div className="bg-green-50 text-green-700 text-sm font-bold p-3 rounded-xl border border-green-200 flex items-center gap-2">
                    <span>🎉</span> Selamat! Anda mendapatkan Gratis Ongkir.
                  </div>
                ) : (
                  <div className="bg-blue-50 text-blue-700 text-sm p-3 rounded-xl border border-blue-200">
                    Belanja <strong>Rp {(freeShippingMinSetting - totalPrice).toLocaleString('id-ID')}</strong> lagi untuk dapat <strong>Gratis Ongkir!</strong>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-danger/10 text-danger rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleCheckout} className="space-y-4">
              {/* Delivery Method */}
              <div>
                <label className="block text-sm font-medium mb-1">Metode Pengiriman</label>
                <select 
                  value={customer.shipping} 
                  onChange={e => setCustomer({...customer, shipping: e.target.value})} 
                  className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white"
                >
                  <option value="pickup">🏪 Ambil Sendiri di Koperasi (Gratis)</option>
                  <option value="delivery">🛵 Dikirim Kurir (+Rp 5.000)</option>
                </select>
              </div>

              {/* Data Penerima */}
              <div className="pt-2 border-t border-border">
                <h3 className="font-bold mb-3">Data Penerima</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nama Lengkap *</label>
                    <input type="text" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:border-primary" placeholder="Budi Santoso" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">No. WhatsApp *</label>
                    <input type="tel" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:border-primary" placeholder="08123456789" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Alamat Lengkap *</label>
                    <textarea value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:border-primary h-20" placeholder="Jl. Raya Pamotan..."></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Kecamatan</label>
                      <input type="text" value={customer.district} onChange={e => setCustomer({...customer, district: e.target.value})} className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:border-primary" placeholder="Opsional" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Desa</label>
                      <input type="text" value={customer.village} onChange={e => setCustomer({...customer, village: e.target.value})} className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:border-primary" placeholder="Opsional" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Catatan</label>
                    <input type="text" value={customer.notes} onChange={e => setCustomer({...customer, notes: e.target.value})} className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:border-primary" placeholder="Catatan opsional..." />
                  </div>
                </div>
              </div>

              {/* Membership */}
              <div className="pt-2 border-t border-border">
                <h3 className="font-bold mb-3">Keanggotaan KOPANA</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Status Keanggotaan</label>
                    <select 
                      value={customer.isMember ? "true" : "false"} 
                      onChange={e => setCustomer({...customer, isMember: e.target.value === "true"})} 
                      className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:border-primary bg-white"
                    >
                      <option value="false">Bukan Anggota</option>
                      <option value="true">✅ Ya, Saya Anggota</option>
                    </select>
                  </div>
                  
                  {customer.isMember ? (
                    <div>
                      <label className="block text-sm font-medium mb-1">Nomor Anggota *</label>
                      <div className="flex gap-2">
                        <input type="text" value={customer.memberNo} onChange={e => setCustomer({...customer, memberNo: e.target.value})} className="flex-1 px-4 py-2 border border-border rounded-xl focus:outline-none focus:border-primary" placeholder="KPM-XXX" />
                        <button type="button" onClick={handleVerifyMember} disabled={verifying || !customer.memberNo} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-xl font-medium hover:bg-gray-300 disabled:opacity-50">
                          {verifying ? 'Cek...' : 'Cek'}
                        </button>
                      </div>
                      {memberError && <p className="text-danger text-xs mt-1">{memberError}</p>}
                      {memberInfo && <p className="text-success text-xs mt-1">Halo, {memberInfo.name}!</p>}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium mb-1">Kode Referral / Influencer <span className="text-gray-400 font-normal">(Opsional)</span></label>
                      <input type="text" value={customer.influencerNo} onChange={e => setCustomer({...customer, influencerNo: e.target.value})} className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:border-primary" placeholder="Nomor Anggota Referensi" />
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div className="pt-2 border-t border-border">
                <h3 className="font-bold mb-3">Metode Pembayaran</h3>
                <select 
                  value={customer.paymentMethod} 
                  onChange={e => setCustomer({...customer, paymentMethod: e.target.value})} 
                  className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:border-primary bg-white"
                >
                  <option value="Transfer Bank">🏦 Transfer Bank</option>
                  <option value="QRIS">📱 QRIS</option>
                  <option value="COD">💵 Bayar di Tempat (COD)</option>
                </select>
              </div>

              <button disabled={loading || (customer.isMember && !memberInfo)} type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4">
                {loading ? 'Memproses...' : 'Buat Pesanan'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
