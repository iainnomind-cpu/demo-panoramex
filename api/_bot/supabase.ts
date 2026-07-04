import { createClient } from '@supabase/supabase-js';
import { Database } from '../../src/lib/database.types';

// Use the service role key to bypass RLS in the serverless backend
// WARNING: Never expose the SERVICE_ROLE_KEY to the frontend client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase URL or Service Role Key in environment variables');
}

export const adminDb = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});
