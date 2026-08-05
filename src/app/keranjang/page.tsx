"use client";

import { useCart } from "@/components/CartProvider";
import Link from "next/link";
import { useState } from "react";
import { checkout, verifyMember } from "@/lib/api";

export default function KeranjangPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState("");
  
  // Form state
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    district: "",
    village: "",
    city: "",
    notes: "",
    shipping: "delivery", // pickup | delivery
    isMember: false,
    memberNo: "",
    influencerNo: "",
    paymentMethod: "Transfer Bank" // Transfer Bank | QRIS | COD
  });

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

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    setLoading(true);
    setError("");
    
    try {
      const shippingFee = customer.shipping === 'delivery' ? 5000 : 0;
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
        setOrderId(res.order_id || "");
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
          <p className="text-lg font-bold text-primary mb-2">Order ID: {orderId}</p>
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
              <span className="font-medium">{customer.shipping === 'delivery' ? 'Rp 5.000' : 'Gratis'}</span>
            </div>

            <div className="flex justify-between mb-6 text-lg font-black">
              <span>Total</span>
              <span className="text-primary">
                Rp {(totalPrice + (customer.shipping === 'delivery' ? 5000 : 0)).toLocaleString('id-ID')}
              </span>
            </div>

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
                    <input required type="text" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:border-primary" placeholder="Budi Santoso" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">No. WhatsApp *</label>
                    <input required type="tel" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:border-primary" placeholder="08123456789" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Alamat Lengkap *</label>
                    <textarea required value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:border-primary h-20" placeholder="Jl. Raya Pamotan..."></textarea>
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
                        <input required type="text" value={customer.memberNo} onChange={e => setCustomer({...customer, memberNo: e.target.value})} className="flex-1 px-4 py-2 border border-border rounded-xl focus:outline-none focus:border-primary" placeholder="KPM-XXX" />
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
