// ============================================================
// PANORAMEX CRM — api/cron/surveys.ts
// Vercel Cron Job: runs daily at 17:00 CST (23:00 UTC)
// Finds reservations whose service_date was yesterday,
// and sends a post-tour satisfaction survey (interactive buttons).
// ============================================================

import { adminDb } from '../_bot/supabase.js'
import { sendWhatsAppInteractiveButtons } from '../_utils/whatsapp.js'

const PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID || ''
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || ''
const CRON_SECRET = process.env.CRON_SECRET || ''

export async function GET(req: Request) {
  const authHeader = req.headers.get('Authorization')
  const url = new URL(req.url)
  const secretParam = url.searchParams.get('secret')

  const isVercelCron = authHeader === `Bearer ${CRON_SECRET}`
  const isManualTest = secretParam === CRON_SECRET

  if (CRON_SECRET && !isVercelCron && !isManualTest) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Yesterday's date in ISO format
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const dateStr = yesterday.toISOString().slice(0, 10)

  // Find reservations from yesterday (confirmed status)
  const { data: reservations, error } = await adminDb
    .from('reservations')
    .select(`
      id,
      prospect_id,
      tour_variant_id,
      service_date,
      prospects ( id, name, phone_number )
    `)
    .eq('service_date', dateStr)
    .eq('status', 'confirmed')

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  if (!reservations || reservations.length === 0) {
    return Response.json({ success: true, sent: 0, message: `No confirmed reservations for ${dateStr}` })
  }

  // Check if a survey campaign exists for today already
  const campaignName = `Encuesta Post-Tour ${dateStr}`
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
        type: 'automated_survey',
        template_name: 'encuesta_satisfaccion',
        status: 'running',
        created_by: (await adminDb.from('agents').select('id').limit(1).single()).data?.id,
      })
      .select('id')
      .single()

    if (campErr || !newCampaign) {
      return Response.json({ error: 'Failed to create survey campaign' }, { status: 500 })
    }
    campaignId = newCampaign.id
  }

  let sent = 0
  let failed = 0

  for (const reservation of reservations) {
    const prospect = (reservation as any).prospects
    if (!prospect?.phone_number) continue

    // Avoid double-sending if a survey was already recorded
    const { count } = await adminDb
      .from('satisfaction_surveys')
      .select('id', { count: 'exact', head: true })
      .eq('reservation_id', reservation.id)

    if (count && count > 0) continue

    // Button IDs encode: SURVEY_{rating}_RES_{reservation_id}
    const buttons = [
      { id: `SURVEY_5_RES_${reservation.id}`, title: '⭐⭐⭐⭐⭐ Excelente' },
      { id: `SURVEY_3_RES_${reservation.id}`, title: '⭐⭐⭐ Regular' },
      { id: `SURVEY_1_RES_${reservation.id}`, title: '⭐ Mala' },
    ]

    const bodyText = `Hola ${prospect.name ?? 'viajero/a'} 👋 Esperamos que hayas disfrutado tu tour con Panoramex. ¿Cómo calificarías tu experiencia?`

    try {
      const result = await sendWhatsAppInteractiveButtons(
        PHONE_NUMBER_ID,
        ACCESS_TOKEN,
        prospect.phone_number,
        bodyText,
        buttons
      )

      await adminDb.from('campaign_sends').insert({
        campaign_id: campaignId,
        prospect_id: prospect.id,
        phone_number: prospect.phone_number,
        status: 'sent',
        meta_message_id: result?.messages?.[0]?.id ?? null,
      })

      sent++
    } catch (err: any) {
      console.error(`Survey send failed for ${prospect.phone_number}:`, err.message)
      await adminDb.from('campaign_sends').insert({
        campaign_id: campaignId,
        prospect_id: prospect.id,
        phone_number: prospect.phone_number,
        status: 'failed',
      })
      failed++
    }
  }

  await adminDb.from('campaigns').update({ status: 'completed' }).eq('id', campaignId)

  return Response.json({ success: true, sent, failed, total: reservations.length })
}
