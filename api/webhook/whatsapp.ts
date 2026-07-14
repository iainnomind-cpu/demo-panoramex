import { waitUntil } from '@vercel/functions';
import { verifyMetaSignature } from '../_bot/crypto.js';
import { adminDb } from '../_bot/supabase.js';
import { getOrCreateConversation, saveMessage, pauseConversation } from '../_bot/state.js';
import { generateResponse } from '../_bot/llm.js';
import { sendWhatsAppMessage } from '../_utils/whatsapp.js';
import { checkRateLimit } from '../../src/lib/rateLimit.js';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.META_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return new Response('Forbidden', { status: 403 });
}

export async function POST(req: Request) {
  // Rate Limiting persistente con Supabase (Max 50 reqs / 10 segs por IP)
  const ip = (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
  const { allowed } = await checkRateLimit(adminDb, `ip:${ip}`, 50, 10_000);
  if (!allowed) {
    console.warn(`[RateLimit] Excedido para IP: ${ip}`);
    return new Response('Too Many Requests', { status: 429 });
  }

  const payload = await req.text();
  const signature = req.headers.get('x-hub-signature-256');

  console.log('[Webhook] POST received, validating signature...');

  if (!verifyMetaSignature(payload, signature, process.env.META_APP_SECRET || '')) {
    console.warn('[Webhook] Signature mismatch — check META_APP_SECRET. Payload:', payload.substring(0, 200));
    // In test/dev mode, we log but still process to help with debugging
    if (process.env.NODE_ENV !== 'development') {
      return new Response('Invalid signature', { status: 401 });
    }
  }

  let body;
  try {
    body = JSON.parse(payload);
  } catch (e) {
    return new Response('Invalid JSON', { status: 400 });
  }

  // Acknowledge Meta immediately
  const response = new Response('OK', { status: 200 });

  // Process message asynchronously
  waitUntil(processWebhookEvent(body));

  return response;
}

async function processWebhookEvent(body: any) {
  try {
    // Check global organization status before processing
    const { data: orgSettings } = await adminDb
      .from('org_settings')
      .select('system_status')
      .limit(1)
      .single();

    console.log('[Webhook] org_settings:', orgSettings);
    if (orgSettings === null || orgSettings?.system_status === 'paused') {
      console.warn('[Webhook] System is paused or org_settings not found. Processing anyway for debug.');
      // Don't return early in case org_settings is simply not seeded yet
    }

    // 1. Log event
    console.log('[Webhook] Saving event to webhook_events...');
    const { data: event, error: eventError } = await adminDb.from('webhook_events').insert({ payload: body }).select('id').single();
    console.log('[Webhook] event saved:', event, 'error:', eventError);
    if (!event) {
      console.error('[Webhook] Could not save webhook_events row, aborting.');
      return;
    }

    if (body.object !== 'whatsapp_business_account') return;

    for (const entry of body.entry) {
      for (const change of entry.changes) {
        if (!change.value) continue;

        // ── Status updates (sent/delivered/read) ─────────────────
        if (change.value.statuses) {
          for (const status of change.value.statuses) {
            const metaId = status.id;
            const newStatus = status.status; // 'sent' | 'delivered' | 'read'
            if (['sent', 'delivered', 'read'].includes(newStatus)) {
              await adminDb
                .from('campaign_sends')
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq('meta_message_id', metaId);
            }
          }
        }

        // ── Incoming messages ─────────────────────────────────────
        if (change.value.messages) {
          const messages = change.value.messages;
          const contacts = change.value.contacts;
          const phoneNumberId = change.value.metadata.phone_number_id;

          for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            const contact = contacts?.[i];
            const phone = contact?.wa_id ?? message.from;
            const name = contact?.profile?.name ?? phone;
            const messageId = message.id;

            // Deduplicate
            const { count } = await adminDb.from('messages').select('id', { count: 'exact', head: true }).eq('meta_message_id', messageId);
            if (count && count > 0) continue;

            // ── Survey button reply ───────────────────────────────
            if (message.type === 'interactive' && message.interactive?.type === 'button_reply') {
              const buttonId: string = message.interactive.button_reply.id;
              // Expected format: SURVEY_{rating}_RES_{reservationId}
              const match = buttonId.match(/^SURVEY_(\d+)_RES_([\w-]+)$/);
              if (match) {
                const rating = parseInt(match[1], 10);
                const reservationId = match[2];

                // Get prospect_id from the reservation
                const { data: reservation } = await adminDb
                  .from('reservations')
                  .select('prospect_id')
                  .eq('id', reservationId)
                  .single();

                if (reservation) {
                  // Upsert satisfaction survey (idempotent)
                  await adminDb.from('satisfaction_surveys').upsert(
                    {
                      reservation_id: reservationId,
                      prospect_id: reservation.prospect_id,
                      rating,
                    },
                    { onConflict: 'reservation_id' }
                  );
                }

                // Mark campaign_send as replied
                await adminDb
                  .from('campaign_sends')
                  .update({ status: 'replied', updated_at: new Date().toISOString() })
                  .eq('phone_number', phone)
                  .in('status', ['sent', 'delivered', 'read']);

                continue; // Don't process through chatbot
              }
            }

            // ── Regular text message through chatbot ──────────────
            if (message.type !== 'text') continue;

            const textContent = message.text.body;

            const { conversationId, botStatus, flow, history } = await getOrCreateConversation(phone, name, textContent);
            await saveMessage(conversationId, 'prospect', textContent, messageId);

            // Check if phone belongs to a campaign_send and update to replied
            await adminDb
              .from('campaign_sends')
              .update({ status: 'replied', updated_at: new Date().toISOString() })
              .eq('phone_number', phone)
              .in('status', ['sent', 'delivered', 'read']);

            // Auto-create prospect if external number not yet tracked
            // (The prospect is created in getOrCreateConversation)

            if (botStatus === 'paused') continue;

            if (!flow) {
              const reply = 'Hola, soy el asistente virtual de Panoramex. ¿Sobre qué tour te gustaría información? (ej. Tequila Express, José Cuervo, City Tour)';
              await sendWhatsAppMessage(phoneNumberId, process.env.META_ACCESS_TOKEN || '', phone, reply);
              await saveMessage(conversationId, 'bot', reply);
              continue;
            }

            const { reply, handoff, completed } = await generateResponse(flow, history, textContent);

            if (reply) {
              await sendWhatsAppMessage(phoneNumberId, process.env.META_ACCESS_TOKEN || '', phone, reply);
              await saveMessage(conversationId, 'bot', reply);
            }

            if (handoff || completed) {
              await pauseConversation(conversationId);
            }
          }
        }
      }
    }

    await adminDb.from('webhook_events').update({ status: 'completed' }).eq('id', event.id);

  } catch (error: any) {
    console.error('Error processing webhook:', error);
  }
}
