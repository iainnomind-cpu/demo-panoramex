import OpenAI from 'openai';
import { TourFlow } from './flows.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateResponse(
  flow: TourFlow,
  history: { role: 'user' | 'assistant' | 'system'; content: string }[],
  userMessage: string
): Promise<{ reply: string; handoff: boolean; completed: boolean }> {
  // Check for opt-out or explicit handoff early
  const lowerMsg = userMessage.toLowerCase();
  if (['stop', 'darse de baja', 'cancelar'].includes(lowerMsg.trim())) {
    return { reply: 'Entendido, no te enviaremos más mensajes. Si necesitas ayuda, escribe "asesor".', handoff: true, completed: false };
  }
  if (lowerMsg.includes('humano') || lowerMsg.includes('asesor') || lowerMsg.includes('agente')) {
    return { reply: 'Te estoy transfiriendo con un asesor humano en un momento.', handoff: true, completed: false };
  }

  const systemMessage = {
    role: 'system' as const,
    content: `${flow.systemPrompt}\n\nREGLAS ESTRICTAS:
- Si el usuario muestra frustración o pide un humano, incluye la frase "[HANDOFF]".
- Si ya recolectaste Fecha, Personas y Nombre, despídete diciendo "[COMPLETED] ¡Gracias! En un momento te enviaremos la información."
- No inventes precios ni disponibilidad.`
  };

  const messages = [systemMessage, ...history, { role: 'user' as const, content: userMessage }];

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: messages,
    temperature: 0.3,
  });

  const replyText = response.choices[0].message?.content || '';

  const handoff = replyText.includes('[HANDOFF]');
  const completed = replyText.includes('[COMPLETED]');
  
  const cleanReply = replyText.replace('[HANDOFF]', '').replace('[COMPLETED]', '').trim();

  return { reply: cleanReply, handoff, completed };
}
