"use client";
import { useEffect } from 'react';
import { useCart } from '@/components/CartProvider';
import { Product } from '@/lib/api';

interface Props {
  product: Product | null;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: Props) {
  const { addToCart } = useCart();

  // Close on escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (product) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [product]);

  if (!product) return null;

  const isOutOfStock = product.stock <= 0;
  const hasPromo = product.promo_price && Number(product.promo_price) > 0 && Number(product.promo_price) < product.price;
  const displayPrice = hasPromo ? Number(product.promo_price) : product.price;

  function handleBuy() {
    if (!product || isOutOfStock) return;
    addToCart(product);
    onClose();
    // Navigate to cart
    window.location.href = '/keranjang';
  }

  function handleAddCart() {
    if (!product || isOutOfStock) return;
    addToCart(product);
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal - slides up from bottom on mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:inset-0 md:flex md:items-center md:justify-center md:p-4">
        <div className="bg-white rounded-t-3xl md:rounded-3xl shadow-2xl w-full md:max-w-lg md:max-h-[90vh] overflow-y-auto animate-slide-up">
          {/* Handle bar (mobile) */}
          <div className="flex justify-center pt-3 pb-1 md:hidden">
            <div className="w-10 h-1 rounded-full bg-gray-200" />
          </div>

          {/* Close button */}
          <div className="flex justify-end px-4 pt-2 md:pt-4">
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          {/* Product Image */}
          <div className="px-4 pb-4">
            <div className="aspect-square w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 relative">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200">
                  <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-2xl">
                  <span className="bg-red-500 text-white px-5 py-2 rounded-full font-bold">Stok Habis</span>
                </div>
              )}
              {hasPromo && !isOutOfStock && (
                <div className="absolute top-3 left-3">
                  <span className="bg-red-500 text-white px-4 py-1.5 rounded-full text-sm font-black shadow-md tracking-wide">
                    🏷️ PROMO
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="mt-4">
              <h2 className="text-xl font-black text-gray-900 mb-1 leading-tight">{product.name}</h2>
              {hasPromo ? (
                <div className="mb-3">
                  <p className="text-sm text-gray-400 line-through font-bold">Rp{product.price.toLocaleString('id-ID')}</p>
                  <p className="text-2xl font-black text-red-600">Rp{displayPrice.toLocaleString('id-ID')}</p>
                </div>
              ) : (
                <p className="text-2xl font-black text-primary mb-3">Rp{product.price.toLocaleString('id-ID')}</p>
              )}

              {/* Stock */}
              <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full mb-4 ${
                product.stock > 10 ? 'bg-green-100 text-green-700' :
                product.stock > 0  ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-600'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Stok: {product.stock} {product.stock > 0 ? 'tersedia' : '(habis)'}
              </span>

              {/* Description */}
              {product.description && (
                <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
                  <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Weight */}
              {product.weight && product.weight > 0 && (
                <p className="text-xs text-gray-400 mb-4">
                  Berat: {product.weight >= 1000 ? `${product.weight/1000} kg` : `${product.weight} gram`}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-2 pb-2">
                <button
                  onClick={handleAddCart}
                  disabled={isOutOfStock}
                  className="flex-1 py-3 rounded-2xl font-bold text-sm border-2 border-primary text-primary hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  Keranjang
                </button>
                <button
                  onClick={handleBuy}
                  disabled={isOutOfStock}
                  className="flex-1 py-3 rounded-2xl font-bold text-sm bg-primary text-white hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                  Beli Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
