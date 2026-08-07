"use client";
import { useCart } from '@/components/CartProvider';
import { Product } from '@/lib/api';

interface ProductProps extends Product {
  promo_price?: number;
  onViewDetail?: (product: Product) => void;
}

export default function ProductCard(product: ProductProps) {
  const { id, name, price, image, stock, promo_price, onViewDetail } = product;
  const isOutOfStock = stock <= 0;
  const hasPromo = promo_price && Number(promo_price) > 0 && Number(promo_price) < Number(price);
  const displayPrice = hasPromo ? Number(promo_price) : Number(price);
  const { addToCart } = useCart();
  
  return (
    <div
      className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onViewDetail?.(product)}
    >
      {/* Product Image */}
      <div className="aspect-square w-full overflow-hidden bg-gray-50 relative">
        {image ? (
          <img 
            src={image} 
            alt={name} 
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-200">
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">Habis</span>
          </div>
        )}
        {/* Promo Badge */}
        {hasPromo && !isOutOfStock && (
          <div className="absolute top-2 left-2">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-black shadow-md tracking-wide">
              🏷️ PROMO
            </span>
          </div>
        )}
      </div>
      
      {/* Product Info */}
      <div className="flex flex-1 flex-col p-3">
        {/* Name */}
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-1 leading-snug min-h-[2.5rem]">
          {name}
        </h3>

        {/* Price */}
        <div className="mb-1">
          {hasPromo ? (
            <>
              <p className="text-base font-black text-red-600">
                Rp{Number(promo_price).toLocaleString('id-ID')}
              </p>
              <p className="text-xs text-gray-400 line-through">
                Rp{Number(price).toLocaleString('id-ID')}
              </p>
            </>
          ) : (
            <p className="text-base font-black text-gray-900">
              Rp{Number(price).toLocaleString('id-ID')}
            </p>
          )}
        </div>

        {/* Stock */}
        <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          Stok: {stock}
        </p>

        {/* Add to Cart Button */}
        <button 
          disabled={isOutOfStock}
          onClick={(e) => {
            e.stopPropagation();
            // Pass promo price as effective price to cart
            addToCart({ ...product, price: displayPrice });
          }}
          className="w-full py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"></path>
            <path d="M12 5v14"></path>
          </svg>
          Keranjang
        </button>
      </div>
    </div>
  );
}
