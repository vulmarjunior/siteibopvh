import { createClient, SupabaseClient } from '@supabase/supabase-js';

let serverSupabaseInstance: SupabaseClient | null = null;

export function getSupabaseServer(): SupabaseClient {
  if (!serverSupabaseInstance) {
    const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://tyqdxqfuppmwtkxbpvho.supabase.co';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

    if (!url || !key) {
      console.warn('⚠️ Server Supabase credentials missing (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY/SUPABASE_ANON_KEY)');
    }

    serverSupabaseInstance = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return serverSupabaseInstance;
}
