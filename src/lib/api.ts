import { supabase } from './supabase';

export const API_URL = ""; // Tidak lagi digunakan (digantikan Supabase)
export const ADMIN_API_KEY = ""; // Tidak lagi digunakan

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

// Cache invalidation (tidak dibutuhkan lagi di Supabase, tapi dipertahankan agar tidak error di komponen lain)
export function invalidateCache() {}

/**
 * Mengambil daftar produk
 */
export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('produk')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
      
    if (error || !data) return [];
    
    return data.map(p => ({
      id: p.id,
      name: p.name,
      price: Number(p.price) || 0,
      promo_price: Number(p.promo_price) || 0,
      cost_price: Number(p.cost_price) || 0,
      image: p.image_url || '',
      category: p.category_id || 'Lainnya',
      stock: Number(p.stock) || 0,
      description: p.description || '',
      weight: Number(p.weight) || 1000
    }));
  } catch (err) {
    console.error("Error fetching products:", err);
    return [];
  }
}

/**
 * Mengambil detail produk berdasarkan array ID
 */
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids || ids.length === 0) return [];
  
  try {
    const { data, error } = await supabase
      .from('produk')
      .select('*')
      .in('id', ids)
      .eq('is_active', true);
      
    if (error || !data) return [];
    
    return data.map(p => ({
      id: p.id,
      name: p.name,
      price: Number(p.price) || 0,
      promo_price: Number(p.promo_price) || 0,
      cost_price: Number(p.cost_price) || 0,
      image: p.image_url || '',
      category: p.category_id || 'Lainnya',
      stock: Number(p.stock) || 0,
      description: p.description || '',
      weight: Number(p.weight) || 1000
    }));
  } catch (err) {
    console.error("Error fetching products by ids:", err);
    return [];
  }
}

/**
 * Checkout keranjang belanja
 */
export async function checkout(payload: any) {
  try {
    const phone = payload.whatsapp || payload.customer_phone;
    
    // Pastikan pelanggan ada di tabel pelanggan
    const { data: customerData } = await supabase
      .from('pelanggan')
      .select('phone')
      .eq('phone', phone)
      .single();

    if (!customerData && phone) {
      await supabase.from('pelanggan').insert({
        phone: phone,
        name: payload.name || payload.customer_name || 'Pelanggan Baru',
        address: payload.address || payload.shipping_address || ''
      });
    }

    // Fetch latest order ID to generate a sequential number (ORD-00001)
    let newOrderId = 'ORD-00001';
    const { data: latestOrder } = await supabase
      .from('pesanan')
      .select('order_id')
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (latestOrder && latestOrder.length > 0 && latestOrder[0].order_id) {
      const lastId = latestOrder[0].order_id;
      const parts = lastId.split('-');
      if (parts.length > 1) {
        // Find the last numeric part in case of different formats
        const numStr = parts[parts.length - 1];
        const numPart = parseInt(numStr, 10);
        if (!isNaN(numPart)) {
          newOrderId = `ORD-${String(numPart + 1).padStart(5, '0')}`;
        }
      }
    }

    const finalOrderId = payload.orderId || newOrderId;
    
    // Gabungkan alamat lengkap, desa, kecamatan, kota
    const addressParts = [
      payload.address || payload.customer?.address || payload.shipping_address,
      payload.village || payload.customer?.village,
      payload.district || payload.customer?.district,
      payload.city || payload.customer?.city
    ].filter(Boolean);
    const fullAddress = addressParts.join(', ');

    const { error } = await supabase.from('pesanan').insert({
      order_id: finalOrderId,
      customer_phone: phone,
      customer_name: payload.customer_name || payload.customer?.name,
      items: payload.items || payload.cart || [],
      total_amount: payload.total || payload.total_amount || payload.summary?.grand_total || 0,
      shipping_address: fullAddress,
      shipping_cost: payload.shippingCost || payload.summary?.shipping_fee || 0,
      courier: payload.courier,
      referral_code: payload.referral_code || payload.influencer_no || payload.member_no || null,
      dropship_name: payload.is_dropship ? (payload.customer_name || payload.customer?.name) : null,
      dropship_phone: payload.is_dropship ? phone : null,
      promo_code: payload.promo_code || null,
      promo_discount: payload.promo_discount || 0
    });

    if (error) throw error;

    const shippingCost = payload.shippingCost || payload.summary?.shipping_fee || 0;
    if (shippingCost > 0) {
      await supabase.from('pengeluaran').insert({
        id: `EXP-${Date.now()}`,
        amount: shippingCost,
        description: `Ongkos Kirim Pesanan ${finalOrderId}`,
        admin_name: 'Sistem'
      });
    }

    return { success: true, message: 'Pesanan berhasil dibuat!', order_id: finalOrderId };
  } catch (err: any) {
    console.error("Checkout error:", err);
    return { success: false, message: err.message || 'Gagal membuat pesanan' };
  }
}

