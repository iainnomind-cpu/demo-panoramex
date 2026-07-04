import { adminDb } from './supabase';
import { TourFlow, detectFlow } from './flows';

export async function getOrCreateConversation(
  phone: string,
  contactName: string,
  initialMessage: string
): Promise<{ conversationId: string; botStatus: string; flow: TourFlow | null; history: any[] }> {
  
  // Find prospect by phone
  let { data: prospects } = await adminDb
    .from('prospects')
    .select('id')
    .eq('whatsapp_number', phone)
    .limit(1);

  let prospectId: string;

  if (!prospects || prospects.length === 0) {
    // Create new prospect
    const { data: newProspect, error } = await adminDb
      .from('prospects')
      .insert({ name: contactName, phone, whatsapp_number: phone, status: 'new' })
      .select()
      .single();
    
    if (error || !newProspect) throw new Error('Could not create prospect');
    prospectId = newProspect.id;
  } else {
    prospectId = prospects[0].id;
  }

  // Find active conversation
  let { data: conversations } = await adminDb
    .from('conversations')
    .select('*')
    .eq('prospect_id', prospectId)
    .order('created_at', { ascending: false })
    .limit(1);

  let conversationId: string;
  let botStatus = 'active';
  let currentFlowId: string | null = null;

  if (!conversations || conversations.length === 0) {
    // Create conversation
    const detectedFlow = detectFlow(initialMessage);
    currentFlowId = detectedFlow?.id || null;

    const { data: newConv, error } = await adminDb
      .from('conversations')
      .insert({
        prospect_id: prospectId,
        bot_status: 'active',
        current_flow: currentFlowId
      })
      .select()
      .single();

    if (error || !newConv) throw new Error('Could not create conversation');
    conversationId = newConv.id;
  } else {
    const conv = conversations[0];
    conversationId = conv.id;
    botStatus = conv.bot_status;
    currentFlowId = conv.current_flow;

    if (!currentFlowId && botStatus === 'active') {
      const detectedFlow = detectFlow(initialMessage);
      if (detectedFlow) {
        currentFlowId = detectedFlow.id;
        await adminDb.from('conversations').update({ current_flow: currentFlowId }).eq('id', conversationId);
      }
    }
  }

  // Get history
  const { data: messages } = await adminDb
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  const history = (messages || []).map(m => ({
    role: m.sender_type === 'prospect' ? 'user' : 'assistant',
    content: m.content || ''
  }));

  const { flows } = await import('./flows');
  const flow = currentFlowId ? flows[currentFlowId] : null;

  return { conversationId, botStatus, flow, history };
}

export async function pauseConversation(conversationId: string) {
  await adminDb.from('conversations').update({ bot_status: 'paused' }).eq('id', conversationId);
}

export async function saveMessage(
  conversationId: string,
  senderType: 'prospect' | 'bot' | 'agent',
  content: string,
  metaMessageId?: string
) {
  await adminDb.from('messages').insert({
    conversation_id: conversationId,
    sender_type: senderType,
    content: content,
    meta_message_id: metaMessageId
  });
}
