import { waitUntil } from '@vercel/functions';
import { verifyMetaSignature } from '../bot/crypto';
import { adminDb } from '../bot/supabase';
import { getOrCreateConversation, saveMessage, pauseConversation } from '../bot/state';
import { generateResponse } from '../bot/llm';
import { sendWhatsAppMessage } from '../utils/whatsapp';
import { checkRateLimit } from '../../src/lib/rateLimit';

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
  // Rate Limiting Básico (Max 50 reqs / 10 segs por IP)
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip, 50, 10000)) {
    console.warn(`Rate limit exceeded for IP: ${ip}`);
    return new Response('Too Many Requests', { status: 429 });
  }

  const payload = await req.text();
  const signature = req.headers.get('x-hub-signature-256');

  if (!verifyMetaSignature(payload, signature, process.env.META_APP_SECRET || '')) {
    return new Response('Invalid signature', { status: 401 });
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
      .from('organization_settings')
      .select('system_status')
      .limit(1)
      .single();

    if (orgSettings?.system_status === 'paused') {
      console.warn('System is paused. Webhook payload will not be processed.');
      return;
    }

    // 1. Log event
    const { data: event } = await adminDb.from('webhook_events').insert({ payload: body }).select('id').single();
    if (!event) return;

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
