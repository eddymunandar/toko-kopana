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
      case 'PENDING': return 'bg-warning/10 text-warning border-warning/20';
      case 'PROCESSING': return 'bg-primary/10 text-primary border-primary/20';
      case 'SHIPPING': return 'bg-primary/10 text-primary border-primary/20';
      case 'COMPLETED': return 'bg-success/10 text-success border-success/20';
      case 'CANCELED': return 'bg-danger/10 text-danger border-danger/20';
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
          <option value="PENDING">PENDING</option>
          <option value="PROCESSING">DIPROSES</option>
          <option value="SHIPPING">DIKIRIM</option>
          <option value="COMPLETED">SELESAI</option>
          <option value="CANCELED">BATAL</option>
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