/**
 * [Admin] Mengambil daftar pesanan
 */
export async function getOrders(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('pesanan')
      .select(`*`)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map(mapOrderData);
  } catch (err) {
    console.error("Error fetching orders:", err);
    return [];
  }
}

/**
 * [Client] Mengambil riwayat pesanan berdasarkan nomor telepon pelanggan
 */
export async function getCustomerOrders(phone: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('pesanan')
      .select('*')
      .eq('customer_phone', phone)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data.map(mapOrderData);
  } catch (err) {
    console.error("Error fetching customer orders:", err);
    return [];
  }
}

/**
 * [Admin] Update status pesanan
 */
export async function updateOrderStatus(orderId: string, newStatus: string, adminName: string = 'Admin'): Promise<any> {
  // Get customer phone before updating
  const { data: order } = await supabase.from('pesanan').select('customer_phone').eq('order_id', orderId).single();
  
  const { error } = await supabase
    .from('pesanan')
    .update({ status: newStatus })
    .eq('order_id', orderId);
    
  if (!error && order?.customer_phone) {
    await createNotification(
      order.customer_phone,
      `Status Pesanan ${orderId} Diperbarui`,
      `Status pesanan Anda sekarang adalah: ${newStatus}`,
      orderId
    );
  }
    
  return error ? { success: false, message: error.message } : { success: true };
}

// === NOTIFICATIONS API ===
export async function createNotification(customerPhone: string, title: string, message: string, orderId?: string) {
  const { error } = await supabase.from('notifikasi').insert({
    id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    customer_phone: customerPhone,
    title,
    message,
    order_id: orderId,
    is_read: false
  });
  return !error;
}

export async function getNotifications(customerPhone: string) {
  const { data } = await supabase
    .from('notifikasi')
    .select('*')
    .eq('customer_phone', customerPhone)
    .order('created_at', { ascending: false });
  return data || [];
}

export async function markNotificationAsRead(id: string) {
  const { error } = await supabase.from('notifikasi').update({ is_read: true }).eq('id', id);
  return !error;
}
// === END NOTIFICATIONS API ===

/**
 * [Admin] Mengambil data dashboard
 */
export async function getDashboardData(): Promise<any> {
  try {
    const { data: orders } = await supabase.from('pesanan').select('total_amount, status, created_at, customer_phone, order_id, customer_name, shipping_address, shipping_cost, items, payment_proof, dropship_name, dropship_phone, referral_code');
    const totalSales = orders?.filter(o => o.status !== 'Batal').reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
    
    // Sort orders manually since we didn't order in the query above
    const sortedOrders = (orders || []).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const recentOrders = sortedOrders.slice(0, 5).map(mapOrderData);
    
    return { 
      totalSales, 
      totalOrders: orders?.length || 0, 
      recentOrders
    };
  } catch (err) {
    return { totalSales: 0, totalOrders: 0, recentOrders: [] };
  }
}

export async function getAdminExpenses(): Promise<any[]> {
  const { data } = await supabase.from('pengeluaran').select('*').order('created_at', { ascending: false });
  return data || [];
}

