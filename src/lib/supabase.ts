import { createClient } from '@supabase/supabase-js';
export const SB_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
export const SB_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const hasSB = !!(SB_URL && SB_ANON);
export const supabase = hasSB ? createClient(SB_URL!, SB_ANON!) : null;