import { useEffect, useState } from 'react';
import { useSession } from '@clerk/clerk-react';
import { createSupabaseClient } from '../lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../lib/db-types';

export function useSupabase() {
  const { session } = useSession();
  const [supabase, setSupabase] = useState<SupabaseClient<Database>>();

  useEffect(() => {
    async function getSupabase() {
      if (session) {
        const token = await session.getToken({ template: 'supabase' });
        setSupabase(createSupabaseClient(token));
      } else {
        setSupabase(createSupabaseClient());
      }
    }

    getSupabase();
  }, [session]);

  return supabase;
}