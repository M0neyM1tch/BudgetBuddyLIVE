import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/database.types';
import { env } from './env';

export const supabase = createClient<Database>(
  env.supabase.url,
  env.supabase.publishableKey,
  {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
      storageKey: 'budgetbuddy-v2-auth',
    },
    global: {
      headers: {
        'x-client-info': 'budgetbuddy-v2-web',
      },
    },
  },
);

export type DbClient = typeof supabase;