export async function saveExpense(expenseData: any, adminName: string = 'Admin'): Promise<any> {
  const { error } = await supabase.from('pengeluaran').insert({
    id: `EXP-${Date.now()}`,
    amount: expenseData.amount,
    description: expenseData.description,
    admin_name: adminName
  });
  return error ? { success: false } : { success: true };
}

export async function deleteExpense(expenseId: string, adminName: string = 'Admin'): Promise<any> {
  const { error } = await supabase.from('pengeluaran').delete().eq('id', expenseId);
  return error ? { success: false } : { success: true };
}

export async function getDeliveryRoutesAdmin(): Promise<any> {
  const { data } = await supabase.from('pesanan').select('*').in('status', ['Siap Dikirim', 'Dalam Pengiriman']);
  const readyToShip = data?.filter(d => d.status === 'Siap Dikirim') || [];
  const shipping = data?.filter(d => d.status === 'Dalam Pengiriman') || [];
  return { readyToShip, shipping };
}

export async function bulkAssignCourier(orderIds: string[], courierName: string, adminName: string = 'Admin'): Promise<any> {
  const { error } = await supabase.from('pesanan').update({ courier: courierName, status: 'Dalam Pengiriman' }).in('order_id', orderIds);
  return error ? { success: false } : { success: true };
}

export async function updateOrder(orderId: string, status: string): Promise<any> {
  const { error } = await supabase.from('pesanan').update({ status }).eq('order_id', orderId);
  return error ? { success: false } : { success: true };
}

// Helper function to map Supabase order fields to the expected frontend fields
function mapOrderData(o: any) {
  const parsedItems = typeof o.items === 'string' ? JSON.parse(o.items || '[]') : (o.items || []);
  return {
    ...o,
    items: parsedItems,
    date: o.created_at,
    order_status: o.status,
    whatsapp: o.customer_phone,
    grand_total: o.total_amount,
    subtotal: o.total_amount, // or calculate it minus shipping
    shipping_fee: o.shipping_cost || 0,
    address: o.shipping_address,
  };
}

export async function bulkCompleteDelivery(orderIds: string[], adminName: string = 'Admin'): Promise<any> {
  const { error } = await supabase.from('pesanan').update({ status: 'Selesai' }).in('order_id', orderIds);
  return error ? { success: false } : { success: true };
}

export async function getAllProductsAdmin(): Promise<any[]> {
  const { data } = await supabase.from('produk').select('*').order('created_at', { ascending: false });
  return data?.map(p => ({
    ...p,
    product_id: p.id,
    category: p.category_id,
    image: p.image_url,
    status: p.is_active ? 'ACTIVE' : 'INACTIVE'
  })) || [];
}

export async function saveProductAdmin(payload: any): Promise<any> {
  const is_active = payload.status === 'ACTIVE';
  const prod = {
    name: payload.name,
    price: payload.price,
    promo_price: payload.promo_price,
    cost_price: payload.cost_price,
    image_url: payload.image_url || payload.image,
    category_id: payload.category_id || payload.category,
    stock: payload.stock,
    description: payload.description,
    weight: payload.weight,
    is_active
  };
  
  if (payload.product_id || payload.id) {
    const { error } = await supabase.from('produk').update(prod).eq('id', payload.product_id || payload.id);
    return error ? { success: false, message: error.message } : { success: true };
  } else {
    const { error } = await supabase.from('produk').insert({ ...prod, id: `PRD-${Date.now()}` });
    return error ? { success: false, message: error.message } : { success: true };
  }
}

export async function deleteProductAdmin(productId: string): Promise<any> {
  const { error } = await supabase.from('produk').delete().eq('id', productId);
  return error ? { success: false } : { success: true };
}

export async function getCategories(): Promise<any[]> {
  const { data } = await supabase.from('kategori').select('*');
  return data?.map(c => ({
    category_id: c.id,
    name: c.name,
    icon: c.icon,
    description: c.description
  })) || [];
}

