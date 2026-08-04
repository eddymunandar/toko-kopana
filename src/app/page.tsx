import ProductCard from '@/components/ProductCard';
import { getProducts } from '@/lib/api';

export default async function Home() {
  const products = await getProducts();
  
  // Filter 8 produk teratas untuk unggulan
  const featuredProducts = products.slice(0, 8);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Banner Area */}
      <section className="relative w-full h-[280px] md:h-[400px] rounded-3xl overflow-hidden mb-12 flex items-center bg-gradient-to-r from-primary to-primary-hover text-white shadow-xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 px-8 md:px-16 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-md">
            Belanja Kebutuhan Pokok Kualitas Terbaik
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-8 font-medium">
            Koperasi Pemuda Muhammadiyah Pamotan melayani dengan jujur dan harga bersahabat.
          </p>
          <button className="bg-white text-primary font-bold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors shadow-lg hover-lift">
            Belanja Sekarang
          </button>
        </div>
      </section>

      {/* Product Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Produk Unggulan</h2>
          <button className="text-sm font-semibold text-primary hover:text-primary-hover flex items-center gap-1">
            Lihat Semua 
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </button>
        </div>
        
        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-surface rounded-2xl border border-border">
            <p className="text-foreground/60">Belum ada produk yang tersedia.</p>
          </div>
        )}
      </section>
    </div>
  );
}
