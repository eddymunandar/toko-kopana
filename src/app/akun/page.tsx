"use client";

import { useState } from "react";
import { useCustomerAuth } from "@/components/CustomerAuthProvider";
import { loginCustomer, registerCustomer, updateCustomerProfile } from "@/lib/api";
import { User, Key, MapPin, Loader2, ArrowRight, UserPlus, Phone } from "lucide-react";
import Link from "next/link";

export default function AkunPage() {
  const { customer, login, logout, updateProfile } = useCustomerAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [isMember, setIsMember] = useState(false);
  
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
          
          <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-start space-x-3 mb-6">
            <MapPin className="text-green-600 shrink-0 mt-0.5" size={20} />
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
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Simpan Perubahan"}
            </button>
          </form>
        </div>
        
        <div className="text-center">
          <Link href="/" className="inline-flex items-center text-green-600 hover:text-green-700 font-medium">
            Mulai Belanja <ArrowRight size={16} className="ml-1" />
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
                  <Phone size={18} />
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
                  <Key size={18} />
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
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Masuk Sekarang"}
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
                  onChange={(e) => setIsMember(e.target.checked)}
                />
                <span className="font-semibold text-neutral-700 text-sm">Saya adalah Anggota Kopana</span>
              </label>
              {isMember && (
                <div className="mt-3">
                  <input 
                    type="text" 
                    required={isMember}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="Masukkan Nomor Anggota"
                    value={memberNo}
                    onChange={(e) => setMemberNo(e.target.value)}
                  />
                  <p className="text-xs text-neutral-500 mt-1">Sistem akan memverifikasi nama Anda berdasarkan nomor ini.</p>
                </div>
              )}
            </div>

            {!isMember && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Nama Lengkap</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <User size={18} />
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
                  <Phone size={18} />
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
                  <Key size={18} />
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
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Daftar & Masuk"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
