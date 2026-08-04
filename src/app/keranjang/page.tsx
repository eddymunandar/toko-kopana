"use client";

import { useCart } from "@/components/CartProvider";
import Link from "next/link";
import { useState } from "react";
import { checkout } from "@/lib/api";

export default function KeranjangPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  // Form state
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    shipping: "ambil" // ambil | antar
  });

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    setLoading(true);
    setError("");
    
    try {
      const payload = {
        cart: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          qty: item.quantity,
          subtotal: item.price * item.quantity
        })),
        customer: {
          name: customer.name,
          phone: customer.phone,
          address: customer.address
        },
        shipping_method: customer.shipping,
        shipping_fee: customer.shipping === 'antar' ? 5000 : 0
      };
      
      const res = await checkout(payload);
      if (res.success) {
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
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <div className="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <h1 className="text-3xl font-black mb-4">Pesanan Berhasil!</h1>
        <p className="text-foreground/70 mb-8">Terima kasih telah berbelanja di Toko KOPAMA. Pesanan Anda sedang kami proses.</p>
        <Link href="/" className="inline-block bg-primary text-white font-bold px-8 py-3 rounded-full hover:bg-primary-hover transition-colors">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
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
          <div className="bg-surface border border-border rounded-2xl p-6 h-fit sticky top-24">
            <h2 className="text-xl font-bold mb-6">Ringkasan Pesanan</h2>
            
            <div className="flex justify-between mb-2 text-foreground/80">
              <span>Subtotal</span>
              <span className="font-medium">Rp {totalPrice.toLocaleString('id-ID')}</span>
            </div>
            
            <div className="flex justify-between mb-6 pb-6 border-b border-border text-foreground/80">
              <span>Ongkir</span>
              <span className="font-medium">{customer.shipping === 'antar' ? 'Rp 5.000' : 'Gratis'}</span>
            </div>

            <div className="flex justify-between mb-6 text-lg font-black">
              <span>Total</span>
              <span className="text-primary">
                Rp {(totalPrice + (customer.shipping === 'antar' ? 5000 : 0)).toLocaleString('id-ID')}
              </span>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-danger/10 text-danger rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
                <input required type="text" value={customer.name} onChange={e => setCustomer({...customer, name: e.target.value})} className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Budi Santoso" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">No. WhatsApp</label>
                <input required type="tel" value={customer.phone} onChange={e => setCustomer({...customer, phone: e.target.value})} className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="08123456789" />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setCustomer({...customer, shipping: 'ambil'})} className={`py-2 px-2 text-sm font-medium rounded-xl border ${customer.shipping === 'ambil' ? 'bg-primary/10 border-primary text-primary' : 'border-border text-foreground/70'}`}>Ambil di Toko</button>
                <button type="button" onClick={() => setCustomer({...customer, shipping: 'antar'})} className={`py-2 px-2 text-sm font-medium rounded-xl border ${customer.shipping === 'antar' ? 'bg-primary/10 border-primary text-primary' : 'border-border text-foreground/70'}`}>Antar (+5K)</button>
              </div>

              {customer.shipping === 'antar' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Alamat Lengkap</label>
                  <textarea required value={customer.address} onChange={e => setCustomer({...customer, address: e.target.value})} className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary h-24" placeholder="Jl. Raya Pamotan..."></textarea>
                </div>
              )}

              <button disabled={loading} type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4">
                {loading ? 'Memproses...' : 'Buat Pesanan'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
