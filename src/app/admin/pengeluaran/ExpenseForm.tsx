"use client";

import { useState } from "react";
import { saveExpense } from "@/lib/api";

export default function ExpenseForm({ onExpenseAdded }: { onExpenseAdded?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  
  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: "Operasional"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        description: form.description,
        amount: Number(form.amount),
        category: form.category
      };
      
      const res = await saveExpense(payload);
      if (res.success) {
        setSuccess("Pengeluaran berhasil dicatat!");
        setForm({ description: "", amount: "", category: "Operasional" });
        if (onExpenseAdded) onExpenseAdded();
      } else {
        setError(res.message || "Gagal menyimpan data.");
      }
    } catch (err: any) {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-border rounded-2xl p-6 shadow-sm sticky top-6">
      <h3 className="text-lg font-bold mb-4">Catat Pengeluaran</h3>
      
      {success && <div className="mb-4 p-3 bg-success/10 text-success rounded-xl text-sm font-medium">{success}</div>}
      {error && <div className="mb-4 p-3 bg-danger/10 text-danger rounded-xl text-sm font-medium">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-foreground/80">Keterangan</label>
          <input required type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="Beli lakban packing..." />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-foreground/80">Nominal (Rp)</label>
          <input required type="number" min="1" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" placeholder="50000" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-foreground/80">Kategori</label>
          <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white">
            <option value="Operasional">Operasional (Lakban, Plastik, dll)</option>
            <option value="Ongkir">Ongkos Kirim (Otomatis)</option>
            <option value="Restock">Restock Barang</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>
        
        <button disabled={loading} type="submit" className="w-full bg-primary text-white font-bold py-2.5 rounded-xl hover:bg-primary-hover transition-colors disabled:opacity-50 mt-2">
          {loading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </form>
    </div>
  );
}
