"use client";

import { useState, useEffect } from "react";
import { useCustomerAuth } from "@/components/CustomerAuthProvider";
import { useTheme } from "@/components/ThemeProvider";
import { useWishlist } from "@/components/WishlistProvider";
import { loginCustomer, registerCustomer, updateCustomerProfile, verifyMember, getCustomerOrders, cancelOrder, getProductsByIds, Product, getNotifications, markNotificationAsRead } from "@/lib/api";
import Link from "next/link";

export default function AkunPage() {
  const { customer, login, logout, updateProfile } = useCustomerAuth();
  const { theme, setTheme } = useTheme();
  
  const [isLogin, setIsLogin] = useState(true);
  const [isMember, setIsMember] = useState(false);
  const [isMemberVerified, setIsMemberVerified] = useState(false);
  
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [memberNo, setMemberNo] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [village, setVillage] = useState("");
  const [city, setCity] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [activeTab, setActiveTab] = useState<'profil' | 'riwayat' | 'wishlist' | 'notifikasi'>('profil');
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const { wishlist, removeFromWishlist } = useWishlist();
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  useEffect(() => {
    if (activeTab === 'wishlist' && wishlist.length > 0) {
      loadWishlistProducts();
    } else if (activeTab === 'wishlist' && wishlist.length === 0) {
      setWishlistProducts([]);
    }
  }, [activeTab, wishlist]);

  const loadWishlistProducts = async () => {
    setLoadingWishlist(true);
    try {
      const data = await getProductsByIds(wishlist);
      setWishlistProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingWishlist(false);
    }
  };

  useEffect(() => {
    if (customer && activeTab === 'riwayat') {
      loadOrders();
    }
  }, [customer, activeTab]);

  useEffect(() => {
    if (customer && activeTab === 'notifikasi') {
      loadNotifications();
    }
  }, [customer, activeTab]);

  const loadNotifications = async () => {
    if (!customer?.phone) return;
    setLoadingNotifs(true);
    try {
      const data = await getNotifications(customer.phone);
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingNotifs(false);
    }
  };

  const handleReadNotification = async (id: string, isRead: boolean) => {
    if (isRead) return;
    await markNotificationAsRead(id);
    loadNotifications();
  };

  const loadOrders = async () => {
    if (!customer?.phone) return;
    setLoadingOrders(true);
    try {
      const data = await getCustomerOrders(customer.phone);
      // Sort orders descending by order_id or date
      data.sort((a, b) => b.order_id.localeCompare(a.order_id));
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const canCancelOrder = (status: string) => {
    const cancelableStatuses = ['Menunggu Pembayaran', 'PENDING', 'Pending', '', 'null'];
    return cancelableStatuses.includes(status) || !status;
  };

  const handleCancelOrder = async (orderId: string) => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin membatalkan pesanan ${orderId}?\n\nPesanan yang sudah dibatalkan tidak dapat dikembalikan.`
    );
    if (!confirmed) return;

    setCancelingId(orderId);
    try {
      const res = await cancelOrder(orderId);
      if (res.success) {
        alert('Pesanan berhasil dibatalkan.');
        loadOrders(); // Refresh daftar pesanan
      } else {
        alert(res.message || 'Gagal membatalkan pesanan');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat membatalkan pesanan');
    } finally {
      setCancelingId(null);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const res = await loginCustomer({ phone, password });
      if (res.success) {
        login(res.data);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMember = async () => {
    if (!memberNo) {
      setError("Silakan masukkan Nomor Anggota.");
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const res = await verifyMember(memberNo);
      if (res.success && res.data) {
        setName(res.data.name || "");
        setPhone(res.data.whatsapp || "");
        setAddress(res.data.address || "");
        
        setIsMemberVerified(true);
        setSuccess(`Halo ${res.data.name}, nomor anggota Anda valid. Silakan lengkapi data berikut.`);
      } else {
        setError(res.message || "Nomor Anggota tidak ditemukan.");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat memverifikasi nomor anggota.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const payload = {
        phone,
        password,
        name,
        isMember,
        memberNo,
        address,
        district,
        village,
        city
      };
      
      const res = await registerCustomer(payload);
      if (res.success) {
        setSuccess("Pendaftaran berhasil! Anda otomatis masuk.");
        login(res.data);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const payload = {
        account_id: customer?.account_id,
        address,
        district,
        village,
        city
      };
      
      const res = await updateCustomerProfile(payload);
      if (res.success) {
        updateProfile(payload);
        setSuccess("Profil berhasil diperbarui!");
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  if (customer) {
    return (
      <div className="container max-w-2xl mx-auto py-10 px-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-neutral-800 mb-1">Halo, {customer.name}</h1>
              <p className="text-neutral-500">{customer.phone}</p>
              {customer.role === "member" && (
                <span className="inline-block mt-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-semibold">
                  Anggota Kopana: {customer.member_no}
                </span>
              )}
            </div>
            <button 
              onClick={logout}
              className="text-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors font-medium"
            >
              Keluar
            </button>
          </div>
          
          <div className="flex border-b border-neutral-100 mb-6 gap-6 overflow-x-auto whitespace-nowrap hide-scrollbar">
            <button 
              onClick={() => setActiveTab('profil')} 
              className={`pb-3 font-semibold ${activeTab === 'profil' ? 'text-green-600 border-b-2 border-green-600' : 'text-neutral-500 hover:text-neutral-700'}`}
            >
              Profil Saya
            </button>
            <button 
              onClick={() => setActiveTab('riwayat')} 
              className={`pb-3 font-semibold ${activeTab === 'riwayat' ? 'text-green-600 border-b-2 border-green-600' : 'text-neutral-500 hover:text-neutral-700'}`}
            >
              Riwayat Pesanan
            </button>
            <button 
              onClick={() => setActiveTab('wishlist')} 
              className={`pb-3 font-semibold flex gap-2 items-center ${activeTab === 'wishlist' ? 'text-green-600 border-b-2 border-green-600' : 'text-neutral-500 hover:text-neutral-700'}`}
            >
              Wishlist Saya
              {wishlist.length > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{wishlist.length}</span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('notifikasi')} 
              className={`pb-3 font-semibold flex gap-2 items-center ${activeTab === 'notifikasi' ? 'text-green-600 border-b-2 border-green-600' : 'text-neutral-500 hover:text-neutral-700'}`}
            >
              Notifikasi
            </button>
          </div>

          {activeTab === 'profil' ? (
            <>
              <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-start space-x-3 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 shrink-0 mt-0.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <div>
                  <h3 className="font-semibold text-green-900">Alamat Pengiriman Utama</h3>
                  <p className="text-sm text-green-800 mt-1">
                    {customer.address ? `${customer.address}, ${customer.village}, ${customer.district}, ${customer.city}` : "Anda belum melengkapi alamat."}
                  </p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <h3 className="font-bold text-neutral-800 border-b pb-2">Perbarui Alamat</h3>
            
            {success && <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">{success}</div>}
            {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Alamat Lengkap (Jalan, RT/RW, No. Rumah)</label>
                <textarea 
                  className="w-full border border-neutral-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={customer.address || "Misal: Jl. Mawar No. 12, RT 01/RW 02"}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Kecamatan</label>
                  <input 
                    type="text" 
                    className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500 outline-none"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder={customer.district || "Kecamatan"}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Kelurahan / Desa</label>
                  <input 
                    type="text" 
                    className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500 outline-none"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder={customer.village || "Kelurahan"}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Kabupaten / Kota</label>
                <input 
                  type="text" 
                  className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500 outline-none"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={customer.city || "Kota"}
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-70 flex justify-center items-center"
            >
              {loading ? <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : "Simpan Perubahan"}
            </button>
          </form>
          
          <div className="mt-8 border-t pt-6">
            <h3 className="font-bold text-neutral-800 mb-4">Pengaturan Tampilan</h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setTheme('light')}
                className={`py-2 px-3 rounded-xl border ${theme === 'light' ? 'border-green-600 bg-green-50 text-green-700 font-semibold' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'} transition-all flex flex-col items-center gap-1`}
              >
                <span className="text-xl">☀️</span>
                <span className="text-xs">Terang</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`py-2 px-3 rounded-xl border ${theme === 'dark' ? 'border-green-600 bg-green-50 text-green-700 font-semibold' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'} transition-all flex flex-col items-center gap-1`}
              >
                <span className="text-xl">🌙</span>
                <span className="text-xs">Gelap</span>
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`py-2 px-3 rounded-xl border ${theme === 'system' ? 'border-green-600 bg-green-50 text-green-700 font-semibold' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'} transition-all flex flex-col items-center gap-1`}
              >
                <span className="text-xl">🖥️</span>
                <span className="text-xs">Sistem</span>
              </button>
            </div>
          </div>
          </>
          ) : activeTab === 'riwayat' ? (
            <div className="space-y-4">
              {loadingOrders ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
                  <p>Anda belum memiliki riwayat pesanan.</p>
                </div>
              ) : (
                orders.map((o) => (
                  <div key={o.order_id} className="border border-neutral-100 rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-sm text-neutral-800">{o.order_id}</span>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${
                          o.order_status === 'Selesai' ? 'bg-green-100 text-green-700' : 
                          o.order_status === 'Batal' ? 'bg-red-100 text-red-700' : 
                          'bg-blue-100 text-blue-700'
                        }`}>
                          📦 {o.order_status || o.status || 'PENDING'}
                        </span>
                        <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${
                          (o.payment_status === 'PAID' || ['Telah Dibayar', 'Lunas', 'Sedang Diproses', 'Siap Dikirim', 'Dalam Pengiriman', 'Selesai'].includes(o.order_status || o.status)) ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          💳 {(o.payment_status === 'PAID' || ['Telah Dibayar', 'Lunas', 'Sedang Diproses', 'Siap Dikirim', 'Dalam Pengiriman', 'Selesai'].includes(o.order_status || o.status)) ? 'Lunas' : (o.payment_status || 'Belum Lunas')}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-neutral-600 mb-3">
                      {new Date(o.timestamp || o.date).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                    <div className="space-y-1 mb-3">
                      {(() => {
                        let items = [];
                        try {
                          items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items;
                        } catch(e) {}
                        return (items || []).map((item: any, i: number) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-neutral-700">{item.qty}x {item.name}</span>
                            <span className="font-medium">Rp {(item.price * item.qty).toLocaleString('id-ID')}</span>
                          </div>
                        ));
                      })()}
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-neutral-100 font-bold">
                      <span>Total Tagihan</span>
                      <span className="text-green-700">Rp {Number(o.total || 0).toLocaleString('id-ID')}</span>
                    </div>
                    {canCancelOrder(o.order_status || o.status) && (
                      <button
                        onClick={() => handleCancelOrder(o.order_id)}
                        disabled={cancelingId === o.order_id}
                        className="w-full mt-3 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-xl transition-colors disabled:opacity-50 text-sm"
                      >
                        {cancelingId === o.order_id ? 'Membatalkan...' : '✕ Batalkan Pesanan'}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : activeTab === 'wishlist' ? (
            <div className="space-y-4">
              {loadingWishlist ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : wishlistProducts.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
                  <p>Anda belum menyimpan produk ke Wishlist.</p>
                  <Link href="/#katalog" className="inline-block mt-4 text-green-600 font-semibold hover:underline">
                    Lihat Katalog Produk
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlistProducts.map((p) => (
                    <div key={p.id} className="border border-neutral-100 rounded-xl p-3 flex gap-4 items-center">
                      <div className="w-20 h-20 bg-neutral-100 rounded-lg overflow-hidden shrink-0">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-300">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-semibold text-sm line-clamp-2">{p.name}</h4>
                        <div className="text-green-600 font-bold text-sm mt-1">Rp {p.price.toLocaleString('id-ID')}</div>
                      </div>
                      <button 
                        onClick={() => removeFromWishlist(p.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors shrink-0"
                        title="Hapus dari Wishlist"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'notifikasi' ? (
            <div className="space-y-4">
              {loadingNotifs ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-neutral-500">
                  <p>Anda belum memiliki notifikasi.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => handleReadNotification(n.id, n.is_read)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${n.is_read ? 'bg-white border-neutral-100 opacity-75' : 'bg-green-50 border-green-200'}`}
                    >
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <h4 className={`font-semibold ${n.is_read ? 'text-neutral-800' : 'text-green-900'}`}>{n.title}</h4>
                        {!n.is_read && <span className="bg-red-500 w-2.5 h-2.5 rounded-full shrink-0 mt-1.5"></span>}
                      </div>
                      <p className={`text-sm ${n.is_read ? 'text-neutral-600' : 'text-green-800'}`}>{n.message}</p>
                      <div className="text-[10px] text-neutral-400 mt-3 font-medium">
                        {new Date(n.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
        
        <div className="text-center">
          <Link href="/" className="inline-flex items-center text-green-600 hover:text-green-700 font-medium">
            Mulai Belanja <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-neutral-900 mb-2">
          {isLogin ? "Masuk ke Akun" : "Daftar Akun Baru"}
        </h1>
        <p className="text-neutral-500">
          {isLogin ? "Belanja lebih cepat dan praktis." : "Bergabunglah untuk menikmati kemudahan berbelanja."}
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-green-900/5 border border-neutral-100">
        
        {/* Tabs */}
        <div className="flex bg-neutral-100 rounded-xl p-1 mb-6">
          <button 
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${isLogin ? "bg-white text-green-700 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
            onClick={() => { setIsLogin(true); setError(""); setSuccess(""); }}
          >
            Masuk
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${!isLogin ? "bg-white text-green-700 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
            onClick={() => { setIsLogin(false); setError(""); setSuccess(""); }}
          >
            Daftar
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-xl text-sm border border-green-100">{success}</div>}

        {isLogin ? (
          // FORM LOGIN
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">No. WhatsApp</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </div>
                <input 
                  type="tel" 
                  required
                  className="w-full border border-neutral-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-green-500 outline-none transition-all bg-neutral-50 focus:bg-white"
                  placeholder="081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Kata Sandi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
                </div>
                <input 
                  type="password" 
                  required
                  className="w-full border border-neutral-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-green-500 outline-none transition-all bg-neutral-50 focus:bg-white"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all disabled:opacity-70 flex justify-center items-center shadow-lg shadow-green-600/20 mt-6"
            >
              {loading ? <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : "Masuk Sekarang"}
            </button>
          </form>
        ) : (
          // FORM DAFTAR
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 mb-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                  checked={isMember}
                  onChange={(e) => {
                    setIsMember(e.target.checked);
                    setIsMemberVerified(false);
                    setError("");
                    setSuccess("");
                  }}
                />
                <span className="font-semibold text-neutral-700 text-sm">Saya adalah Anggota Kopana</span>
              </label>
              
              {isMember && !isMemberVerified && (
                <div className="mt-4 flex space-x-2">
                  <input 
                    type="text" 
                    className="flex-1 border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="Nomor Anggota"
                    value={memberNo}
                    onChange={(e) => setMemberNo(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyMember}
                    disabled={loading || !memberNo}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-70 flex items-center"
                  >
                    {loading ? "Cek..." : "Cek Anggota"}
                  </button>
                </div>
              )}
            </div>

            {(!isMember || (isMember && isMemberVerified)) && (
              <>
                {!isMember && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Nama Lengkap</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  </div>
                  <input 
                    type="text" 
                    required={!isMember}
                    className="w-full border border-neutral-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-green-500 outline-none bg-neutral-50 focus:bg-white"
                    placeholder="Nama Anda"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">No. WhatsApp</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </div>
                <input 
                  type="tel" 
                  required
                  className="w-full border border-neutral-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-green-500 outline-none bg-neutral-50 focus:bg-white"
                  placeholder="081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Buat Kata Sandi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
                </div>
                <input 
                  type="password" 
                  required
                  className="w-full border border-neutral-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-green-500 outline-none bg-neutral-50 focus:bg-white"
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 mt-4">
              <p className="text-sm font-semibold text-neutral-800 mb-3">Lengkapi Alamat Pengiriman</p>
              
              <div className="space-y-3">
                <textarea 
                  className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500 outline-none bg-neutral-50 focus:bg-white text-sm"
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jl. Mawar No. 12, RT 01/RW 02"
                  required
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="text" 
                    className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500 outline-none bg-neutral-50 focus:bg-white text-sm"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Kecamatan"
                    required
                  />
                  <input 
                    type="text" 
                    className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500 outline-none bg-neutral-50 focus:bg-white text-sm"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="Kelurahan"
                    required
                  />
                </div>
                <input 
                  type="text" 
                  className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-green-500 outline-none bg-neutral-50 focus:bg-white text-sm"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Kabupaten / Kota"
                  required
                />
              </div>
            </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all disabled:opacity-70 flex justify-center items-center shadow-lg shadow-green-600/20 mt-6"
                >
                  {loading ? <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : "Daftar & Masuk"}
                </button>
              </>
            )}
              </form>
            )}
      </div>
    </div>
  );
}
