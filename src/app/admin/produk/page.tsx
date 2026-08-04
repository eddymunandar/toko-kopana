import { getAllProductsAdmin } from "@/lib/api";
import ProductTableClient from "./ProductTableClient";

export const revalidate = 0; // Disable cache for admin panel

export default async function AdminProductsPage() {
  const products = await getAllProductsAdmin();
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground">Katalog Produk</h1>
          <p className="text-foreground/60 mt-1">Kelola inventaris dan stok barang dagangan.</p>
        </div>
        {/* We can add a create button here in the future if needed, handled by client component */}
      </div>
      
      <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm p-1">
        <ProductTableClient initialProducts={products} />
      </div>
    </div>
  );
}