export async function getBanners(): Promise<any[]> {
  const { data } = await supabase.from('banner').select('*').eq('is_active', true);
  return data || [];
}

export async function getAllMembers(): Promise<any[]> {
  const { data } = await supabase.from('member').select('*');
  return data || [];
}

export async function getAllCustomers(): Promise<any[]> {
  const { data: pelanggan } = await supabase.from('pelanggan').select('*');
  if (!pelanggan) return [];
  
  // Get all members to attach member_no
  const { data: members } = await supabase.from('member').select('phone, member_no');
  const memberMap = new Map((members || []).map(m => [m.phone, m.member_no]));

  return pelanggan.map(p => ({
    ...p,
    role: memberMap.has(p.phone) ? 'member' : (p.role || 'customer'),
    member_no: memberMap.get(p.phone) || null
  }));
}

export async function saveMember(memberData: any): Promise<any> {
  const { error } = await supabase.from('member').upsert({
    member_no: memberData.member_no,
    phone: memberData.phone,
    name: memberData.name
  });
  return error ? { success: false } : { success: true };
}

export async function deleteMember(memberNo: string): Promise<any> {
  const { error } = await supabase.from('member').delete().eq('member_no', memberNo);
  return error ? { success: false } : { success: true };
}

export async function getSalesReport(startDate: string, endDate: string): Promise<any> {
  // Query orders within the date range
  const { data: orders } = await supabase
    .from('pesanan')
    .select('*')
    .gte('created_at', `${startDate}T00:00:00.000Z`)
    .lte('created_at', `${endDate}T23:59:59.999Z`);
    
  // Query expenses within the date range
  const { data: expenses } = await supabase
    .from('pengeluaran')
    .select('*')
    .gte('created_at', `${startDate}T00:00:00.000Z`)
    .lte('created_at', `${endDate}T23:59:59.999Z`);

  const orderList = orders || [];
  const expenseList = expenses || [];
  
  const completedOrders = orderList.filter(o => o.status === 'Selesai');
  const canceledOrders = orderList.filter(o => o.status === 'Batal');
  
  const totalRevenue = completedOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const totalExpenses = expenseList.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses; // Ignoring COGS for now as it needs product lookup

  // Calculate top products
  const productCounts: Record<string, {name: string, qty: number, revenue: number}> = {};
  completedOrders.forEach(o => {
    const items = typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || []);
    items.forEach((item: any) => {
      const pName = item.name || item.product_name || 'Unknown Product';
      if (!pName.trim()) return; // Skip empty
      const qty = Number(item.qty || item.quantity || 1);
      const price = Number(item.price || 0);
      
      if (!productCounts[pName]) productCounts[pName] = { name: pName, qty: 0, revenue: 0 };
      productCounts[pName].qty += qty;
      productCounts[pName].revenue += price * qty;
    });
  });
  
  const topProducts = Object.values(productCounts).sort((a, b) => b.qty - a.qty).slice(0, 10);

  // Shopper list
  const shoppers: Record<string, {name: string, whatsapp: string, total_orders: number, total_spend: number, member_no: string | null}> = {};
  
  // Get all members to attach member_no
  const { data: members } = await supabase.from('member').select('phone, member_no');
  const memberMap = new Map((members || []).map((m: any) => [m.phone, m.member_no]));

  completedOrders.forEach(o => {
    const phone = o.customer_phone;
    if (!shoppers[phone]) shoppers[phone] = { 
      name: o.customer_name, 
      whatsapp: phone, 
      total_orders: 0, 
      total_spend: 0,
      member_no: memberMap.get(phone) || null
    };
    shoppers[phone].total_orders += 1;
    shoppers[phone].total_spend += Number(o.total_amount || 0);
  });
  const shopperList = Object.values(shoppers).sort((a, b) => b.total_spend - a.total_spend);

  return {
    period: { start: startDate, end: endDate },
    total_orders: orderList.length,
    completed_orders: completedOrders.length,
    canceled_orders: canceledOrders.length,
    member_orders: 0,
    total_revenue: totalRevenue,
    total_cogs: 0,
    total_expenses: totalExpenses,
    net_profit: netProfit,
    orders: orderList.map(mapOrderData),
    top_products: topProducts,
    shopper_list: shopperList
  };
}

