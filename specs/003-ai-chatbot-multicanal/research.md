# Research: Chatbot IA Multicanal

## Async Processing in Vercel Serverless Functions
**Decision**: Use `waitUntil` (Vercel's standard method for background work in serverless functions) combined with an "outbox" table in Supabase for resilience.
**Rationale**: Vercel functions typically kill background processes when the response is sent. `waitUntil` allows background tasks to finish after returning the HTTP response. For high volume, saving the incoming webhook to a `webhook_events` table synchronously and then processing it asynchronously ensures no data loss if the LLM is slow.
**Alternatives considered**: Upstash QStash (adds another dependency), Vercel Inngest (adds dependency). `waitUntil` + Supabase is built-in and adheres to the current stack.

## Meta WhatsApp Webhook Security
**Decision**: Verify `X-Hub-Signature-256` in the Edge/Serverless function before processing.
**Rationale**: Required by Meta. We will use the `crypto` module to compute the HMAC SHA-256 of the raw body using the Meta App Secret.
**Alternatives considered**: Unauthenticated webhooks (insecure).

## LLM API Integration
**Decision**: Use OpenAI SDK directly from the Node.js backend.
**Rationale**: Strict requirement to keep API keys secure. Vercel backend handles the API call, formatting the prompt with the conversation history fetched from the `messages` table.

## Conversation State Management
**Decision**: State machine driven by `interactions_timeline` and `prospects.status`. 
**Rationale**: The current step in the flow (e.g., waiting for date, waiting for pax) can be inferred from the last interaction or stored in `metadata` on the `prospects` table.
