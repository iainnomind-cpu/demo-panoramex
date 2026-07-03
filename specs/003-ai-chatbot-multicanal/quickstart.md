# Quickstart: Chatbot Validation Guide

This guide explains how to validate the Chatbot backend logic locally without exposing it to the real Meta API initially.

## Prerequisites
1. Local Supabase running (`supabase start` or connection to remote dev DB).
2. Local Vercel dev server running (`npx vercel dev` or just `npm run dev`).

## 1. Webhook Verification Test
Meta sends a GET request to verify the webhook endpoint.

```bash
# Simulate Meta Webhook Verification
curl -X GET "http://localhost:3000/api/webhook?hub.mode=subscribe&hub.challenge=1158201444&hub.verify_token=YOUR_VERIFY_TOKEN"
```
**Expected Outcome**: Returns HTTP 200 with `1158201444` in the response body.

## 2. Inbound Message Processing
Meta sends a POST request when a user messages the bot. To bypass `X-Hub-Signature-256` validation during local dev, you can temporarily disable the check or generate a valid HMAC using your `META_APP_SECRET`.

```bash
# Simulate an incoming message
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: sha256=MOCK_SIGNATURE_IF_DISABLED" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "display_phone_number": "1234567890",
            "phone_number_id": "PHONE_NUMBER_ID"
          },
          "contacts": [{
            "profile": {"name": "Test User"},
            "wa_id": "5213312345678"
          }],
          "messages": [{
            "from": "5213312345678",
            "id": "wamid.HBgL...",
            "timestamp": "1719543200",
            "text": {"body": "Hola, me interesa el Tren Jose Cuervo"},
            "type": "text"
          }]
        },
        "field": "messages"
      }]
    }]
  }'
```
**Expected Outcome**:
1. Returns HTTP 200 immediately.
2. Creates an entry in `webhook_events`.
3. Creates a record in `conversations` and `prospects` if it's a new number.
4. Generates an outgoing response via the LLM to ask for date, pax, or send the flyer if complete.
