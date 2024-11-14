import { createClient } from '@supabase/supabase-js';
import type { Database } from './db-types';

// Create a function that returns a configured Supabase client
export function createSupabaseClient(clerkToken?: string | null) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: clerkToken ? {
        Authorization: `Bearer ${clerkToken}`
      } : {}
    }
  });
}

// Export a default instance for non-authenticated operations
export const supabase = createSupabaseClient();