export async function getMemberYearlyReport(year: string | number): Promise<any> {
  const { data: members } = await supabase.from('member').select('*');
  const { data: orders } = await supabase
    .from('pesanan')
    .select('*')
    .eq('status', 'Selesai')
    .gte('created_at', `${year}-01-01T00:00:00.000Z`)
    .lte('created_at', `${year}-12-31T23:59:59.999Z`);
    
  const orderList = orders || [];
  const memberList = members || [];
  
  // Create a map of members by phone number and name
  const memberByPhone: Record<string, any> = {};
  const memberByName: Record<string, any> = {};
  const memberStats: Record<string, any> = {};

  memberList.forEach(m => {
    if (m.phone) memberByPhone[m.phone] = m;
    if (m.name) memberByName[m.name.toLowerCase().trim()] = m;
    
    // Initialize stats for ALL members
    memberStats[m.member_no] = {
      member_no: m.member_no,
      name: m.name,
      total_orders: 0,
      total_spent: 0,
      months: {}
    };
  });
  
  orderList.forEach(o => {
    let targetMemberNo = null;

    if (o.referral_code && memberStats[o.referral_code]) {
      // If order has a referral code, ALL spending goes to the referral member
      targetMemberNo = o.referral_code;
    } else {
      // Otherwise, find the member by phone or name
      const phone = o.customer_phone;
      const nameStr = (o.customer_name || '').toLowerCase().trim();
      
      // Exact match
      let member = memberByPhone[phone] || memberByName[nameStr];
      
      // Word-level fuzzy match if not found
      if (!member && nameStr) {
        const matches = memberList.filter(m => {
          const mName = (m.name || '').toLowerCase().trim();
          const mParts = mName.split(/\s+/);
          const nameParts = nameStr.split(/\s+/);
          return mParts.some(p => nameParts.includes(p));
        });
        
        if (matches.length > 0) {
          // Sort matches to find the best one:
          // 1. Starts with nameStr wins.
          // 2. Shorter name wins (less extra words).
          matches.sort((a, b) => {
            const aName = (a.name || '').toLowerCase().trim();
            const bName = (b.name || '').toLowerCase().trim();
            const aStarts = aName.startsWith(nameStr) ? 1 : 0;
            const bStarts = bName.startsWith(nameStr) ? 1 : 0;
            if (aStarts !== bStarts) return bStarts - aStarts;
            return aName.length - bName.length;
          });
          member = matches[0];
        }
      }
      if (member) {
        targetMemberNo = member.member_no;
      }
    }
    
    if (targetMemberNo && memberStats[targetMemberNo]) {
      memberStats[targetMemberNo].total_orders += 1;
      memberStats[targetMemberNo].total_spent += Number(o.total_amount || 0);
      
      const monthStr = new Date(o.created_at).toLocaleString('id-ID', { month: 'short' });
      memberStats[targetMemberNo].months[monthStr] = (memberStats[targetMemberNo].months[monthStr] || 0) + Number(o.total_amount || 0);
    }
  });

  return Object.values(memberStats).sort((a, b) => b.total_spent - a.total_spent);
}

export async function saveCategoryAdmin(categoryData: any): Promise<any> {
  const { error } = await supabase.from('kategori').upsert({
    id: categoryData.category_id,
    name: categoryData.name,
    icon: categoryData.icon,
    description: categoryData.description
  });
  return error ? { success: false } : { success: true };
}

export async function deleteCategoryAdmin(categoryId: string): Promise<any> {
  const { error } = await supabase.from('kategori').delete().eq('id', categoryId);
  return error ? { success: false } : { success: true };
}

export async function getAllBannersAdmin(): Promise<any[]> {
  const { data } = await supabase.from('banner').select('*');
  return data || [];
}

