import { createClient } from '@supabase/supabase-js';

const API_URL = "https://script.google.com/macros/s/AKfycbyGw_80_IfLh1DWiX97bLLi5BtWQYlkwxA8H28WZuVlngMSI4D7JT3USZ17zLPFZnqu/exec";
const ADMIN_API_KEY = "TKN-SECURE-KEY-2026";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials. Make sure to run with --env-file=.env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchGAS(action) {
  const url = `${API_URL}?api=true&action=${action}&token=${ADMIN_API_KEY}`;
  const res = await fetch(url);
  const json = await res.json();
  return json.success ? json.data : [];
}

async function run() {
  console.log("Memulai Sinkronisasi Data Otomatis...");

  // 1. Categories
  console.log("Menyedot Kategori...");
  const categories = await fetchGAS('getCategories');
  const catPayload = categories.map(c => {
    let icon = c[''];
    let desc = c.icon;
    if (icon && icon.startsWith('fa-')) {
       // correctly mapped
    } else {
       icon = '';
       desc = '';
    }
    return {
      id: c.category_id,
      name: c.name,
      icon: icon || null,
      description: desc || null
    };
  }).filter(c => c.id);
  
  if (catPayload.length > 0) {
     const { error } = await supabase.from('kategori').upsert(catPayload);
     if (error) console.error("Error categories:", error.message);
  }

  // 2. Products
  console.log("Menyedot Produk...");
  const products = await fetchGAS('getAllProductsAdmin');
  const prodPayload = products.map(p => ({
    id: p.product_id,
    name: p.name,
    price: Number(p.price) || 0,
    promo_price: Number(p.promo_price) || 0,
    cost_price: Number(p.cost_price) || 0,
    image_url: p.image || null,
    category_id: p.category_id || null,
    stock: Number(p.stock) || 0,
    description: p.description || null,
    weight: Number(p.weight) || 1000,
    is_active: (p.is_active === true || p.is_active === 'true' || p.is_active === 'TRUE' || p.is_active === 1)
  })).filter(p => p.id);
  
  if (prodPayload.length > 0) {
    const { error } = await supabase.from('produk').upsert(prodPayload);
    if (error) console.error("Error products:", error.message);
  }

  // 3. Customers
  console.log("Menyedot Pelanggan...");
  const customers = await fetchGAS('getAllCustomers');
  const custPayload = customers.map(c => ({
    phone: String(c.phone).trim(),
    name: c.name || 'Unknown',
    address: c.address || null,
    role: c.role || 'customer'
  })).filter(c => c.phone);
  
  if (custPayload.length > 0) {
    const { error } = await supabase.from('pelanggan').upsert(custPayload, { onConflict: 'phone' });
    if (error) console.error("Error customers:", error.message);
  }

  // 4. Members
  console.log("Menyedot Member (Influencer)...");
  const members = await fetchGAS('getAllMembers');
  const memberPayload = members.map(m => ({
    member_no: m.member_no,
    phone: String(m.phone).trim() || null,
    name: m.name || 'Unknown'
  })).filter(m => m.member_no);
  
  if (memberPayload.length > 0) {
    const { error } = await supabase.from('member').upsert(memberPayload);
    if (error) console.error("Error members:", error.message);
  }

  // 5. Banners
  console.log("Menyedot Banner...");
  const banners = await fetchGAS('getAllBannersAdmin');
  const banPayload = banners.map(b => ({
    id: b.id,
    image_url: b.image_url,
    is_active: b.is_active === true || b.is_active === 'true'
  })).filter(b => b.id);
  
  if (banPayload.length > 0) {
    const { error } = await supabase.from('banner').upsert(banPayload);
    if (error) console.error("Error banners:", error.message);
  }

  // 6. Promos
  console.log("Menyedot Promo...");
  const promos = await fetchGAS('getPromosAdmin');
  const promoPayload = promos.map(p => ({
    id: p.promoId,
    code: p.code,
    discount_amount: Number(p.discount_amount) || 0,
    is_active: p.is_active === true || p.is_active === 'true'
  })).filter(p => p.id);
  
  if (promoPayload.length > 0) {
    const { error } = await supabase.from('promo').upsert(promoPayload);
    if (error) console.error("Error promos:", error.message);
  }

  // 7. Store Settings
  console.log("Menyedot Pengaturan Toko...");
  const setUrl = `${API_URL}?api=true&action=getStoreSettings&token=${ADMIN_API_KEY}`;
  const setRes = await fetch(setUrl);
  const setJson = await setRes.json();
  if (setJson.success && setJson.data) {
     const settingsObj = setJson.data;
     const setPayload = Object.keys(settingsObj).map(key => ({
       key: key,
       value: settingsObj[key]
     }));
     if (setPayload.length > 0) {
       const { error } = await supabase.from('pengaturan_toko').upsert(setPayload);
       if (error) console.error("Error settings:", error.message);
     }
  }

  console.log("✅ Sinkronisasi Selesai Secara Menyeluruh!");
}

run();
