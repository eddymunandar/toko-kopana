import { createClient } from '@supabase/supabase-js';

const API_URL = "https://script.google.com/macros/s/AKfycbyGw_80_IfLh1DWiX97bLLi5BtWQYlkwxA8H28WZuVlngMSI4D7JT3USZ17zLPFZnqu/exec";
const ADMIN_API_KEY = "TKN-SECURE-KEY-2026";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  try {
    const res = await fetch(`${API_URL}?api=true&action=getAllMembers&token=${ADMIN_API_KEY}`);
    const text = await res.text();
    
    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      console.log("Failed to parse JSON. Response was:");
      console.log(text.substring(0, 200));
      return;
    }
    
    const members = json.success ? json.data : [];
    
    const seenPhones = new Set();
    const validMembers = [];
    
    for (const m of members) {
      if (!m.member_no) continue;
      
      let phone = String(m.phone).trim();
      if (!phone) {
         validMembers.push({ member_no: m.member_no, phone: null, name: m.name || 'Unknown' });
         continue;
      }
      
      if (seenPhones.has(phone)) {
         console.log(`Skipping duplicate phone for member ${m.name}: ${phone}`);
         continue;
      }
      
      seenPhones.add(phone);
      validMembers.push({ member_no: m.member_no, phone: phone, name: m.name || 'Unknown' });
    }

    const { error } = await supabase.from('member').upsert(validMembers, { onConflict: 'member_no' });
    if (error) console.error("Error inserting members:", error.message);
    else console.log(`Berhasil memasukkan ${validMembers.length} member!`);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}
run();
