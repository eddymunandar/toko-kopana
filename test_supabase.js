const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.log("No Supabase URL found");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log("Testing Supabase connection...");
  
  // Try to query common table names to see what exists
  const tables = ['products', 'orders', 'categories', 'members', 'banners', 'promos', 'store_settings', 'expenses'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        if (error.code === '42P01') {
          console.log(`Table '${table}' does NOT exist.`);
        } else {
          console.log(`Table '${table}' exists but query failed:`, error.message);
        }
      } else {
        console.log(`✅ Table '${table}' exists! Found ${data.length} rows.`);
        if (data.length > 0) {
          console.log(`Columns in ${table}:`, Object.keys(data[0]).join(', '));
        }
      }
    } catch (err) {
      console.log(`Error checking table ${table}:`, err.message);
    }
  }
}

test();
