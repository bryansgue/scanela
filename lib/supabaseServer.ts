import { createClient, SupabaseClient } from '@supabase/supabase-js';

let cachedClient: SupabaseClient | null = null;

export function getSupabaseAdminClient() {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !serviceKey) {
    throw new Error('Missing Supabase environment variables for server-side client');
  }

  cachedClient = createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  return cachedClient;
}
