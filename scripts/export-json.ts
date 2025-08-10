import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'node:fs';

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error('Missing Supabase env (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY or service key)');
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  const tables = [
    'brands', 'fragrance_families', 'product_categories', 'fragrances',
    'references_master', 'fragrance_references_map', 'suppliers', 'supplier_tiers',
    'fragrance_subfamilies_map', 'fragrance_fit_products'
  ];
  const out: Record<string, unknown[]> = {};
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*');
    if (error) throw error;
    out[t] = data as unknown[];
  }
  const file = `export-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;
  writeFileSync(file, JSON.stringify(out, null, 2));
  console.log('Exported to', file);
}

main().catch(err => { console.error(err); process.exit(1); });