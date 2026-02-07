import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { Database } from '@/types_db';

// Helper to get a server-side Supabase client tied to cookies (for RLS)
export const getSupabaseServer = async () => {
  return createRouteHandlerClient<Database>({ 
    cookies: cookies as any
  });
};

// Helper to get a server-side Supabase admin client (bypasses RLS)
export const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration');
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey);
};
