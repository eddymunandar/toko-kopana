"use client";
import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import ProductModal from '@/components/ProductModal';
import { getProducts, getCategories, getBanners, Product } from '@/lib/api';

// Skeleton for product cards
function ProductSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-border overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-3">
        <div className="h-3 bg-gray-200 rounded mb-2 w-3/4" />
        <div className="h-3 bg-gray-200 rounded mb-3 w-1/2" />
        <div className="h-5 bg-gray-200 rounded mb-3 w-2/5" />
        <div className="h-8 bg-gray-200 rounded-xl w-full" />
      </div>
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentBanner, setCurrentBanner] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        getBanners().then(banData => {
          const sorted = [...banData].sort((a, b) => {
            const aPromo = a.is_promo === true || a.is_promo === 'true' || a.is_promo === 'TRUE' || a.status === 'ON';
            const bPromo = b.is_promo === true || b.is_promo === 'true' || b.is_promo === 'TRUE' || b.status === 'ON';
            return (bPromo ? 1 : 0) - (aPromo ? 1 : 0);
          });
          setBanners(sorted);
        });
        getCategories().then(catData => setCategories(catData));
        const prodData = await getProducts();
        setProducts(prodData);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const filteredProducts = products.filter(p => {
    const matchCat = activeCategory === '' || p.category === activeCategory;
    const matchSearch = (p.name || '').toLowerCase().includes((searchQuery || '').toLowerCase());
    return matchCat && matchSearch;
  });
  
  return (
    <div className="container mx-auto px-0 md:px-4 pt-0 pb-8 md:py-8 mb-20 md:mb-0">

      {/* Hero Banners */}
      {banners.length > 0 ? (
        <section className="relative w-full aspect-[2.5/1] md:aspect-[3/1] bg-white overflow-hidden rounded-none md:rounded-3xl mb-6 md:mb-12 shadow-md">
          {banners.map((banner, idx) => (
            <div 
              key={idx} 
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${idx === currentBanner ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <img src={banner.image_url} alt="Banner" className="w-full h-full object-cover object-center" />
            </div>
          ))}
          {banners.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 z-20">
              {banners.map((_, idx) => (
                <button key={idx} onClick={() => setCurrentBanner(idx)}
                  className={`h-2 rounded-full transition-all ${idx === currentBanner ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
                />
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="relative w-full aspect-[2.5/1] md:aspect-[3/1] bg-primary/10 overflow-hidden rounded-none md:rounded-3xl mb-6 md:mb-12 animate-pulse" />
      )}

      {/* Search Bar Mobile */}
      <div id="katalog-mobile" className="md:hidden px-3 mt-2 mb-4 scroll-mt-24">
        <div className="flex items-center gap-2 bg-white border border-border rounded-full px-4 py-2.5 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input 
            type="text" 
            placeholder="Cari produk..." 
            className="flex-1 bg-transparent text-sm focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Desktop Search Bar */}
      <div id="katalog" className="hidden md:flex justify-between items-center mb-8 scroll-mt-24">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Katalog Produk</h2>
        <div className="w-72">
          <input 
            type="text" 
            placeholder="Cari produk..." 
            className="w-full px-4 py-2 rounded-full border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-3 md:px-0">
        {categories.length > 0 && (
          <div className="flex overflow-x-auto gap-2 pb-3 mb-4 md:mb-8 hide-scrollbar">
            <button 
              onClick={() => setActiveCategory('')}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-colors ${activeCategory === '' ? 'bg-primary text-white shadow-md' : 'bg-white text-foreground hover:bg-gray-100 border border-border'}`}
            >
              Semua
            </button>
            {categories.map(cat => (
              <button 
                key={cat.category_id}
                onClick={() => setActiveCategory(cat.category_id)}
                className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-bold transition-colors ${activeCategory === cat.category_id ? 'bg-primary text-white shadow-md' : 'bg-white text-foreground hover:bg-gray-100 border border-border'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Product Section */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3 md:hidden">
            {activeCategory === '' ? 'Semua Produk' : categories.find(c => c.category_id === activeCategory)?.name || 'Produk'}
          </h2>
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {Array.from({length: 6}).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  {...product}
                  onViewDetail={setSelectedProduct}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-surface rounded-2xl border border-border">
              <p className="text-foreground/60">Tidak ada produk yang ditemukan.</p>
            </div>
          )}
        </section>
      </div>

      {/* Product Detail Modal */}
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
}
