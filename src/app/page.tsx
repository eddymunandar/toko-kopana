"use client";
import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { getProducts, getCategories, getBanners, Product } from '@/lib/api';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodData, catData, banData] = await Promise.all([
          getProducts(),
          getCategories(),
          getBanners()
        ]);
        setProducts(prodData);
        setCategories(catData);
        setBanners(banData);
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
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });
  
  return (
    <div className="container mx-auto px-4 py-8 mb-20 md:mb-0">
      {/* Search Bar Mobile */}
      <div className="md:hidden mb-6">
        <input 
          type="text" 
          placeholder="Cari produk..." 
          className="w-full px-4 py-3 rounded-full border border-border focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Hero Banners */}
      {banners.length > 0 ? (
        <section className="relative w-full h-[180px] md:h-[400px] rounded-3xl overflow-hidden mb-8 md:mb-12 shadow-xl">
          {banners.map((banner, idx) => (
            <div 
              key={idx} 
              className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentBanner ? 'opacity-100' : 'opacity-0'}`}
            >
              <img src={banner.image_url} alt="Promo Banner" className="w-full h-full object-cover" />
            </div>
          ))}
          {banners.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {banners.map((_, idx) => (
                <div key={idx} className={`h-2 rounded-full transition-all ${idx === currentBanner ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}></div>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="relative w-full h-[280px] md:h-[400px] rounded-3xl overflow-hidden mb-12 flex items-center bg-gradient-to-r from-primary to-primary-hover text-white shadow-xl">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 px-8 md:px-16 max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-md">
              Belanja Kebutuhan Pokok Kualitas Terbaik
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8 font-medium">
              Koperasi Pemuda Muhammadiyah Pamotan melayani dengan jujur dan harga bersahabat.
            </p>
          </div>
        </section>
      )}

      {/* Desktop Search Bar */}
      <div className="hidden md:flex justify-between items-center mb-8">
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
      {!loading && categories.length > 0 && (
        <div className="flex overflow-x-auto gap-3 pb-4 mb-4 md:mb-8 hide-scrollbar">
          <button 
            onClick={() => setActiveCategory('')}
            className={`whitespace-nowrap px-6 py-2 rounded-full font-medium transition-colors ${activeCategory === '' ? 'bg-primary text-white shadow-md' : 'bg-surface text-foreground hover:bg-gray-200 border border-border'}`}
          >
            Semua
          </button>
          {categories.map(cat => (
            <button 
              key={cat.category_id}
              onClick={() => setActiveCategory(cat.category_id)}
              className={`whitespace-nowrap px-6 py-2 rounded-full font-medium transition-colors ${activeCategory === cat.category_id ? 'bg-primary text-white shadow-md' : 'bg-surface text-foreground hover:bg-gray-200 border border-border'}`}
            >
              <i className={`${cat.icon} mr-2 opacity-70`}></i>
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Product Section */}
      <section>
        <h2 className="text-xl md:hidden font-bold tracking-tight text-foreground mb-4">
          {activeCategory === '' ? 'Semua Produk' : categories.find(c => c.category_id === activeCategory)?.name}
        </h2>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-surface rounded-2xl border border-border">
            <p className="text-foreground/60">Tidak ada produk yang ditemukan.</p>
          </div>
        )}
      </section>
    </div>
  );
}
