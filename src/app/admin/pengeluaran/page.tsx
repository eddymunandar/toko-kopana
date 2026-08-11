"use client";
import { useEffect, useState } from 'react';
import { getAdminExpenses } from "@/lib/api";
import ExpenseForm from "./ExpenseForm";

export default function PengeluaranPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const exp = await getAdminExpenses();
      setExpenses(exp || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-foreground">Pengeluaran</h1>
          <p className="text-foreground/60 mt-1">Catat dan pantau pengeluaran operasional.</p>
        </div>
        <button onClick={loadData} className="bg-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-primary-hover shadow-sm flex items-center gap-2">
          {loading ? 'Memuat...' : 'Muat Ulang'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Expense List */}
        <div className="lg:col-span-2 bg-white border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Riwayat Pengeluaran</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-hover border-b border-border text-sm font-semibold text-foreground/70">
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Keterangan</th>
                  <th className="px-4 py-3">Nominal</th>
                  <th className="px-4 py-3">Kategori</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    </td>
                  </tr>
                ) : expenses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-foreground/50">
                      Belum ada data pengeluaran.
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense: any, i: number) => (
                    <tr key={expense.id || i} className="hover:bg-surface-hover/50 transition-colors text-sm">
                      <td className="px-4 py-3 text-foreground/80">
                        {new Date(expense.created_at || expense.date).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-4 py-3 font-medium">{expense.description}</td>
                      <td className="px-4 py-3 text-danger font-bold">
                        Rp {Number(expense.amount).toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600">{expense.admin_name || 'Admin'}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Expense Form */}
        <div>
          <ExpenseForm onExpenseAdded={loadData} />
        </div>
      </div>
    </div>
  );
}
