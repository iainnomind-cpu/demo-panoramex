// ============================================================
// PANORAMEX CRM — Mock Data: Conversaciones
// ============================================================

import { Message, Conversation } from '../types'

// ── Conversación 1: Jorge Álvarez — Tren José Cuervo (p1) ──
const mensajes_p1: Message[] = [
  {
    id: 'm1-1',
    conversacion_id: 'conv1',
    tipo: 'entrante',
    contenido:
      '¡Hola! Vi en Instagram lo del Tren José Cuervo y me interesa muchísimo. ¿Cuánto cuesta para dos personas?',
    timestamp: '2024-07-28T09:15:00.000Z',
    leido: true,
  },
  {
    id: 'm1-2',
    conversacion_id: 'conv1',
    tipo: 'evento',
    contenido: 'Asignado a Cianya López',
    timestamp: '2024-07-28T09:17:00.000Z',
    leido: true,
  },
  {
    id: 'm1-3',
    conversacion_id: 'conv1',
    tipo: 'saliente',
    contenido:
      '¡Hola Jorge! 👋 Soy Cianya de Panoramex. ¡Qué gusto que te interese el Tren! Es nuestra experiencia más icónica 🚂✨\n\nTenemos 3 clases:\n🥉 Clase Base: $3,890 por persona\n🥈 Clase Premium: $4,390 por persona\n💎 Clase Diamante: $4,990 por persona\n\n¿Para qué fecha tenías pensado ir?',
    timestamp: '2024-07-28T09:22:00.000Z',
    leido: true,
    agente_id: 'a1',
  },
  {
    id: 'm1-4',
    conversacion_id: 'conv1',
    tipo: 'entrante',
    contenido:
      '¡Gracias Cianya! Andamos pensando en el 17 de agosto. ¿Hay disponibilidad? Y ¿qué diferencia hay entre Premium y Diamante?',
    timestamp: '2024-07-28T09:35:00.000Z',
    leido: true,
  },
  {
    id: 'm1-5',
    conversacion_id: 'conv1',
    tipo: 'saliente',
    contenido:
      'Para el 17 de agosto sí hay disponibilidad 🎉\n\n🥈 *Premium* incluye asiento preferencial, snack a bordo y copa de bienvenida.\n💎 *Diamante* agrega acceso al vagón exclusivo, cata premium de 5 tequilas y mesa privada en la destilería.\n\nAmbas incluyen el tren ida y vuelta, recorrido por la destilería José Cuervo y tiempo libre en el Pueblo Mágico de Tequila.\n\n¿Les gustaría apartar lugares? Con gusto te mando los datos de pago 😊',
    timestamp: '2024-07-28T09:48:00.000Z',
    leido: true,
    agente_id: 'a1',
  },
  {
    id: 'm1-6',
    conversacion_id: 'conv1',
    tipo: 'entrante',
    contenido: 'Órale, creo que vamos con Premium. ¿Cómo apartamos?',
    timestamp: '2024-07-28T10:05:00.000Z',
    leido: true,
  },
  {
    id: 'm1-7',
    conversacion_id: 'conv1',
    tipo: 'saliente',
    contenido:
      '¡Excelente elección! 🎊 Para apartar los 2 lugares en clase Premium (2 × $4,390 = *$8,780*), necesitamos un depósito del 50% ($4,390) a:\n\n🏦 BBVA — CLABE: 012 320 00123456789 0\n👤 Panoramex Tours SA de CV\n\nUna vez que nos confirmes el pago te mandamos tu voucher oficial. ¿Tienes alguna pregunta más, Jorge?',
    timestamp: '2024-07-28T10:12:00.000Z',
    leido: false,
    agente_id: 'a1',
  },
]

