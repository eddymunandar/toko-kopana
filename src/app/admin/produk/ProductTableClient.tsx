"use client";

import { useState, useEffect } from "react";
import { saveProductAdmin, deleteProductAdmin } from "@/lib/api";
import Image from "next/image";

export default function ProductTableClient({ initialProducts, loading }: { initialProducts: any[], loading?: boolean }) {
  const [products, setProducts] = useState(initialProducts);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);


  const handleToggleStatus = async (product: any) => {
    setLoadingId(product.id);
    const newStatus = product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    
    try {
      const res = await saveProductAdmin({
        ...product,
        status: newStatus
      });
      
      if (res.success) {
        setProducts(products.map(p => p.id === product.id ? { ...p, status: newStatus } : p));
      } else {
        alert("Gagal update status: " + res.message);
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;
    
    setLoadingId(id);
    try {
      const res = await deleteProductAdmin(id);
      if (res.success) {
        setProducts(products.filter(p => p.id !== id));
      } else {
        alert("Gagal menghapus produk: " + res.message);
      }
    } catch (err) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-hover border-b border-border text-sm font-semibold text-foreground/70">
            <th className="px-6 py-4 rounded-tl-xl">Produk</th>
            <th className="px-6 py-4">Kategori</th>
            <th className="px-6 py-4">Harga</th>
            <th className="px-6 py-4">Stok</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 rounded-tr-xl">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center">
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </td>
            </tr>
          ) : products.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-foreground/50">
                Belum ada produk.
              </td>
            </tr>
          ) : (
            products.map((product: any) => (
              <tr key={product.id} className="hover:bg-surface-hover/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 relative rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <Image 
                        src={product.image_url || '/placeholder.jpg'} 
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-bold text-foreground line-clamp-1">{product.name}</div>
                      <div className="text-xs text-foreground/50 font-mono mt-0.5">{product.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-foreground/80">
                  {product.category}
                </td>
                <td className="px-6 py-4 font-bold text-primary">
                  Rp {Number(product.price).toLocaleString('id-ID')}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    product.stock > 10 ? 'bg-success/10 text-success' : 
                    product.stock > 0 ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'
                  }`}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => handleToggleStatus(product)}
                    disabled={loadingId === product.id}
                    className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${
                      product.status === 'ACTIVE' 
                        ? 'bg-success/10 text-success hover:bg-success/20' 
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    } ${loadingId === product.id ? 'opacity-50 cursor-wait' : ''}`}
                  >
                    {product.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => handleDelete(product.id)}
                    disabled={loadingId === product.id}
                    className="text-danger hover:bg-danger/10 p-2 rounded-lg transition-colors"
                    title="Hapus Produk"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