export async function saveBanner(bannerData: any): Promise<any> {
  const { error } = await supabase.from('banner').upsert({
    id: bannerData.id || `BAN-${Date.now()}`,
    image_url: bannerData.image_url,
    is_active: bannerData.is_active
  });
  return error ? { success: false } : { success: true };
}

export async function deleteBanner(bannerId: string): Promise<any> {
  const { error } = await supabase.from('banner').delete().eq('id', bannerId);
  return error ? { success: false } : { success: true };
}

export async function toggleBannerStatus(bannerId: string): Promise<any> {
  const { data } = await supabase.from('banner').select('is_active').eq('id', bannerId).single();
  if (data) {
    const { error } = await supabase.from('banner').update({ is_active: !data.is_active }).eq('id', bannerId);
    return error ? { success: false } : { success: true };
  }
  return { success: false };
}

export async function saveSettingBanner(imgUrl: string): Promise<any> {
  const { error } = await supabase.from('pengaturan_toko').upsert({ key: 'BANNER_URL', value: { url: imgUrl } });
  return error ? { success: false } : { success: true };
}

export async function getSettingBanner(): Promise<any> {
  const { data } = await supabase.from('pengaturan_toko').select('value').eq('key', 'BANNER_URL').single();
  return data?.value?.url || '';
}

export async function getStoreSettings(): Promise<any> {
  const { data } = await supabase.from('pengaturan_toko').select('*');
  const settings: any = {};
  data?.forEach(d => {
    settings[d.key] = d.value;
  });
  return settings;
}

export async function saveStoreSettings(settings: any): Promise<any> {
  const payload = Object.keys(settings).map(k => ({ key: k, value: settings[k] }));
  const { error } = await supabase.from('pengaturan_toko').upsert(payload);
  return error ? { success: false } : { success: true };
}

export async function getPromosAdmin(): Promise<any[]> {
  const { data } = await supabase.from('promo').select('*');
  return data || [];
}

export async function savePromo(promoData: any): Promise<any> {
  const { error } = await supabase.from('promo').upsert({
    promo_id: promoData.promoId,
    code: promoData.code,
    discount_type: promoData.discountType,
    discount_value: promoData.discountValue,
    min_purchase: promoData.minPurchase,
    max_discount: promoData.maxDiscount,
    is_active: promoData.isActive
  }, { onConflict: 'promo_id' });
  return error ? { success: false, message: error.message } : { success: true };
}

export async function validatePromo(code: string): Promise<any> {
  const { data, error } = await supabase
    .from('promo')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single();

  if (error || !data) return { success: false, message: "Kode promo tidak valid atau sudah tidak aktif." };
  return { success: true, data };
}

export async function deletePromo(promoId: string): Promise<any> {
  const { error } = await supabase.from('promo').delete().eq('promo_id', promoId);
  return error ? { success: false } : { success: true };
}

export async function togglePromoStatus(promoId: string): Promise<any> {
  const { data } = await supabase.from('promo').select('is_active').eq('promo_id', promoId).single();
  if (data) {
    const { error } = await supabase.from('promo').update({ is_active: !data.is_active }).eq('promo_id', promoId);
    return error ? { success: false } : { success: true };
  }
  return { success: false };
}

export async function trackOrder(orderId: string): Promise<any> {
  const { data, error } = await supabase.from('pesanan').select('*').eq('order_id', orderId).single();
  if (error || !data) return { success: false, message: 'Pesanan tidak ditemukan' };
  return { success: true, data: mapOrderData(data) };
}

export async function cancelOrder(orderId: string): Promise<any> {
  // Cek status pesanan dulu, hanya bisa dibatalkan jika belum bayar
  const { data, error: fetchError } = await supabase.from('pesanan').select('status').eq('order_id', orderId).single();
  if (fetchError || !data) return { success: false, message: 'Pesanan tidak ditemukan' };
  
  const allowedStatuses = ['Menunggu Pembayaran', 'PENDING', 'Pending', null, undefined, ''];
  if (!allowedStatuses.includes(data.status)) {
    return { success: false, message: 'Pesanan tidak dapat dibatalkan karena sudah diproses' };
  }

  const { error } = await supabase.from('pesanan').update({ status: 'Dibatalkan' }).eq('order_id', orderId);
  if (error) return { success: false, message: 'Gagal membatalkan pesanan' };
  return { success: true, message: 'Pesanan berhasil dibatalkan' };
}