// ── Conversación 2: María Fernández — Chapala & Ajijic (p2) ──
const mensajes_p2: Message[] = [
  {
    id: 'm2-1',
    conversacion_id: 'conv2',
    tipo: 'entrante',
    contenido:
      'Buenas tardes, vi en Facebook el tour a Chapala. Somos 4 personas. ¿Hacen el tour cualquier día?',
    timestamp: '2024-07-29T11:30:00.000Z',
    leido: true,
  },
  {
    id: 'm2-2',
    conversacion_id: 'conv2',
    tipo: 'evento',
    contenido: 'Asignado a Ana Silva',
    timestamp: '2024-07-29T11:32:00.000Z',
    leido: true,
  },
  {
    id: 'm2-3',
    conversacion_id: 'conv2',
    tipo: 'saliente',
    contenido:
      '¡Hola María! Soy Ana de Panoramex 🌊 El Tour Lago de Chapala & Ajijic opera los miércoles, sábados y domingos. ¿Tienen algún día preferido?',
    timestamp: '2024-07-29T11:45:00.000Z',
    leido: true,
    agente_id: 'a2',
  },
  {
    id: 'm2-4',
    conversacion_id: 'conv2',
    tipo: 'entrante',
    contenido: 'El domingo 25 de agosto nos vendría muy bien.',
    timestamp: '2024-07-29T12:00:00.000Z',
    leido: true,
  },
  {
    id: 'm2-5',
    conversacion_id: 'conv2',
    tipo: 'saliente',
    contenido:
      '¡Perfecto! El domingo 25 de agosto tiene disponibilidad para 4 personas 😊\n\nEl costo sería *$1,150 × 4 = $4,600* e incluye transporte desde GDL, guía local, paseo por el malecón de Chapala y el pintoresco pueblo de Ajijic. También pueden optar por el paseo en lancha como actividad extra.\n\nSalida: 08:30 hrs | Regreso: 16:30 hrs aprox.\n\n¿Les interesa apartar el lugar?',
    timestamp: '2024-07-29T12:15:00.000Z',
    leido: true,
    agente_id: 'a2',
  },
  {
    id: 'm2-6',
    conversacion_id: 'conv2',
    tipo: 'entrante',
    contenido: 'Suena bien. ¿El paseo en lancha tiene costo extra?',
    timestamp: '2024-07-29T12:30:00.000Z',
    leido: true,
  },
  {
    id: 'm2-7',
    conversacion_id: 'conv2',
    tipo: 'saliente',
    contenido:
      'Sí, el paseo en lancha tiene un costo adicional de $200 por persona, pagadero directo al operador local en el lago. Dura unos 30 minutos y las vistas son increíbles 🚤🏔️\n\nSi gustan incluirlo en el paquete nosotros lo coordinamos con anticipación. ¿Les apunto?',
    timestamp: '2024-07-29T12:45:00.000Z',
    leido: false,
    agente_id: 'a2',
  },
]

// ── Conversación 3: Roberto Gómez — Lucha Libre (p3) ──
const mensajes_p3: Message[] = [
  {
    id: 'm3-1',
    conversacion_id: 'conv3',
    tipo: 'entrante',
    contenido:
      'Hola! Vi el reel de la Lucha Libre 😂 me morí. ¿Cuándo es el próximo evento y cuánto cuesta?',
    timestamp: '2024-07-30T14:00:00.000Z',
    leido: true,
  },
  {
    id: 'm3-2',
    conversacion_id: 'conv3',
    tipo: 'evento',
    contenido: 'Asignado a Carlos Ruiz',
    timestamp: '2024-07-30T14:02:00.000Z',
    leido: true,
  },
  {
    id: 'm3-3',
    conversacion_id: 'conv3',
    tipo: 'saliente',
    contenido:
      '¡Jajaja qué bueno que te gustó el reel! 🥊 Soy Carlos de Panoramex. El próximo Tour Lucha Libre es este *viernes y domingo*. Sale de GDL a las 18:30 hrs y regresa alrededor de las 22:30 hrs.\n\nEl costo es de *$650 por persona* e incluye transporte, boleto al evento y guía. ¿Cuántas personas son?',
    timestamp: '2024-07-30T14:10:00.000Z',
    leido: true,
    agente_id: 'a3',
  },
  {
    id: 'm3-4',
    conversacion_id: 'conv3',
    tipo: 'entrante',
    contenido: 'Seríamos 3. Para el viernes. ¿Cómo pagamos?',
    timestamp: '2024-07-30T14:25:00.000Z',
    leido: true,
  },
  {
    id: 'm3-5',
    conversacion_id: 'conv3',
    tipo: 'saliente',
    contenido:
      '¡Perfecto, 3 lugares para el viernes! El total sería *$1,950*.\n\nTransferencia a:\n🏦 Banorte — CLABE: 072 320 00987654321 0\n👤 Panoramex Tours SA de CV\n\nMándanos comprobante por aquí y te enviamos su voucher de inmediato 🎟️',
    timestamp: '2024-07-30T14:32:00.000Z',
    leido: false,
    agente_id: 'a3',
  },
]

