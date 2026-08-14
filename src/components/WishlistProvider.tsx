"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useCustomerAuth } from './CustomerAuthProvider';

interface WishlistProviderProps {
  children: React.ReactNode;
}

interface WishlistContextType {
  wishlist: string[]; // array of product IDs
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: WishlistProviderProps) {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const { customer } = useCustomerAuth();

  // Load wishlist from local storage when customer logs in or mounts
  useEffect(() => {
    if (customer) {
      const stored = localStorage.getItem(`kopana_wishlist_${customer.account_id}`);
      if (stored) {
        try {
          setWishlist(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse wishlist");
        }
      } else {
        setWishlist([]);
      }
    } else {
      setWishlist([]);
    }
  }, [customer]);

  const saveWishlist = (newList: string[]) => {
    setWishlist(newList);
    if (customer) {
      localStorage.setItem(`kopana_wishlist_${customer.account_id}`, JSON.stringify(newList));
    }
  };

  const addToWishlist = (productId: string) => {
    if (!wishlist.includes(productId)) {
      saveWishlist([...wishlist, productId]);
    }
  };

  const removeFromWishlist = (productId: string) => {
    saveWishlist(wishlist.filter(id => id !== productId));
  };

  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId);
  };

  const clearWishlist = () => {
    saveWishlist([]);
  };

  return (
    <WishlistContext.Provider value={{
      wishlist,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      clearWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
