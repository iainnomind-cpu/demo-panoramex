// ============================================================
// PANORAMEX CRM — api/cron/birthdays.ts
// Vercel Cron Job: runs daily at 09:00 AM CST (15:00 UTC)
// Queries prospects with today's birth_date and sends
// the birthday WhatsApp template.
// ============================================================

import { adminDb } from '../_bot/supabase.js'
import { sendWhatsAppTemplate } from '../_utils/whatsapp.js'

const phone_ID = process.env.META_phone_ID || ''
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || ''
const BIRTHDAY_TEMPLATE = process.env.BIRTHDAY_TEMPLATE_NAME || 'feliz_cumpleanos'
const CRON_SECRET = process.env.CRON_SECRET || ''

export async function GET(req: Request) {
  // Secure cron: Vercel automatically attaches the bearer token for cron invocations.
  // For manual testing we also accept a CRON_SECRET query param.
  const authHeader = req.headers.get('Authorization')
  const url = new URL(req.url)
  const secretParam = url.searchParams.get('secret')

  const isVercelCron = authHeader === `Bearer ${CRON_SECRET}`
  const isManualTest = secretParam === CRON_SECRET

  if (CRON_SECRET && !isVercelCron && !isManualTest) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  // Query prospects whose birth_date matches today's month and day
  // Supabase doesn't support EXTRACT directly in client SDK, so we use RPC or raw filter.
  // We'll fetch and filter server-side (small dataset expected).
  const { data: prospects, error } = await adminDb
    .from('prospects')
    .select('id, name, phone, birth_date')
    .not('phone', 'is', null)
    .not('birth_date', 'is', null)

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  const birthdayProspects = (prospects ?? []).filter((p: any) => {
    if (!p.birth_date) return false
    const bDate = new Date(p.birth_date)
    const bMonth = String(bDate.getMonth() + 1).padStart(2, '0')
    const bDay = String(bDate.getDate()).padStart(2, '0')
    return bMonth === month && bDay === day
  })

  if (birthdayProspects.length === 0) {
    return Response.json({ success: true, sent: 0, message: 'No birthdays today' })
  }

  // Find or create the birthday automated campaign for today
  const campaignName = `Cumpleaños Automático ${today.toISOString().slice(0, 10)}`
  let campaignId: string

  const { data: existing } = await adminDb
    .from('campaigns')
    .select('id')
    .eq('name', campaignName)
    .single()

  if (existing) {
    campaignId = existing.id
  } else {
    const { data: newCampaign, error: campErr } = await adminDb
      .from('campaigns')
      .insert({
        name: campaignName,
        type: 'automated_birthday',
        template_name: BIRTHDAY_TEMPLATE,
        status: 'running',
        created_by: (await adminDb.from('agents').select('id').limit(1).single()).data?.id,
      })
      .select('id')
      .single()

    if (campErr || !newCampaign) {
      return Response.json({ error: 'Failed to create campaign' }, { status: 500 })
    }
    campaignId = newCampaign.id
  }

  let sent = 0
  let failed = 0

  for (const prospect of birthdayProspects) {
    try {
      const result = await sendWhatsAppTemplate(
        phone_ID,
        ACCESS_TOKEN,
        prospect.phone,
        BIRTHDAY_TEMPLATE,
        'es',
        [
          {
            type: 'body',
            parameters: [{ type: 'text', text: prospect.name ?? 'amigo/a' }],
          },
        ]
      )

      await adminDb.from('campaign_sends').insert({
        campaign_id: campaignId,
        prospect_id: prospect.id,
        phone_number: prospect.phone,
        status: 'sent',
        meta_message_id: result?.messages?.[0]?.id ?? null,
      })

      sent++
    } catch (err: any) {
      console.error(`Birthday send failed for ${prospect.phone}:`, err.message)
      await adminDb.from('campaign_sends').insert({
        campaign_id: campaignId,
        prospect_id: prospect.id,
        phone_number: prospect.phone,
        status: 'failed',
      })
      failed++
    }
  }

  await adminDb.from('campaigns').update({ status: 'completed' }).eq('id', campaignId)

  return Response.json({ success: true, sent, failed, total: birthdayProspects.length })
}