// ── Conversación 4: Carlos Mendoza — Tren (p9) ──
const mensajes_p9: Message[] = [
  {
    id: 'm9-1',
    conversacion_id: 'conv4',
    tipo: 'entrante',
    contenido:
      'Buen día, me recomendaron con ustedes para el Tren a Tequila. Tengo boda el 3 de agosto y quiero hacer algo especial con mi pareja el día anterior.',
    timestamp: '2024-07-15T09:00:00.000Z',
    leido: true,
  },
  {
    id: 'm9-2',
    conversacion_id: 'conv4',
    tipo: 'evento',
    contenido: 'Asignado a Carlos Ruiz',
    timestamp: '2024-07-15T09:03:00.000Z',
    leido: true,
  },
  {
    id: 'm9-3',
    conversacion_id: 'conv4',
    tipo: 'saliente',
    contenido:
      '¡Hola Carlos! Soy Carlos de Panoramex 😊 ¡Muchas felicidades por tu próxima boda! Para una ocasión tan especial te recomendaría sin duda la *Clase Diamante* del Tren José Cuervo. ¿El sábado 3 de agosto o prefieres el anterior, 27 de julio?',
    timestamp: '2024-07-15T09:15:00.000Z',
    leido: true,
    agente_id: 'a3',
  },
  {
    id: 'm9-4',
    conversacion_id: 'conv4',
    tipo: 'entrante',
    contenido: 'El sábado 3. ¿Tienen algo especial para bodas o aniversarios?',
    timestamp: '2024-07-15T09:30:00.000Z',
    leido: true,
  },
  {
    id: 'm9-5',
    conversacion_id: 'conv4',
    tipo: 'saliente',
    contenido:
      '¡Claro que sí! Para parejas en celebración coordinamos:\n🍾 Botella de cava en la mesa\n🌹 Arreglo floral en tu asiento\n📸 Sesión de fotos en campos de agave\n\nEl paquete Diamante + celebración especial sería *$5,490 por persona*. ¿Te mando una cotización formal por correo?',
    timestamp: '2024-07-15T10:00:00.000Z',
    leido: true,
    agente_id: 'a3',
  },
  {
    id: 'm9-6',
    conversacion_id: 'conv4',
    tipo: 'entrante',
    contenido: 'Sí por favor, el correo es carlos.mendoza@outlook.com',
    timestamp: '2024-07-15T10:10:00.000Z',
    leido: true,
  },
  {
    id: 'm9-7',
    conversacion_id: 'conv4',
    tipo: 'saliente',
    contenido:
      'Perfecto, te acabo de enviar la cotización a tu correo con todos los detalles 📧 Recuerda que los lugares se apartan con el 50% de anticipo. ¿Tienes alguna duda?',
    timestamp: '2024-07-15T10:45:00.000Z',
    leido: true,
    agente_id: 'a3',
  },
  {
    id: 'm9-8',
    conversacion_id: 'conv4',
    tipo: 'entrante',
    contenido: 'Ya la revisé, todo bien. Espero confirmar esta semana.',
    timestamp: '2024-07-28T17:00:00.000Z',
    leido: true,
  },
]

