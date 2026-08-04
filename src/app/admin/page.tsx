import { getOrders } from "@/lib/api";
import OrderStatusSelect from "./OrderStatusSelect";

export const revalidate = 0; // Disable cache for admin panel

export default async function AdminOrdersPage() {
  const orders = await getOrders();
  
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-foreground">Daftar Pesanan</h1>
          <p className="text-foreground/60 mt-1">Kelola pesanan masuk dari pelanggan Anda.</p>
        </div>
        <button className="bg-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-primary-hover shadow-sm">
          Muat Ulang
        </button>
      </div>
      
      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-hover border-b border-border text-sm font-semibold text-foreground/70">
                <th className="px-6 py-4">ID Pesanan</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Pelanggan</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-foreground/50">
                    Belum ada pesanan masuk.
                  </td>
                </tr>
              ) : (
                orders.map((order: any) => (
                  <tr key={order.order_id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm font-bold text-primary">
                      {order.order_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground/80">
                      {new Date(order.date).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">{order.customer_name}</div>
                      <div className="text-xs text-foreground/60">{order.customer_phone}</div>
                    </td>
                    <td className="px-6 py-4 font-bold">
                      Rp {Number(order.grand_total).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <OrderStatusSelect 
                        orderId={order.order_id} 
                        initialStatus={order.order_status || 'PENDING'} 
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
