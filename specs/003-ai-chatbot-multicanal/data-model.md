# Data Model: Chatbot IA Multicanal

## Tables to Add/Modify

### 1. `webhook_events` (New)
Acts as an outbox/inbox to guarantee message processing even if the LLM or Vercel functions time out.
- `id`: UUID (Primary Key)
- `payload`: JSONB (The raw webhook body from Meta)
- `status`: TEXT ('pending', 'processing', 'completed', 'failed')
- `error`: TEXT (Nullable, error message if failed)
- `created_at`: TIMESTAMPTZ

### 2. `conversations` (New)
Groups messages and holds the active state for the chatbot.
- `id`: UUID (Primary Key)
- `prospect_id`: UUID (Foreign Key to `prospects.id`)
- `bot_status`: TEXT ('active', 'paused') - Tracks if the bot is currently handling this conversation or if it was handed off to a human.
- `current_flow`: TEXT (e.g., 'tequila_express_qualification')
- `flow_state`: JSONB (Stores what questions have been asked/answered)
- `last_activity_at`: TIMESTAMPTZ

### 3. `messages` (New)
Stores actual chat history.
- `id`: UUID (Primary Key)
- `conversation_id`: UUID (Foreign Key to `conversations.id`)
- `sender_type`: TEXT ('prospect', 'bot', 'agent')
- `agent_id`: UUID (Nullable, Foreign Key to `agents.id`)
- `content`: TEXT
- `media_url`: TEXT (Nullable)
- `media_type`: TEXT (Nullable)
- `meta_message_id`: TEXT (For deduplication and tracking delivery status)
- `send_status`: TEXT ('pending', 'sent', 'delivered', 'read', 'failed', 'rate_limited') - Para manejo de backoff y retries.
- `retry_count`: INT (Default 0) - Contador para backoff exponencial.
- `next_retry_at`: TIMESTAMPTZ (Nullable) - Para encolar reintentos en caso de rate limits.
- `created_at`: TIMESTAMPTZ

### Modifications to `prospects`
- Update `origin_channel` to strictly enum/accept 'whatsapp', 'ctwa_facebook', 'ctwa_instagram', 'web'.
- Add `whatsapp_number`: TEXT (To match incoming webhook phone numbers to prospects).
