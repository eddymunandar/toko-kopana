"use client";

import { useState } from "react";
import { updateOrderStatus } from "@/lib/api";

export default function OrderStatusSelect({ 
  orderId, 
  initialStatus 
}: { 
  orderId: string; 
  initialStatus: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    const oldStatus = status;
    setStatus(newStatus);
    setLoading(true);
    setError("");

    try {
      const res = await updateOrderStatus(orderId, newStatus);
      if (!res.success) {
        throw new Error(res.message);
      }
    } catch (err: any) {
      setError(err.message || "Gagal update status");
      setStatus(oldStatus); // Revert on fail
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'Menunggu Pembayaran': 
      case 'Menunggu Verifikasi': return 'bg-warning/10 text-warning border-warning/20';
      case 'Telah Dibayar':
      case 'Lunas': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Sedang Diproses': return 'bg-primary/10 text-primary border-primary/20';
      case 'Siap Dikirim':
      case 'Dalam Pengiriman': return 'bg-info/10 text-info border-info/20';
      case 'Selesai': return 'bg-success/10 text-success border-success/20';
      case 'Dibatalkan': return 'bg-danger/10 text-danger border-danger/20';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="relative">
        <select 
          value={status}
          onChange={handleChange}
          disabled={loading}
          className={`appearance-none font-semibold text-xs rounded-full px-3 py-1.5 border pr-8 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors cursor-pointer disabled:opacity-50 ${getStatusColor(status)}`}
        >
          <option value="Menunggu Pembayaran">Menunggu Pembayaran</option>
          <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
          <option value="Telah Dibayar">Telah Dibayar</option>
          <option value="Sedang Diproses">Sedang Diproses</option>
          <option value="Siap Dikirim">Siap Dikirim</option>
          <option value="Dalam Pengiriman">Dalam Pengiriman</option>
          <option value="Selesai">Selesai</option>
          <option value="Dibatalkan">Dibatalkan</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
          <svg className={`w-4 h-4 ${getStatusColor(status).split(' ')[1]}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
      {error && <span className="text-[10px] text-danger">{error}</span>}
      {loading && <span className="text-[10px] text-foreground/50">Menyimpan...</span>}
    </div>
  );
}
