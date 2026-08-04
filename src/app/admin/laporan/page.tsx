import { getDashboardData, getAdminExpenses } from "@/lib/api";
import ExpenseForm from "./ExpenseForm";

export const revalidate = 0; // Disable cache

export default async function AdminReportPage() {
  const [dashboard, expenses] = await Promise.all([
    getDashboardData(),
    getAdminExpenses()
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground">Laporan Keuangan</h1>
        <p className="text-foreground/60 mt-1">Ringkasan pendapatan dan pengeluaran toko.</p>
      </div>
      
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
          <p className="text-sm font-medium text-foreground/60 mb-1">Total Pendapatan</p>
          <p className="text-3xl font-black text-primary">
            Rp {Number(dashboard?.total_revenue || 0).toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-foreground/50 mt-2">Dari {dashboard?.total_orders || 0} pesanan selesai</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
          <p className="text-sm font-medium text-foreground/60 mb-1">Total Pengeluaran</p>
          <p className="text-3xl font-black text-danger">
            Rp {Number(dashboard?.total_expenses || 0).toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-foreground/50 mt-2">Beban operasional & lainnya</p>
        </div>
        
        <div className="bg-primary text-white p-6 rounded-2xl shadow-md">
          <p className="text-sm font-medium text-white/80 mb-1">Laba Bersih</p>
          <p className="text-3xl font-black">
            Rp {Number(dashboard?.net_profit || 0).toLocaleString('id-ID')}
          </p>
          <p className="text-xs text-white/70 mt-2">Pendapatan dikurangi pengeluaran</p>
        </div>
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
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-foreground/50">
                      Belum ada data pengeluaran.
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense: any) => (
                    <tr key={expense.expense_id} className="hover:bg-surface-hover/50 transition-colors text-sm">
                      <td className="px-4 py-3 text-foreground/80">
                        {new Date(expense.date).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-4 py-3 font-medium">{expense.description}</td>
                      <td className="px-4 py-3 text-danger font-bold">
                        Rp {Number(expense.amount).toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs font-semibold text-gray-600">{expense.category}</span>
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
          <ExpenseForm />
        </div>
      </div>
    </div>
  );
}
