/**
 * Supabase Client — Panoramex CRM
 *
 * Constitution gate: Only VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 * are exposed here (public, non-sensitive). The service_role key is
 * NEVER imported or referenced in this file or any other frontend file.
 *
 * All privileged operations (reassign prospect, pause system) go through
 * Vercel serverless functions in /api/ which hold SUPABASE_SERVICE_ROLE_KEY.
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[Supabase] VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be defined in .env.local'
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
