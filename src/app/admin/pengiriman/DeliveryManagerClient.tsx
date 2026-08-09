'use client';

import React, { useState, useEffect } from 'react';
import { getDeliveryRoutesAdmin, bulkAssignCourier, bulkCompleteDelivery } from '@/lib/api';
import toast from 'react-hot-toast';

export default function DeliveryManagerClient() {
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState({ readyToShip: [], shipping: [] });
  const [activeTab, setActiveTab] = useState('ready');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [courierName, setCourierName] = useState('');
  
  const [showManifest, setShowManifest] = useState(false);
  const [manifestCourier, setManifestCourier] = useState('');
  const [manifestOrders, setManifestOrders] = useState<any[]>([]);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const data = await getDeliveryRoutesAdmin();
      setRoutes(data);
    } catch (e) {
      toast.error('Gagal memuat rute');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const handleSelectAllInGroup = (orderIds: string[]) => {
    const allSelected = orderIds.every(id => selectedOrders.includes(id));
    if (allSelected) {
      setSelectedOrders(prev => prev.filter(id => !orderIds.includes(id)));
    } else {
      setSelectedOrders(prev => [...new Set([...prev, ...orderIds])]);
    }
  };

  const handleAssignCourier = async () => {
    if (selectedOrders.length === 0) return toast.error('Pilih pesanan terlebih dahulu');
    if (!courierName.trim()) return toast.error('Masukkan nama kurir');

    const loadToast = toast.loading('Menugaskan kurir...');
    try {
      const res = await bulkAssignCourier(selectedOrders, courierName.trim(), 'Admin');
      if (res.success) {
        toast.success('Berhasil ditugaskan!', { id: loadToast });
        setCourierName('');
        setSelectedOrders([]);
        fetchRoutes();
      } else {
        toast.error(res.message || 'Gagal', { id: loadToast });
      }
    } catch (e) {
      toast.error('Gagal', { id: loadToast });
    }
  };

  const handleCompleteRoute = async (courier: string, ordersToComplete: any[]) => {
    if (!confirm(`Selesaikan semua pengiriman untuk kurir ${courier}?`)) return;
    
    const orderIds = ordersToComplete.map(o => o.order_id);
    const loadToast = toast.loading('Menyelesaikan rute...');
    try {
      const res = await bulkCompleteDelivery(orderIds, 'Admin');
      if (res.success) {
        toast.success('Rute selesai!', { id: loadToast });
        fetchRoutes();
      } else {
        toast.error(res.message || 'Gagal', { id: loadToast });
      }
    } catch (e) {
      toast.error('Gagal', { id: loadToast });
    }
  };

  const openManifest = (courier: string, orders: any[]) => {
    setManifestCourier(courier);
    setManifestOrders(orders);
    setShowManifest(true);
  };

  // Group readyToShip by Village
  const groupedReady = routes.readyToShip.reduce((acc: any, order: any) => {
    const v = order.village || 'Tanpa Desa';
    if (!acc[v]) acc[v] = [];
    acc[v].push(order);
    return acc;
  }, {});

  // Group shipping by Courier Name
  const groupedShipping = routes.shipping.reduce((acc: any, order: any) => {
    const c = order.courier_name || 'Kurir Tidak Diketahui';
    if (!acc[c]) acc[c] = [];
    acc[c].push(order);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Rute Kurir</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola pengiriman dan cetak lembar jalan kurir.</p>
        </div>
        <button onClick={fetchRoutes} className="btn-secondary whitespace-nowrap">
          <i className="fa-solid fa-rotate-right mr-2"></i> Refresh
        </button>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('ready')}
            className={`${activeTab === 'ready' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Perlu Dikirim ({routes.readyToShip.length})
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`${activeTab === 'shipping' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Sedang Dikirim ({routes.shipping.length})
          </button>
        </nav>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : activeTab === 'ready' ? (
        <div className="space-y-6">
          {Object.keys(groupedReady).length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <i className="fa-solid fa-box-open text-4xl text-gray-300 mb-3"></i>
              <p className="text-gray-500">Tidak ada pesanan siap dikirim.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {Object.keys(groupedReady).map(village => {
                  const orders = groupedReady[village];
                  const orderIds = orders.map((o: any) => o.order_id);
                  const allSelected = orderIds.every((id: string) => selectedOrders.includes(id));
                  
                  return (
                    <div key={village} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center cursor-pointer" onClick={() => handleSelectAllInGroup(orderIds)}>
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            checked={allSelected} 
                            onChange={() => {}}
                            className="rounded text-primary-600 focus:ring-primary-500 w-4 h-4 cursor-pointer pointer-events-none"
                          />
                          <h3 className="font-semibold text-gray-900">Desa/Area: {village}</h3>
                          <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">{orders.length} pesanan</span>
                        </div>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {orders.map((order: any) => (
                          <label key={order.order_id} className="p-4 hover:bg-gray-50 flex items-start gap-4 cursor-pointer">
                            <input 
                              type="checkbox"
                              checked={selectedOrders.includes(order.order_id)}
                              onChange={() => handleSelectOrder(order.order_id)}
                              className="mt-1 rounded text-primary-600 focus:ring-primary-500 w-4 h-4 cursor-pointer"
                            />
                            <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium text-gray-900">{order.customer_name}</span>
                                <span className="text-sm font-medium text-gray-700">Rp {parseInt(order.grand_total || 0).toLocaleString('id-ID')}</span>
                              </div>
                              <p className="text-sm text-gray-500">{order.address}, {order.village}, {order.district}</p>
                              <div className="text-xs text-gray-400 mt-1">{order.order_id}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="lg:col-span-1">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 sticky top-6">
                  <h3 className="font-bold text-gray-900 mb-4">Tugaskan Kurir</h3>
                  <div className="mb-4 text-sm text-gray-600">
                    <span className="font-bold text-primary-600">{selectedOrders.length}</span> pesanan dipilih
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kurir</label>
                      <input 
                        type="text" 
                        value={courierName}
                        onChange={e => setCourierName(e.target.value)}
                        placeholder="Contoh: Budi, Anto..."
                        className="input-field"
                      />
                    </div>
                    <button 
                      onClick={handleAssignCourier}
                      disabled={selectedOrders.length === 0 || !courierName.trim()}
                      className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="fa-solid fa-truck-fast mr-2"></i> Mulai Pengiriman
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.keys(groupedShipping).length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <i className="fa-solid fa-truck text-4xl text-gray-300 mb-3"></i>
              <p className="text-gray-500">Tidak ada rute yang sedang berjalan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.keys(groupedShipping).map(courier => {
                const orders = groupedShipping[courier];
                return (
                  <div key={courier} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    <div className="bg-blue-50 px-4 py-3 border-b border-blue-100 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-100 text-blue-600 p-2 rounded-full w-8 h-8 flex items-center justify-center">
                          <i className="fa-solid fa-user-helmet-safety"></i>
                        </div>
                        <h3 className="font-bold text-gray-900">{courier}</h3>
                      </div>
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">{orders.length} pesanan</span>
                    </div>
                    
                    <div className="p-4 flex-1">
                      <div className="text-sm text-gray-600 mb-4 line-clamp-2">
                        <span className="font-semibold text-gray-700">Rute: </span>
                        {Array.from(new Set(orders.map((o: any) => o.village))).join(', ')}
                      </div>
                    </div>
                    
                    <div className="p-4 border-t border-gray-100 bg-gray-50 grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => openManifest(courier, orders)}
                        className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center"
                      >
                        <i className="fa-solid fa-print mr-1"></i> Cetak
                      </button>
                      <button 
                        onClick={() => handleCompleteRoute(courier, orders)}
                        className="bg-green-600 text-white hover:bg-green-700 rounded-lg px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center"
                      >
                        <i className="fa-solid fa-check mr-1"></i> Selesai
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Print Manifest Modal */}
      {showManifest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800">Pratinjau Cetak</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    const printContents = document.getElementById('print-manifest')?.outerHTML;
                    if (printContents) {
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(`
                          <html>
                            <head>
                              <title>Cetak Lembar Jalan</title>
                              <script src="https://cdn.tailwindcss.com"></script>
                              <style>
                                @media print {
                                  @page { margin: 0; }
                                  body { margin: 1.6cm; }
                                }
                              </style>
                            </head>
                            <body class="bg-white">
                              ${printContents}
                              <script>
                                setTimeout(() => {
                                  window.print();
                                  window.close();
                                }, 1500);
                              </script>
                            </body>
                          </html>
                        `);
                        printWindow.document.close();
                        setShowManifest(false);
                      }
                    }
                  }} 
                  className="btn-primary"
                >
                  <i className="fa-solid fa-print mr-2"></i> Cetak
                </button>
                <button onClick={() => setShowManifest(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors">
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-gray-100">
              <div id="print-manifest" className="bg-white p-8 shadow-sm mx-auto w-full max-w-[210mm] min-h-[297mm]">
                <div className="text-center mb-6 border-b-2 border-black pb-4">
                  <h1 className="text-2xl font-bold uppercase tracking-wider mb-1">Daftar Pengiriman Harian</h1>
                  <h2 className="text-lg font-bold">TOKO KOPANA</h2>
                  <div className="text-sm mt-2 flex justify-between">
                    <span>Kurir: <span className="font-bold">{manifestCourier}</span></span>
                    <span>Tanggal: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>

                <table className="w-full text-sm mb-8 border-collapse border border-gray-800">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-800 p-2 w-8 text-center">No</th>
                      <th className="border border-gray-800 p-2 text-left">Pelanggan</th>
                      <th className="border border-gray-800 p-2 text-left">Alamat & Desa</th>
                      <th className="border border-gray-800 p-2 text-right">Tagihan COD</th>
                      <th className="border border-gray-800 p-2 w-16 text-center">Terkirim</th>
                    </tr>
                  </thead>
                  <tbody>
                    {manifestOrders.map((o, idx) => (
                      <tr key={o.order_id}>
                        <td className="border border-gray-800 p-2 text-center align-top">{idx + 1}</td>
                        <td className="border border-gray-800 p-2 align-top">
                          <div className="font-bold">{o.customer_name}</div>
                          <div>{o.whatsapp}</div>
                          <div className="text-xs text-gray-500 mt-1">{o.order_id}</div>
                        </td>
                        <td className="border border-gray-800 p-2 align-top">
                          <div>{o.address}</div>
                          <div className="font-semibold text-gray-700">{o.village}, {o.district}</div>
                        </td>
                        <td className="border border-gray-800 p-2 text-right align-top font-semibold whitespace-nowrap">
                          {o.payment_method === 'COD' ? `Rp ${parseInt(o.grand_total || 0).toLocaleString('id-ID')}` : 'LUNAS (TF)'}
                        </td>
                        <td className="border border-gray-800 p-2 text-center align-middle">
                          <div className="w-5 h-5 border border-black mx-auto"></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-bold">
                      <td colSpan={3} className="border border-gray-800 p-2 text-right">TOTAL COD DIBAWA:</td>
                      <td className="border border-gray-800 p-2 text-right">
                        Rp {manifestOrders.filter(o => o.payment_method === 'COD').reduce((sum, o) => sum + parseInt(o.grand_total || 0), 0).toLocaleString('id-ID')}
                      </td>
                      <td className="border border-gray-800"></td>
                    </tr>
                  </tfoot>
                </table>

                <div className="flex justify-between mt-16 text-center text-sm font-medium px-8">
                  <div>
                    <p className="mb-16">Admin / Petugas</p>
                    <p>( ......................... )</p>
                  </div>
                  <div>
                    <p className="mb-16">Kurir</p>
                    <p>( <span className="underline font-bold px-2">{manifestCourier}</span> )</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
