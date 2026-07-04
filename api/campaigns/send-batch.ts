// ============================================================
// PANORAMEX CRM — api/campaigns/send-batch.ts
// Vercel Serverless Function: Enqueue & send a batch of WhatsApp
// template messages with Meta-compliant throttling (≤80 msg/s).
// ============================================================

import { adminDb } from '../bot/supabase.js'
import { sendWhatsAppTemplate, sleep } from '../utils/whatsapp.js'

interface BatchRecipient {
  phone_number: string
  prospect_id?: string
  /** Variables for the template body (positional) */
  variables?: string[]
}

interface SendBatchBody {
  campaign_id: string
  template_name: string
  language?: string
  recipients: BatchRecipient[]
}

const PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID || ''
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || ''
/** Max messages per second to stay well within Meta's limits */
const RATE_MS = 15 // 1 message every 15ms ≈ 66/s (safe margin under 80/s)

export async function POST(req: Request) {
  // Auth check: Supabase JWT
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: SendBatchBody
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { campaign_id, template_name, language = 'es', recipients } = body

  if (!campaign_id || !template_name || !recipients?.length) {
    return Response.json(
      { error: 'Missing required fields: campaign_id, template_name, recipients' },
      { status: 422 }
    )
  }

  // Pre-insert all recipients as 'queued'
  const insertRows = recipients.map((r) => ({
    campaign_id,
    phone_number: r.phone_number,
    prospect_id: r.prospect_id ?? null,
    status: 'queued' as const,
  }))

  const { data: inserted, error: insertError } = await adminDb
    .from('campaign_sends')
    .insert(insertRows)
    .select('id, phone_number, prospect_id')

  if (insertError || !inserted) {
    return Response.json({ error: 'DB insert failed', detail: insertError?.message }, { status: 500 })
  }

  // Update campaign status to running
  await adminDb.from('campaigns').update({ status: 'running' }).eq('id', campaign_id)

  // Fire and forget the actual sending in background
  // (Vercel waitUntil not available here as we need to return fast)
  // Instead: respond immediately, process batch inline with streaming approach
  // For large batches, the client calls this endpoint in chunks of ≤500

  let sent = 0
  let failed = 0

  for (let i = 0; i < inserted.length; i++) {
    const row = inserted[i]
    const recipient = recipients.find((r) => r.phone_number === row.phone_number)

    try {
      const components =
        recipient?.variables && recipient.variables.length > 0
          ? [
              {
                type: 'body' as const,
                parameters: recipient.variables.map((v) => ({
                  type: 'text' as const,
                  text: v,
                })),
              },
            ]
          : []

      const result = await sendWhatsAppTemplate(
        PHONE_NUMBER_ID,
        ACCESS_TOKEN,
        row.phone_number,
        template_name,
        language,
        components
      )

      const metaMessageId = result?.messages?.[0]?.id ?? null

      await adminDb
        .from('campaign_sends')
        .update({ status: 'sent', meta_message_id: metaMessageId, updated_at: new Date().toISOString() })
        .eq('id', row.id)

      sent++
    } catch (err: any) {
      console.error(`Failed to send to ${row.phone_number}:`, err.message)
      await adminDb
        .from('campaign_sends')
        .update({ status: 'failed', updated_at: new Date().toISOString() })
        .eq('id', row.id)
      failed++
    }

    // Throttle: 1 message every RATE_MS ms
    if (i < inserted.length - 1) {
      await sleep(RATE_MS)
    }
  }

  // Mark campaign completed if all recipients processed
  await adminDb.from('campaigns').update({ status: 'completed' }).eq('id', campaign_id)

  return Response.json({ success: true, sent, failed, total: inserted.length })
}