export async function verifyMember(memberNo: string): Promise<any> {
  const { data, error } = await supabase.from('member').select('*').eq('member_no', memberNo).single();
  if (error || !data) return { success: false, message: 'Member tidak ditemukan' };
  return { success: true, data };
}

export async function submitPaymentProof(orderId: string, base64Image: string): Promise<any> {
  const { error } = await supabase.from('pesanan').update({ payment_proof: base64Image, status: 'Menunggu Konfirmasi' }).eq('order_id', orderId);
  return error ? { success: false } : { success: true };
}

export async function registerCustomer(payload: any) {
  // Combine address fields into a single string if provided
  const fullAddress = [payload.address, payload.village, payload.district, payload.city]
    .filter(Boolean)
    .join(', ');

  // Fetch member data if applicable to determine role
  let role = 'customer';
  let member_no = null;
  
  if (payload.isMember && payload.memberNo) {
    const { data: member } = await supabase.from('member').select('member_no').eq('member_no', payload.memberNo).single();
    if (member) {
      role = 'member';
      member_no = member.member_no;
      // Update the member table with the real phone number (replacing DUMMY)
      await supabase.from('member').update({ phone: payload.phone }).eq('member_no', member_no);
    }
  } else if (payload.phone) {
    const { data: member } = await supabase.from('member').select('member_no').eq('phone', payload.phone).single();
    if (member) {
      role = 'member';
      member_no = member.member_no;
    }
  }

  const { data, error } = await supabase.from('pelanggan').insert({
    phone: payload.phone,
    name: payload.name,
    password: payload.password,
    address: fullAddress,
    role: role
  }).select().single();
  
  if (error) return { success: false, message: error.message };
  
  return { success: true, data: { ...data, role, member_no } };
}

export async function updateCustomerPassword(phone: string, newPassword: string) {
  const { error } = await supabase.from('pelanggan').update({ password: newPassword }).eq('phone', phone);
  return error ? { success: false, message: error.message } : { success: true };
}

export async function deleteCustomer(phone: string) {
  const { error } = await supabase.from('pelanggan').delete().eq('phone', phone);
  return error ? { success: false, message: error.message } : { success: true };
}

export async function loginCustomer(payload: any) {
  const { data, error } = await supabase.from('pelanggan').select('*').eq('phone', payload.phone).eq('password', payload.password).single();
  if (error || !data) return { success: false, message: 'No HP atau password salah' };
  
  const { data: member } = await supabase.from('member').select('member_no').eq('phone', payload.phone).single();
  
  return { success: true, data: { ...data, role: member ? 'member' : 'customer', member_no: member?.member_no } };
}

export async function updateCustomerProfile(payload: any) {
  const updateData: any = { name: payload.name, address: payload.address };
  if (payload.password) updateData.password = payload.password;
  
  const { error } = await supabase.from('pelanggan').update(updateData).eq('phone', payload.phone);
  return error ? { success: false, message: error.message } : { success: true };
}

export async function getReferralContacts(memberNo: string): Promise<any[]> {
  const { data } = await supabase
    .from('pesanan')
    .select('dropship_name, dropship_phone, shipping_address')
    .eq('referral_code', memberNo)
    .not('dropship_phone', 'is', null);
    
  if (!data) return [];
  
  const contacts = new Map();
  data.forEach(d => {
    if (d.dropship_phone && d.dropship_name) {
      contacts.set(d.dropship_phone, { 
        contact_id: d.dropship_phone,
        whatsapp: d.dropship_phone,
        name: d.dropship_name,
        address: d.shipping_address || ""
      });
    }
  });
  return Array.from(contacts.values());
}
