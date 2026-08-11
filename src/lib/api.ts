import { supabase } from './supabase';

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

export function invalidateCache() {
  // Not required for Supabase, keeping for compatibility
}

export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase.from('produk').select('*');
    if (error) throw error;
    if (data) {
      return data
        .filter((p: any) => p.is_active === true || p.is_active === 'TRUE' || p.is_active === 1 || p.is_active === 'ACTIVE' || p.is_active == null)
        .map((p: any) => ({
          id: p.product_id || p.id,
          name: p.name,
          price: Number(p.price) || 0,
          promo_price: Number(p.promo_price) || 0,
          cost_price: Number(p.cost_price) || 0,
          image: p.image || p.image_url || '',
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

export async function checkout(payload: any) {
  try {
    const { data, error } = await supabase.from('pesanan').insert([payload]);
    if (error) throw error;
    return { success: true, message: 'Pesanan berhasil disimpan' };
  } catch (err) {
    console.error("Error checkout:", err);
    return { success: false, message: 'Gagal menyimpan pesanan' };
  }
}

export async function getOrders(): Promise<any[]> {
  try {
    const { data, error } = await supabase.from('pesanan').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Error fetching orders:", err);
    return [];
  }
}

export async function updateOrderStatus(orderId: string, newStatus: string, adminName: string = 'Admin'): Promise<any> {
  try {
    const { data, error } = await supabase.from('pesanan').update({ status: newStatus }).eq('order_id', orderId);
    if (error) {
      // fallback if primary key is id
      const { error: err2 } = await supabase.from('pesanan').update({ status: newStatus }).eq('id', orderId);
      if (err2) throw err2;
    }
    return { success: true };
  } catch (err) {
    console.error("Error updating order:", err);
    return { success: false };
  }
}

export async function getDashboardData(): Promise<any> {
  try {
    const [orders, products, members, expenses] = await Promise.all([
      supabase.from('pesanan').select('*'),
      supabase.from('produk').select('*'),
      supabase.from('member').select('*'),
      supabase.from('pengeluaran').select('*')
    ]);
    
    const oData = orders.data || [];
    const expData = expenses.data || [];
    const total_sales_month = oData.filter(o => o.status?.toUpperCase() === 'SELESAI').reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    const total_expenses_month = expData.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    
    // Calculate total COGS (Cost of Goods Sold)
    // For simplicity, we just set it to 0 or calculate from orders if they store cogs
    const total_cogs_month = 0; 

    return {
      total_sales_month,
      completed_orders: oData.filter(o => o.status?.toUpperCase() === 'SELESAI').length,
      total_expenses_month,
      total_cogs_month,
      totalOrders: oData.length,
      totalProducts: (products.data || []).length,
      totalMembers: (members.data || []).length,
      recentOrders: oData.slice(0, 5)
    };
  } catch (err) {
    console.error("Error dashboard data:", err);
    return null;
  }
}

export async function getAdminExpenses(): Promise<any[]> {
  try {
    const { data, error } = await supabase.from('pengeluaran').select('*').order('created_at', { ascending: false });
    return data || [];
  } catch (err) {
    return [];
  }
}

export async function saveExpense(expenseData: any, adminName: string = 'Admin'): Promise<any> {
  try {
    const { data, error } = await supabase.from('pengeluaran').insert([{ ...expenseData, admin_name: adminName }]);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

export async function deleteExpense(expenseId: string, adminName: string = 'Admin'): Promise<any> {
  try {
    const { data, error } = await supabase.from('pengeluaran').delete().eq('id', expenseId);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

export async function getAllProductsAdmin(): Promise<any[]> {
  try {
    const { data, error } = await supabase.from('produk').select('*');
    if (error) throw error;
    if (data) {
      return data.map((p: any) => ({
        ...p,
        id: p.product_id || p.id,
        category: p.category_id || p.category,
        image_url: p.image || p.image_url,
        status: (p.is_active === true || p.is_active === 'true' || p.is_active === 'ACTIVE' || p.is_active === 1) ? 'ACTIVE' : 'INACTIVE'
      }));
    }
    return [];
  } catch (err) {
    console.error("Error fetching products admin:", err);
    return [];
  }
}

export async function saveProductAdmin(payload: any): Promise<any> {
  try {
    if (payload.id) {
      const { data, error } = await supabase.from('produk').update(payload).eq('id', payload.id).or(`product_id.eq.${payload.id}`);
      if (error) throw error;
    } else {
      const { data, error } = await supabase.from('produk').insert([payload]);
      if (error) throw error;
    }
    return { success: true };
  } catch (err) {
    console.error("Error saving product:", err);
    return { success: false };
  }
}

export async function deleteProductAdmin(productId: string): Promise<any> {
  try {
    const { error } = await supabase.from('produk').delete().eq('id', productId).or(`product_id.eq.${productId}`);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

export async function getCategories(): Promise<any[]> {
  try {
    const { data, error } = await supabase.from('kategori').select('*');
    if (error) throw error;
    return data || [];
  } catch (err) {
    return [];
  }
}

export async function getBanners(): Promise<any[]> {
  try {
    const { data, error } = await supabase.from('banner').select('*').eq('is_active', true);
    return data || [];
  } catch (error) {
    return [];
  }
}

export async function getAllMembers(): Promise<any[]> {
  try {
    const { data, error } = await supabase.from('member').select('*');
    return data || [];
  } catch (error) {
    return [];
  }
}

export async function saveMember(memberData: any): Promise<any> {
  try {
    const { data, error } = await supabase.from('member').insert([memberData]);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

export async function deleteMember(memberNo: string): Promise<any> {
  try {
    const { error } = await supabase.from('member').delete().eq('member_no', memberNo);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

export async function getSalesReport(startDate: string, endDate: string): Promise<any> {
  try {
    const { data, error } = await supabase.from('pesanan')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate);
    if (error) throw error;
    
    const orders = data || [];
    const total_revenue = orders.filter(o => o.status?.toUpperCase() === 'SELESAI').reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
    
    return { 
      orders,
      total_revenue
    };
  } catch (err) {
    return null;
  }
}

export async function getMemberYearlyReport(year: string | number): Promise<any[]> {
  try {
    const { data: members, error: mErr } = await supabase.from('member').select('*');
    const { data: orders, error: oErr } = await supabase.from('pesanan')
      .select('*')
      .gte('created_at', `${year}-01-01`)
      .lte('created_at', `${year}-12-31T23:59:59`);

    if (mErr || oErr || !members) return [];

    const report = members.map((m: any) => {
      const memStr = String(m.member_no || '').replace(/^CAT-MS/i, '').replace(/^MS/i, '').trim();

      const memberOrders = (orders || []).filter((o: any) => {
        // Jika ada referral_code, belanja masuk ke member pemilik kode tersebut
        if (o.referral_code) {
          const refStr = String(o.referral_code).replace(/^CAT-MS/i, '').replace(/^MS/i, '').trim();
          return refStr === memStr;
        }

        // Jika tidak ada referral, cek apakah customer adalah member ini
        return (o.customer_name && m.name && o.customer_name.toLowerCase() === m.name.toLowerCase()) || 
               (o.customer_phone && m.phone && o.customer_phone === m.phone);
      });

      const monthly = new Array(12).fill(0);
      let total_spend = 0;

      memberOrders.forEach((o: any) => {
        // Only count 'Selesai' orders
        if (o.status && o.status.toUpperCase() !== 'SELESAI') return;
        
        const d = new Date(o.created_at);
        const mIdx = d.getMonth();
        const amt = Number(o.total_amount) || 0;
        monthly[mIdx] += amt;
        total_spend += amt;
      });

      return {
        member_no: m.member_no,
        name: m.name,
        monthly,
        total_spend
      };
    });

    // sort by highest spend
    return report.sort((a, b) => b.total_spend - a.total_spend);
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function saveCategoryAdmin(categoryData: any): Promise<any> {
  try {
    const { data, error } = await supabase.from('kategori').insert([categoryData]);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

export async function deleteCategoryAdmin(categoryId: string): Promise<any> {
  try {
    const { error } = await supabase.from('kategori').delete().eq('category_id', categoryId).or(`id.eq.${categoryId}`);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

export async function getAllBannersAdmin(): Promise<any[]> {
  try {
    const { data, error } = await supabase.from('banner').select('*');
    return data || [];
  } catch (error) {
    return [];
  }
}

export async function saveBanner(bannerData: any): Promise<any> {
  try {
    const { data, error } = await supabase.from('banner').insert([bannerData]);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

export async function deleteBanner(bannerId: string): Promise<any> {
  try {
    const { error } = await supabase.from('banner').delete().eq('id', bannerId);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

export async function toggleBannerStatus(bannerId: string): Promise<any> {
  try {
    const { data: bannerItem } = await supabase.from('banner').select('is_active').eq('id', bannerId).single();
    const { error } = await supabase.from('banner').update({ is_active: !bannerItem?.is_active }).eq('id', bannerId);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

export async function saveSettingBanner(imgUrl: string): Promise<any> {
  try {
    const { error } = await supabase.from('pengaturan_toko').update({ banner_url: imgUrl }).eq('id', 1);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

export async function getSettingBanner(): Promise<any> {
  try {
    const { data, error } = await supabase.from('pengaturan_toko').select('banner_url').eq('id', 1).single();
    return data?.banner_url || '';
  } catch (err) {
    return '';
  }
}

export async function getStoreSettings(): Promise<any> {
  try {
    const { data, error } = await supabase.from('pengaturan_toko').select('*').limit(1).single();
    return data || {};
  } catch (err) {
    return {};
  }
}

export async function saveStoreSettings(settings: any): Promise<any> {
  try {
    const { error } = await supabase.from('pengaturan_toko').upsert([{ id: 1, ...settings }]);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

export async function getPromosAdmin(): Promise<any[]> {
  try {
    const { data, error } = await supabase.from('promo').select('*');
    return data || [];
  } catch (error) {
    return [];
  }
}

export async function savePromo(promoData: any): Promise<any> {
  try {
    const { data, error } = await supabase.from('promo').insert([promoData]);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

export async function deletePromo(promoId: string): Promise<any> {
  try {
    const { error } = await supabase.from('promo').delete().eq('id', promoId);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

export async function togglePromoStatus(promoId: string): Promise<any> {
  try {
    const { data: promoItem } = await supabase.from('promo').select('is_active').eq('id', promoId).single();
    const { error } = await supabase.from('promo').update({ is_active: !promoItem?.is_active }).eq('id', promoId);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

export async function trackOrder(orderId: string): Promise<any> {
  try {
    const { data, error } = await supabase.from('pesanan').select('*').eq('order_id', orderId).single();
    if (error) {
       const { data: d2, error: err2 } = await supabase.from('pesanan').select('*').eq('id', orderId).single();
       if (err2 || !d2) throw err2;
       return { success: true, data: d2 };
    }
    return { success: true, data };
  } catch (err) {
    return { success: false, message: "Pesanan tidak ditemukan" };
  }
}

export async function verifyMember(memberNo: string): Promise<any> {
  try {
    const { data, error } = await supabase.from('member').select('*').eq('member_no', memberNo).single();
    if (error || !data) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, message: "Member tidak ditemukan" };
  }
}

export async function submitPaymentProof(orderId: string, base64Image: string): Promise<any> {
  try {
    const { error } = await supabase.from('pesanan').update({ payment_proof: base64Image, status: 'MENUNGGU VERIFIKASI' }).eq('order_id', orderId);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

// --- Customer Auth API ---

export async function registerCustomer(payload: any) {
  try {
    const { data, error } = await supabase.from('pelanggan').insert([payload]);
    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, message: 'Gagal register' };
  }
}

export async function loginCustomer(payload: any) {
  try {
    const { data, error } = await supabase.from('pelanggan').select('*').eq('email', payload.email).eq('password', payload.password).single();
    if (error || !data) throw error;
    return { success: true, data };
  } catch (err) {
    return { success: false, message: 'Login gagal' };
  }
}

export async function updateCustomerProfile(payload: any) {
  try {
    const { error } = await supabase.from('pelanggan').update(payload).eq('email', payload.email);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}
