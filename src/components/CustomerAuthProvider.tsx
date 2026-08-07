"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CustomerData {
  account_id: string;
  phone: string;
  name: string;
  role: string;
  member_no: string;
  address: string;
  district: string;
  village: string;
  city: string;
}

interface CustomerAuthContextType {
  customer: CustomerData | null;
  login: (data: CustomerData) => void;
  logout: () => void;
  updateProfile: (data: Partial<CustomerData>) => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("kopana_customer");
    if (stored) {
      try {
        setCustomer(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem("kopana_customer");
      }
    }
  }, []);

  const login = (data: CustomerData) => {
    setCustomer(data);
    localStorage.setItem("kopana_customer", JSON.stringify(data));
  };

  const logout = () => {
    setCustomer(null);
    localStorage.removeItem("kopana_customer");
  };

  const updateProfile = (data: Partial<CustomerData>) => {
    if (customer) {
      const updated = { ...customer, ...data };
      setCustomer(updated);
      localStorage.setItem("kopana_customer", JSON.stringify(updated));
    }
  };

  if (!mounted) return <>{children}</>; // Provide children instead of null to prevent hydration mismatch for non-auth components

  return (
    <CustomerAuthContext.Provider value={{ customer, login, logout, updateProfile }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  }
  return context;
}
