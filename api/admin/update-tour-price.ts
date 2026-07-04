/**
 * api/admin/update-tour-price.ts — Panoramex CRM
 *
 * Vercel Serverless Function: POST /api/admin/update-tour-price
 *
 * Updates the price_per_person of a tour_variant in the user's JWT context
 * so the PostgreSQL audit trigger (trg_audit_tour_variants) can capture
 * auth.uid() and write to audit_log automatically.
 *
 * Constitution gates enforced:
 *   - service_role key never exposed to frontend.
 *   - Caller must be authenticated AND have role === 'admin' OR can_edit_catalog === true.
 *   - The UPDATE is performed with the user-scoped client so auth.uid() is available.
 *   - TypeScript strict — no `any`.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../src/lib/database.types'

const supabaseAdmin = createClient<Database>(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface UpdatePriceBody {
  variant_id: string
  new_price: number
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // 1. Verify caller's JWT
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' })
  }
  const jwt = authHeader.slice(7)

  const supabaseUser = createClient<Database>(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${jwt}` } } }
  )
  const { data: { user }, error: userError } = await supabaseUser.auth.getUser(jwt)

  if (userError || !user) {
    return res.status(401).json({ error: 'Unauthenticated' })
  }

  // 2. Verify caller has catalog edit permission (admin OR can_edit_catalog)
  const { data: callerAgent, error: agentError } = await supabaseAdmin
    .from('agents')
    .select('role, can_edit_catalog')
    .eq('id', user.id)
    .single()

  if (agentError || !callerAgent) {
    return res.status(403).json({ error: 'Agent profile not found' })
  }

  if (callerAgent.role !== 'admin' && !callerAgent.can_edit_catalog) {
    return res.status(403).json({ error: 'Forbidden: admin or catalog editor role required' })
  }

  // 3. Validate request body
  const { variant_id, new_price } = req.body as UpdatePriceBody

  if (!variant_id || typeof new_price !== 'number' || new_price < 0) {
    return res.status(400).json({ error: 'variant_id and a non-negative new_price are required' })
  }

  // 4. Update tour_variant using the user's JWT context so auth.uid() resolves
  //    correctly inside the PostgreSQL audit trigger (fn_audit_sensitive_changes).
  //    The RLS policy "tour_variants_update_admin" (added in 00007) allows this.
  const { error: updateError } = await supabaseUser
    .from('tour_variants')
    .update({ price_per_person: new_price })
    .eq('id', variant_id)

  if (updateError) {
    console.error('[update-tour-price] Update failed:', updateError)
    return res.status(500).json({ error: 'Failed to update tour price' })
  }

  // 5. Audit log is written automatically by the PostgreSQL trigger
  //    trg_audit_tour_variants → fn_audit_sensitive_changes().

  return res.status(200).json({
    success: true,
    message: 'Tour variant price updated successfully',
  })
}
