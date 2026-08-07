"use client";
import { useEffect, useState } from 'react';
import { getOrders } from "@/lib/api";
import OrderStatusSelect from "./OrderStatusSelect";

function PrintStruk({ order }: { order: any }) {
  function handlePrint() {
    const items = Array.isArray(order.items) ? order.items : [];
    const win = window.open('', '_blank', 'width=400,height=600');
    if (!win) return;
    win.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Struk Pesanan ${order.order_id}</title>
  <style>
    body { font-family: monospace; font-size: 12px; padding: 16px; max-width: 320px; margin: 0 auto; }
    h2 { text-align: center; font-size: 16px; margin: 0 0 4px; }
    .center { text-align: center; }
    .divider { border-top: 1px dashed #000; margin: 8px 0; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 2px 0; }
    .right { text-align: right; }
    .bold { font-weight: bold; }
    .total { font-size: 14px; font-weight: bold; }
    @media print { button { display: none; } }
  </style>
</head>
<body>
  <h2>TOKO KOPANA</h2>
  <p class="center">Koperasi Serba Usaha</p>
  <div class="divider"></div>
  <p>No: <b>${order.order_id}</b></p>
  <p>Tgl: ${new Date(order.date).toLocaleString('id-ID')}</p>
  <p>Pelanggan: ${order.customer_name || '-'}</p>
  <p>No. HP: ${order.customer_phone || '-'}</p>
  <p>Alamat: ${order.customer_address || '-'}</p>
  <p>No. Anggota: ${order.member_no || '-'}</p>
  <div class="divider"></div>
  <table>
    <tr><td class="bold">Produk</td><td class="right bold">Subtotal</td></tr>
    ${items.map((item: any) => `
    <tr>
      <td>${item.name || item.product_name || ''}<br><small>${item.qty || item.quantity || 1} x Rp${Number(item.price).toLocaleString('id-ID')}</small></td>
      <td class="right">Rp${(Number(item.qty || item.quantity || 1) * Number(item.price)).toLocaleString('id-ID')}</td>
    </tr>`).join('')}
  </table>
  <div class="divider"></div>
  <table>
    <tr><td>Subtotal</td><td class="right">Rp${Number(order.subtotal || order.grand_total).toLocaleString('id-ID')}</td></tr>
    ${order.shipping_cost ? `<tr><td>Ongkir</td><td class="right">Rp${Number(order.shipping_cost).toLocaleString('id-ID')}</td></tr>` : ''}
    ${order.discount ? `<tr><td>Diskon</td><td class="right">- Rp${Number(order.discount).toLocaleString('id-ID')}</td></tr>` : ''}
    <tr class="total"><td>TOTAL</td><td class="right">Rp${Number(order.grand_total).toLocaleString('id-ID')}</td></tr>
  </table>
  <div class="divider"></div>
  <p class="center">Status: <b>${order.order_status || 'PENDING'}</b></p>
  <p class="center">Terima kasih telah berbelanja!</p>
  <br/>
  <div class="center"><button onclick="window.print()">🖨️ Print Struk</button></div>
</body>
</html>`);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }

  return (
    <button
      onClick={handlePrint}
      title="Cetak Struk"
      className="p-1.5 rounded-lg bg-gray-100 hover:bg-green-100 hover:text-green-700 text-gray-500 transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
      </svg>
    </button>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  async function loadOrders() {
    setLoading(true);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadOrders(); }, []);

  const filtered = orders.filter(o =>
    !search ||
    (o.order_id || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.customer_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (o.customer_phone || '').toLowerCase().includes(search.toLowerCase())
  );

  const statusColor: Record<string, string> = {
    'Menunggu Pembayaran': 'bg-yellow-100 text-yellow-700',
    'Menunggu Verifikasi': 'bg-yellow-100 text-yellow-700',
    'Telah Dibayar': 'bg-blue-100 text-blue-700',
    'Lunas': 'bg-blue-100 text-blue-700',
    'Sedang Diproses': 'bg-purple-100 text-purple-700',
    'Siap Dikirim': 'bg-indigo-100 text-indigo-700',
    'Dalam Pengiriman': 'bg-indigo-100 text-indigo-700',
    'Selesai': 'bg-green-100 text-green-700',
    'Dibatalkan': 'bg-red-100 text-red-600',
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground">Daftar Pesanan</h1>
          <p className="text-foreground/60 mt-1 text-sm">Kelola dan cetak struk pesanan pelanggan.</p>
        </div>
        <button onClick={loadOrders} disabled={loading} className="bg-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-primary-hover shadow-sm flex items-center gap-2 text-sm disabled:opacity-70">
          {loading ? (
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          )}
          Muat Ulang
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="flex items-center gap-2 bg-white border border-border rounded-xl px-4 py-2.5 shadow-sm max-w-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Cari nama, no. HP, atau ID pesanan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 text-sm bg-transparent focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-hover border-b border-border text-sm font-semibold text-foreground/70">
                <th className="px-4 py-4">ID Pesanan</th>
                <th className="px-4 py-4">Tanggal</th>
                <th className="px-4 py-4">Pelanggan</th>
                <th className="px-4 py-4">Total</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4 text-center">Bukti Bayar</th>
                <th className="px-4 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"/>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-foreground/50">
                    {search ? 'Tidak ada pesanan yang cocok.' : 'Belum ada pesanan masuk.'}
                  </td>
                </tr>
              ) : (
                filtered.map((order: any) => (
                  <tr key={order.order_id} className="hover:bg-surface-hover/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-primary">{order.order_id}</td>
                    <td className="px-4 py-3 text-xs text-foreground/80">
                      {new Date(order.date).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-sm text-foreground">{order.customer_name}</div>
                      <div className="text-xs text-foreground/60">{order.customer_phone}</div>
                    </td>
                    <td className="px-4 py-3 font-bold text-sm">
                      Rp {Number(order.grand_total).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusColor[order.order_status || 'PENDING'] || 'bg-gray-100 text-gray-600'}`}>
                        {order.order_status || 'PENDING'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {order.payment_proof ? (
                        <a href={order.payment_proof} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="Lihat Bukti Transfer">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <OrderStatusSelect orderId={order.order_id} initialStatus={order.order_status || 'PENDING'} />
                        <PrintStruk order={order} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-border text-xs text-gray-400">
            Menampilkan {filtered.length} dari {orders.length} pesanan
          </div>
        )}
      </div>
    </div>
  );
}
