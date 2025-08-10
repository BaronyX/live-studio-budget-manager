import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error('Missing Supabase env (URL and SERVICE KEY or ANON for public tables)');
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: pnpm import:json <file.json>');
    process.exit(1);
  }
  const json = JSON.parse(readFileSync(file, 'utf-8')) as Record<string, unknown[]>;
  // Simple upsert per table
  for (const [table, rows] of Object.entries(json)) {
    if (!Array.isArray(rows)) continue;
    console.log('Upserting', table, rows.length, 'rows');
    for (let i = 0; i < rows.length; i += 1000) {
      const chunk = rows.slice(i, i + 1000);
      const { error } = await supabase.from(table).upsert(chunk as any);
      if (error) throw error;
    }
  }
  console.log('Import completed');
}

main().catch(err => { console.error(err); process.exit(1); });