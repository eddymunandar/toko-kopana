// URL Web App Google Apps Script
// Menggunakan URL deployment terbaru dari Code.js
export const API_URL = "https://script.google.com/macros/s/AKfycbzc3xIKRqsb-P8MNicgtPiNLb2G0PjPfYczzur2JYYFdT1LBuui2Ty_wrtLc1CG9CMH/exec";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  description?: string;
  weight?: number;
}

/**
 * Mengambil daftar produk dari Google Apps Script
 */
export async function getProducts(): Promise<Product[]> {
  try {
    // Tambahkan ?api=true&action=getProducts
    const url = `${API_URL}?api=true&action=getProducts`;
    const res = await fetch(url, { next: { revalidate: 60 } }); // Cache 60 detik
    
    if (!res.ok) throw new Error('Failed to fetch products');
    
    const json = await res.json();
    if (json.success && json.data) {
      // Map data dari GAS ke struktur yang kita butuhkan
      return json.data.map((p: any) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price) || 0,
        image: p.image || '',
        category: p.category || 'Lainnya',
        stock: Number(p.stock) || 0,
        description: p.description || '',
        weight: Number(p.weight) || 1000
      }));
    }
    return [];
  } catch (err) {
    console.error("Error fetching products:", err);
    return [];
  }
}

/**
 * Checkout keranjang belanja
 */
export async function checkout(payload: any) {
  try {
    const url = `${API_URL}?api=true`;
    
    // GAS fetch handling for POST
    // We send form-urlencoded or plain JSON. 
    // Usually Google Apps Script doPost(e) needs postData.contents for JSON.
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'checkout',
        payload: payload
      }),
    });
    
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Checkout error:", err);
    return { success: false, message: 'Gagal menghubungi server' };
  }
}

/**
 * [Admin] Mengambil daftar pesanan
 */
export async function getOrders(): Promise<any[]> {
  try {
    const url = `${API_URL}?api=true&action=getOrdersAdmin`;
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) throw new Error('Failed to fetch orders');
    
    const json = await res.json();
    return json.success && json.data ? json.data : [];
  } catch (err) {
    console.error("Error fetching orders:", err);
    return [];
  }
}

/**
 * [Admin] Update status pesanan
 */
export async function updateOrderStatus(orderId: string, newStatus: string, adminName: string = 'Admin'): Promise<any> {
  try {
    const url = `${API_URL}?api=true`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updateOrderStatus',
        payload: { orderId, newStatus, adminName }
      }),
    });
    
    return await res.json();
  } catch (err) {
}

/**
 * [Admin] Mengambil data dashboard
 */
export async function getDashboardData(): Promise<any> {
  try {
    const url = `${API_URL}?api=true&action=getDashboardData`;
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) throw new Error('Failed to fetch dashboard data');
    
    const json = await res.json();
    return json.success && json.data ? json.data : null;
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    return null;
  }
}

/**
 * [Admin] Mengambil daftar pengeluaran
 */
export async function getAdminExpenses(): Promise<any[]> {
  try {
    const url = `${API_URL}?api=true&action=getAdminExpenses`;
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) throw new Error('Failed to fetch expenses');
    
    const json = await res.json();
    return json.success && json.data ? json.data : [];
  } catch (err) {
    console.error("Error fetching expenses:", err);
    return [];
  }
}

/**
 * [Admin] Menyimpan pengeluaran baru
 */
export async function saveExpense(expenseData: any, adminName: string = 'Admin'): Promise<any> {
  try {
    const url = `${API_URL}?api=true`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'saveExpense',
        payload: { expenseData, adminName }
      }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: 'Gagal menghubungi server' };
  }
}

/**
 * [Admin] Menghapus pengeluaran
 */
export async function deleteExpense(expenseId: string, adminName: string = 'Admin'): Promise<any> {
  try {
    const url = `${API_URL}?api=true`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'deleteExpense',
        payload: { expenseId, adminName }
      }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: 'Gagal menghubungi server' };
  }
}

/**
 * [Admin] Mengambil semua produk termasuk status aktif
 */
export async function getAllProductsAdmin(): Promise<any[]> {
  try {
    const url = `${API_URL}?api=true&action=getAllProductsAdmin`;
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) throw new Error('Failed to fetch products');
    
    const json = await res.json();
    return json.success && json.data ? json.data : [];
  } catch (err) {
    console.error("Error fetching products admin:", err);
    return [];
  }
}

/**
 * [Admin] Menyimpan/Update produk
 */
export async function saveProductAdmin(payload: any): Promise<any> {
  try {
    const url = `${API_URL}?api=true`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'saveProductAdmin',
        payload
      }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: 'Gagal menghubungi server' };
  }
}

/**
 * [Admin] Hapus produk
 */
export async function deleteProductAdmin(productId: string): Promise<any> {
  try {
    const url = `${API_URL}?api=true`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'deleteProductAdmin',
        payload: { productId }
      }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: 'Gagal menghubungi server' };
  }
}
