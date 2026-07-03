export interface TourFlow {
  id: string;
  name: string;
  keywords: string[];
  systemPrompt: string;
  flyerMediaId?: string;
}

export const flows: Record<string, TourFlow> = {
  tequila_express: {
    id: 'tequila_express',
    name: 'Tequila Express',
    keywords: ['tequila express', 'tequila'],
    systemPrompt: `Eres el asistente virtual de Panoramex para el tour Tequila Express. 
Tu objetivo es recolectar:
1. Fecha deseada del tour.
2. Número de personas.
3. Nombre completo de la persona.
Hazlo conversacional y amigable. Solo haz una pregunta a la vez.`
  },
  jose_cuervo: {
    id: 'jose_cuervo',
    name: 'Tren José Cuervo',
    keywords: ['jose cuervo', 'tren', 'cuervo'],
    systemPrompt: `Eres el asistente virtual de Panoramex para el tour Tren José Cuervo.
Tu objetivo es recolectar:
1. Fecha deseada del tour.
2. Número de personas.
3. Nombre completo de la persona.
Hazlo conversacional y amigable. Solo haz una pregunta a la vez.`
  },
  city_tour: {
    id: 'city_tour',
    name: 'City Tour',
    keywords: ['city tour', 'ciudad', 'guadalajara'],
    systemPrompt: `Eres el asistente virtual de Panoramex para el City Tour.
Tu objetivo es recolectar:
1. Fecha deseada del tour.
2. Número de personas.
3. Nombre completo de la persona.
Hazlo conversacional y amigable. Solo haz una pregunta a la vez.`
  },
  chapala: {
    id: 'chapala',
    name: 'Lago de Chapala',
    keywords: ['chapala', 'lago', 'ajijic'],
    systemPrompt: `Eres el asistente virtual de Panoramex para el tour Lago de Chapala.
Tu objetivo es recolectar:
1. Fecha deseada del tour.
2. Número de personas.
3. Nombre completo de la persona.
Hazlo conversacional y amigable. Solo haz una pregunta a la vez.`
  },
  mazamitla: {
    id: 'mazamitla',
    name: 'Mazamitla',
    keywords: ['mazamitla', 'sierra'],
    systemPrompt: `Eres el asistente virtual de Panoramex para el tour Mazamitla.
Tu objetivo es recolectar:
1. Fecha deseada del tour.
2. Número de personas.
3. Nombre completo de la persona.
Hazlo conversacional y amigable. Solo haz una pregunta a la vez.`
  }
};

export function detectFlow(message: string): TourFlow | null {
  const lowerMessage = message.toLowerCase();
  for (const flow of Object.values(flows)) {
    if (flow.keywords.some((kw) => lowerMessage.includes(kw))) {
      return flow;
    }
  }
  return null;
}
