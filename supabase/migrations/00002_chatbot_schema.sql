-- Migration 00002: Chatbot IA Multicanal Schema

-- 1. Create webhook_events table (In/Outbox)
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for webhook_events
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- 2. Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prospect_id UUID NOT NULL REFERENCES public.prospects(id) ON DELETE CASCADE,
    bot_status TEXT NOT NULL DEFAULT 'active',
    current_flow TEXT,
    flow_state JSONB DEFAULT '{}'::jsonb,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for conversations
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- 3. Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL,
    agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
    content TEXT,
    media_url TEXT,
    media_type TEXT,
    meta_message_id TEXT,
    send_status TEXT NOT NULL DEFAULT 'pending',
    retry_count INT NOT NULL DEFAULT 0,
    next_retry_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 4. Alter prospects table
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS origin_channel TEXT;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- Optionally, add constraints to origin_channel (commented out to avoid breaking existing data if any, but good for future)
-- ALTER TABLE public.prospects ADD CONSTRAINT check_origin_channel CHECK (origin_channel IN ('whatsapp', 'ctwa_facebook', 'ctwa_instagram', 'web'));

-- Add RLS Policies

-- Webhook Events (Only Service Role / Backend can insert/update)
CREATE POLICY "Service Role Full Access to Webhook Events" ON public.webhook_events
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Conversations (Agents can view and update conversations of their prospects)
CREATE POLICY "Agents can view all conversations" ON public.conversations
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Agents can update all conversations" ON public.conversations
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Messages (Agents can view and insert messages)
CREATE POLICY "Agents can view all messages" ON public.messages
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Agents can insert messages" ON public.messages
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
