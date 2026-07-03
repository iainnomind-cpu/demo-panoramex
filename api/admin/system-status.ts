/**
 * api/admin/system-status.ts — Panoramex CRM
 *
 * Vercel Serverless Function: POST /api/admin/system-status
 *
 * Toggles the CRM system between 'active' and 'paused'.
 *
 * Constitution gates enforced:
 *   - service_role key never exposed to frontend; only used here server-side.
 *   - Caller must be authenticated AND have role === 'admin'.
 *   - Every status change is written to audit_log.
 *   - TypeScript strict — no `any`.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../src/lib/database.types'

const supabaseAdmin = createClient<Database>(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type SystemStatus = 'active' | 'paused'

interface SystemStatusBody {
  status: SystemStatus
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
  const { status } = req.body as SystemStatusBody

  if (status !== 'active' && status !== 'paused') {
    return res.status(400).json({ error: 'status must be "active" or "paused"' })
  }

  // 4. Fetch current status for audit log (old value)
  const { data: currentSettings, error: fetchError } = await supabaseAdmin
    .from('org_settings')
    .select('system_status, id')
    .order('id')
    .limit(1)
    .single()

  if (fetchError || !currentSettings) {
    return res.status(500).json({ error: 'Failed to read current org settings' })
  }

  if (currentSettings.system_status === status) {
    return res.status(200).json({
      success: true,
      message: `System is already ${status}`,
      new_status: status,
    })
  }

  // 5. Update org_settings using service_role (bypasses RLS)
  const { error: updateError } = await supabaseAdmin
    .from('org_settings')
    .update({
      system_status: status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', currentSettings.id)

  if (updateError) {
    console.error('[system-status] Update failed:', updateError)
    return res.status(500).json({ error: 'Failed to update system status' })
  }

  // 6. Write audit log
  const action = status === 'paused' ? 'PAUSE_SYSTEM' : 'ACTIVATE_SYSTEM'

  const { error: auditError } = await supabaseAdmin
    .from('audit_log')
    .insert({
      actor_id: user.id,
      action,
      entity_type: 'org_settings',
      entity_id: String(currentSettings.id),
      metadata: {
        old_status: currentSettings.system_status,
        new_status: status,
      },
    })

  if (auditError) {
    console.error('[system-status] AUDIT LOG FAILED:', auditError)
    return res.status(207).json({
      success: true,
      new_status: status,
      message: 'Status updated but audit log entry failed. Investigate immediately.',
      audit_error: auditError.message,
    })
  }

  return res.status(200).json({
    success: true,
    new_status: status,
  })
}
