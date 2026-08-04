"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/components/CartProvider';

interface ProductProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

export default function ProductCard(product: ProductProps) {
  const { id, name, price, image, category, stock } = product;
  const isOutOfStock = stock <= 0;
  const { addToCart } = useCart();
  
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-surface border border-border shadow-sm hover-lift">
      <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100 relative">
        {/* Placeholder image logic, since we might use data URIs or external URLs */}
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
           {image ? (
              <img src={image} alt={name} className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105" />
           ) : (
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
           )}
        </div>
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
            <span className="bg-danger text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">Habis</span>
          </div>
        )}
      </div>
      
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider">{category}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stock > 5 ? 'bg-success/10 text-success' : stock > 0 ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'}`}>
            Sisa {stock}
          </span>
        </div>
        
        <h3 className="text-sm font-bold text-foreground line-clamp-2 mb-2 leading-tight">
          <Link href={`/produk/${id}`}>
            <span aria-hidden="true" className="absolute inset-0"></span>
            {name}
          </Link>
        </h3>
        
        <div className="mt-auto flex items-center justify-between">
          <p className="text-lg font-black text-foreground">
            Rp {price.toLocaleString('id-ID')}
          </p>
          <button 
            disabled={isOutOfStock}
            onClick={(e) => {
              e.preventDefault(); // Prevent navigating to product detail
              addToCart(product);
            }}
            className="relative z-10 p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="M12 5v14"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