// ── Conversación 5: Laura Martínez — Tren Premium (p4) ──
const mensajes_p4: Message[] = [
  {
    id: 'm4-1',
    conversacion_id: 'conv5',
    tipo: 'entrante',
    contenido:
      'Hola buenas! Quiero información del Tren José Cuervo para el 10 de agosto. Somos 2 personas.',
    timestamp: '2024-07-20T08:00:00.000Z',
    leido: true,
  },
  {
    id: 'm4-2',
    conversacion_id: 'conv5',
    tipo: 'evento',
    contenido: 'Asignado a Cianya López',
    timestamp: '2024-07-20T08:05:00.000Z',
    leido: true,
  },
  {
    id: 'm4-3',
    conversacion_id: 'conv5',
    tipo: 'saliente',
    contenido:
      '¡Hola Laura! Soy Cianya 😊 Para el 10 de agosto tenemos disponibilidad. ¿Es una ocasión especial?',
    timestamp: '2024-07-20T08:20:00.000Z',
    leido: true,
    agente_id: 'a1',
  },
  {
    id: 'm4-4',
    conversacion_id: 'conv5',
    tipo: 'entrante',
    contenido:
      'Sí, es nuestro aniversario. Quisiéramos algo especial, clase diamante si se puede.',
    timestamp: '2024-07-20T08:35:00.000Z',
    leido: true,
  },
  {
    id: 'm4-5',
    conversacion_id: 'conv5',
    tipo: 'saliente',
    contenido:
      '¡Qué romántico! 💑✨ Para aniversarios en Clase Diamante podemos incluir una sorpresa especial a bordo. El costo sería *$4,990 × 2 = $9,980*. ¿Te interesa que te arme un paquete especial de aniversario?',
    timestamp: '2024-07-20T08:50:00.000Z',
    leido: true,
    agente_id: 'a1',
  },
  {
    id: 'm4-6',
    conversacion_id: 'conv5',
    tipo: 'entrante',
    contenido: 'Sí, por favor! Que incluya algo especial. ¿Hacen decoración?',
    timestamp: '2024-07-27T16:45:00.000Z',
    leido: true,
  },
  {
    id: 'm4-7',
    conversacion_id: 'conv5',
    tipo: 'saliente',
    contenido:
      '¡Claro! Coordinamos decoración en el vagón, flores, carta personalizada y cava de cortesía 🥂🌹 Te mando los detalles completos. ¡Este aniversario va a ser inolvidable!',
    timestamp: '2024-07-27T17:00:00.000Z',
    leido: false,
    agente_id: 'a1',
  },
]

export const conversations: Conversation[] = [
  {
    id: 'conv1',
    prospect_id: 'p1',
    mensajes: mensajes_p1,
    ultima_actividad: '2024-07-28T10:12:00.000Z',
    no_leidos: 1,
  },
  {
    id: 'conv2',
    prospect_id: 'p2',
    mensajes: mensajes_p2,
    ultima_actividad: '2024-07-29T12:45:00.000Z',
    no_leidos: 1,
  },
  {
    id: 'conv3',
    prospect_id: 'p3',
    mensajes: mensajes_p3,
    ultima_actividad: '2024-07-30T14:32:00.000Z',
    no_leidos: 1,
  },
  {
    id: 'conv4',
    prospect_id: 'p9',
    mensajes: mensajes_p9,
    ultima_actividad: '2024-07-28T17:00:00.000Z',
    no_leidos: 0,
  },
  {
    id: 'conv5',
    prospect_id: 'p4',
    mensajes: mensajes_p4,
    ultima_actividad: '2024-07-27T17:00:00.000Z',
    no_leidos: 1,
  },
]
