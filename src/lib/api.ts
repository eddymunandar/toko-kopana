// URL Web App Google Apps Script
// Menggunakan URL deployment terbaru dari Code.js
export const API_URL = "https://script.google.com/macros/s/AKfycbzWB5N5qjG5BpiJ795KpHUk9r3-CpFtxN9dVrW1_AN3ivnwxQT-OKvQTqE6MkcYR7NU/exec";

export interface Product {
  id: string;
  name: string;
  price: number;
  promo_price?: number;
  cost_price?: number;
  image: string;
  category: string;
  stock: number;
  description?: string;
  weight?: number;
}

const cache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 60 seconds

export function invalidateCache() {
  cache.clear();
}

async function fetchWithCache(url: string, forceRefresh = false): Promise<any> {
  const now = Date.now();
  if (!forceRefresh && cache.has(url)) {
    const cached = cache.get(url)!;
    if (now - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }
  
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  const json = await res.json();
  
  cache.set(url, { data: json, timestamp: now });
  return json;
}

/**
 * Helper function for POST requests to Google Apps Script
 * Menggunakan text/plain agar tidak memicu preflight (CORS OPTIONS) yang tidak didukung GAS
 */
async function postData(action: string, payload: any = {}): Promise<any> {
  try {
    const url = `${API_URL}?api=true`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action,
        payload
      }),
    });
    const result = await res.json();
    if (result && result.success !== false) {
      invalidateCache(); // Clear cache on successful mutation
    }
    return result;
  } catch (err) {
    console.error(`Error in postData (${action}):`, err);
    return { success: false, message: 'Gagal menghubungi server' };
  }
}

/**
 * Mengambil daftar produk dari Google Apps Script
 */
export async function getProducts(): Promise<Product[]> {
  try {
    const url = `${API_URL}?api=true&action=getProducts`;
    const json = await fetchWithCache(url);
    
    if (json.success && json.data) {
      // Map data dari GAS ke struktur yang kita butuhkan
      return json.data.map((p: any) => ({
        id: p.product_id || p.id,
        name: p.name,
        price: Number(p.price) || 0,
        promo_price: Number(p.promo_price) || 0,
        cost_price: Number(p.cost_price) || 0,
        image: p.image || '',
        category: p.category_id || p.category || 'Lainnya',
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
  return postData('saveOrder', payload);
}

/**
 * [Admin] Mengambil daftar pesanan
 */
export async function getOrders(): Promise<any[]> {
  try {
    const url = `${API_URL}?api=true&action=getOrdersAdmin`;
    const json = await fetchWithCache(url);
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
  return postData('updateOrderStatus', { orderId, newStatus, adminName });
}

/**
 * [Admin] Mengambil data dashboard
 */
export async function getDashboardData(): Promise<any> {
  try {
    const url = `${API_URL}?api=true&action=getDashboardData`;
    const json = await fetchWithCache(url);
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
    const json = await fetchWithCache(url);
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
  return postData('saveExpense', { expenseData, adminName });
}

/**
 * [Admin] Menghapus pengeluaran
 */
export async function deleteExpense(expenseId: string, adminName: string = 'Admin'): Promise<any> {
  return postData('deleteExpense', { expenseId, adminName });
}

/**
 * [Admin] Mengambil semua produk termasuk status aktif
 */
export async function getAllProductsAdmin(): Promise<any[]> {
  try {
    const url = `${API_URL}?api=true&action=getAllProductsAdmin`;
    const json = await fetchWithCache(url);
    
    if (json.success && json.data) {
      return json.data.map((p: any) => ({
        ...p,
        id: p.product_id,
        category: p.category_id,
        image_url: p.image,
        status: (p.is_active === true || p.is_active === 'true' || p.is_active === 'TRUE' || p.is_active === 1) ? 'ACTIVE' : 'INACTIVE'
      }));
    }
    return [];
  } catch (err) {
    console.error("Error fetching products admin:", err);
    return [];
  }
}

/**
 * [Admin] Menyimpan/Update produk
 */
export async function saveProductAdmin(payload: any): Promise<any> {
  return postData('saveProductAdmin', payload);
}

/**
 * [Admin] Hapus produk
 */
export async function deleteProductAdmin(productId: string): Promise<any> {
  return postData('deleteProductAdmin', { productId });
}

/**
 * Mengambil daftar kategori
 */
export async function getCategories(): Promise<any[]> {
  try {
    const url = `${API_URL}?api=true&action=getCategories`;
    const json = await fetchWithCache(url);
    
    if (json.success && json.data) {
      return json.data.map((c: any) => {
        // Fix for broken sheet headers where description was mapped to icon, and icon to ''
        if (c[''] && typeof c[''] === 'string' && (c[''].startsWith('fa-') || c[''].includes('fa'))) {
          return {
            category_id: c.category_id,
            name: c.name,
            description: c.icon,
            icon: c['']
          };
        }
        return c;
      });
    }
    return [];
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
    const data = await fetchWithCache(url);
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
    const data = await fetchWithCache(url);
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
    const data = await fetchWithCache(url);
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Error fetching sales report:", error);
    return null;
  }
}

export async function getMemberYearlyReport(year: string | number): Promise<any> {
  try {
    const url = `${API_URL}?api=true&action=getMemberYearlyReport&year=${year}`;
    const data = await fetchWithCache(url);
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
    const data = await fetchWithCache(url);
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
    const json = await fetchWithCache(url);
    if (json.success) return json.data;
    return '';
  } catch (err) {
    return '';
  }
}

export async function getStoreSettings(): Promise<any> {
  try {
    const url = `${API_URL}?api=true&action=getStoreSettings`;
    const json = await fetchWithCache(url, true); // forceRefresh to get latest settings
    if (json.success) return json.data;
    return {};
  } catch (err) {
    return {};
  }
}

export async function saveStoreSettings(settings: any): Promise<any> {
  return postData('saveStoreSettings', settings);
}

export async function getPromosAdmin(): Promise<any[]> {
  try {
    const url = `${API_URL}?api=true&action=getPromosAdmin`;
    const data = await fetchWithCache(url);
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
    const json = await fetchWithCache(url, true); // Don't cache trackOrder as it might need real-time status
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
    const json = await fetchWithCache(url);
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
  return postData('submitPaymentProof', { orderId, imageUrl: base64Image });
}
