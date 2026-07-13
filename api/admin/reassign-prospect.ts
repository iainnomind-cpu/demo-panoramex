/**
 * api/admin/reassign-prospect.ts — Panoramex CRM
 *
 * Vercel Serverless Function: POST /api/admin/reassign-prospect
 *
 * Reassigns a prospect to a different agent.
 *
 * Constitution gates enforced:
 *   - service_role key never exposed to frontend; only used here server-side.
 *   - Caller must be authenticated AND have role === 'admin'.
 *   - Every successful reassignment is written to audit_log.
 *   - TypeScript strict — no `any`.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../src/lib/database.types.js'

const supabaseAdmin = createClient<Database>(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface ReassignBody {
  prospect_id: string
  new_agent_id: string
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // 1. Verify caller's JWT (passed as Bearer token)
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' })
  }
  const jwt = authHeader.slice(7)

  // Use a user-scoped client to validate the JWT via getUser()
  const supabaseUser = createClient<Database>(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
  )
  const { data: { user }, error: userError } = await supabaseUser.auth.getUser(jwt)

  if (userError || !user) {
    return res.status(401).json({ error: 'Unauthenticated' })
  }

  // 2. Verify the caller is an admin
  const { data: callerAgent, error: agentError } = await supabaseAdmin
    .from('agents')
    .select('role')
    .eq('id', user.id)
    .single()

  if (agentError || !callerAgent) {
    return res.status(403).json({ error: 'Agent profile not found' })
  }

  if (callerAgent.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: admin role required' })
  }

  // 3. Validate request body
  const { prospect_id, new_agent_id } = req.body as ReassignBody

  if (!prospect_id || !new_agent_id) {
    return res.status(400).json({ error: 'prospect_id and new_agent_id are required' })
  }

  // 4. Fetch current assigned_to for the audit log (old value)
  const { data: currentProspect, error: fetchError } = await supabaseAdmin
    .from('prospects')
    .select('assigned_to')
    .eq('id', prospect_id)
    .single()

  if (fetchError || !currentProspect) {
    return res.status(404).json({ error: 'Prospect not found' })
  }

  // 5. Perform the reassignment using the user's context so auth.uid() works in the trigger
  const { error: updateError } = await supabaseUser
    .from('prospects')
    .update({ assigned_to: new_agent_id })
    .eq('id', prospect_id)

  if (updateError) {
    console.error('[reassign-prospect] Update failed:', updateError)
    return res.status(500).json({ error: 'Failed to reassign prospect' })
  }

  // 6. Write audit log is now handled automatically by PostgreSQL triggers.

  return res.status(200).json({
    success: true,
    message: 'Prospect reassigned successfully',
  })
}
