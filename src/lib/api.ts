// URL Web App Google Apps Script
// Menggunakan URL deployment terbaru dari Code.js
export const API_URL = "https://script.google.com/macros/s/AKfycbzWB5N5qjG5BpiJ795KpHUk9r3-CpFtxN9dVrW1_AN3ivnwxQT-OKvQTqE6MkcYR7NU/exec";

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
    console.error("Update order error:", err);
    return { success: false, message: 'Gagal menghubungi server' };
  }
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

/**
 * Mengambil daftar kategori
 */
export async function getCategories(): Promise<any[]> {
  try {
    const url = `${API_URL}?api=true&action=getCategories`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error('Failed to fetch categories');
    
    const json = await res.json();
    return json.success && json.data ? json.data : [];
  } catch (err) {
    console.error("Error fetching categories:", err);
    return [];
  }
}

/**
 * Mengambil daftar banner aktif
 */
export async function getBanners(): Promise<any[]> {
  try {
    const url = `${API_URL}?api=true&action=getBanners`;
    const response = await fetch(url, { cache: 'no-store' });
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Error fetching banners:", error);
    return [];
  }
}

// ---------------- Admin ----------------

export async function getAllMembers(): Promise<any[]> {
  try {
    const url = `${API_URL}?api=true&action=getAllMembers`;
    const response = await fetch(url, { cache: 'no-store' });
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Error fetching all members:", error);
    return [];
  }
}

export async function saveMember(memberData: any): Promise<any> {
  return postData('saveMember', memberData);
}

export async function deleteMember(memberNo: string): Promise<any> {
  return postData('deleteMember', { memberNo });
}

export async function getSalesReport(startDate: string, endDate: string): Promise<any> {
  try {
    const url = `${API_URL}?api=true&action=getSalesReport&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
    const response = await fetch(url, { cache: 'no-store' });
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Error fetching sales report:", error);
    return null;
  }
}

export async function getMemberYearlyReport(year: string | number): Promise<any> {
  try {
    const url = `${API_URL}?api=true&action=getMemberYearlyReport&year=${year}`;
    const response = await fetch(url, { cache: 'no-store' });
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Error fetching member yearly report:", error);
    return null;
  }
}

export async function saveCategoryAdmin(categoryData: any): Promise<any> {
  return postData('saveCategoryAdmin', categoryData);
}

export async function deleteCategoryAdmin(categoryId: string): Promise<any> {
  return postData('deleteCategoryAdmin', { categoryId });
}

export async function getAllBannersAdmin(): Promise<any[]> {
  try {
    const url = `${API_URL}?api=true&action=getAllBannersAdmin`;
    const response = await fetch(url, { cache: 'no-store' });
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Error fetching all banners:", error);
    return [];
  }
}

export async function saveBanner(bannerData: any): Promise<any> {
  return postData('saveBanner', bannerData);
}

export async function deleteBanner(bannerId: string): Promise<any> {
  return postData('deleteBanner', { bannerId });
}

export async function toggleBannerStatus(bannerId: string): Promise<any> {
  return postData('toggleBannerStatus', { bannerId });
}

export async function saveSettingBanner(imgUrl: string): Promise<any> {
  return postData('saveSettingBanner', { imgUrl });
}

export async function getSettingBanner(): Promise<any> {
  try {
    const url = `${API_URL}?api=true&action=getSettingBanner`;
    const response = await fetch(url, { cache: 'no-store' });
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Error fetching setting banner:", error);
    return null;
  }
}

export async function getPromosAdmin(): Promise<any[]> {
  try {
    const url = `${API_URL}?api=true&action=getPromosAdmin`;
    const response = await fetch(url, { cache: 'no-store' });
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Error fetching promos:", error);
    return [];
  }
}

export async function savePromo(promoData: any): Promise<any> {
  return postData('savePromo', promoData);
}

export async function deletePromo(promoId: string): Promise<any> {
  return postData('deletePromo', { promoId });
}

export async function togglePromoStatus(promoId: string): Promise<any> {
  return postData('togglePromoStatus', { promoId });
}

/**
 * Melacak status pesanan
 */
export async function trackOrder(orderId: string): Promise<any> {
  try {
    const url = `${API_URL}?api=true&action=trackOrder&orderId=${orderId}`;
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) throw new Error('Failed to track order');
    
    const json = await res.json();
    return json;
  } catch (err) {
    console.error("Error tracking order:", err);
    return { success: false, message: "Terjadi kesalahan jaringan" };
  }
}

/**
 * Verifikasi Member
 */
export async function verifyMember(memberNo: string): Promise<any> {
  try {
    const url = `${API_URL}?api=true&action=verifyMember&memberNo=${memberNo}`;
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) throw new Error('Failed to verify member');
    
    const json = await res.json();
    return json;
  } catch (err) {
    console.error("Error verifying member:", err);
    return { success: false, message: "Terjadi kesalahan jaringan" };
  }
}

/**
 * Upload Bukti Pembayaran
 */
export async function submitPaymentProof(orderId: string, base64Image: string): Promise<any> {
  try {
    const url = `${API_URL}?api=true`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'submitPaymentProof',
        payload: { orderId, imageUrl: base64Image } // we use base64Image as imageUrl to pass to backend script
      }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: 'Gagal menghubungi server' };
  }
}
