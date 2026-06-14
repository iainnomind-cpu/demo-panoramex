// ============================================================
// PANORAMEX CRM — Mock Data: Campañas
// ============================================================

import { Campaign } from '../types'

export const campaigns: Campaign[] = [
  {
    id: 'c1',
    nombre: 'Reactivación Tren Julio',
    estado: 'activa',
    segmento: {
      tour_ids: ['t1'],
      estados: ['sin_respuesta'],
    },
    mensaje_template:
      '¡Hola {nombre}! 👋 Todavía hay lugares para el Tren José Cuervo de este sábado. ¿Te animás? 🚂',
    metricas: {
      enviados: 47,
      leidos: 32,
      respondidos: 18,
      conversiones: 7,
    },
    created_at: '2024-07-15T08:00:00.000Z',
  },
  {
    id: 'c2',
    nombre: 'Promoción Chapala Agosto',
    estado: 'programada',
    segmento: {
      tour_ids: ['t3'],
      estados: ['convertido'],
    },
    mensaje_template:
      '¡{nombre}, te encantó el viaje! 🌊 En agosto tenemos el Tour Chapala con precio especial para clientes frecuentes.',
    fecha_envio: '2024-08-01T10:00:00.000Z',
    metricas: {
      enviados: 0,
      leidos: 0,
      respondidos: 0,
      conversiones: 0,
    },
    created_at: '2024-07-28T14:00:00.000Z',
  },
  {
    id: 'c3',
    nombre: 'Bienvenida Ciudad',
    estado: 'completada',
    segmento: {
      canales: ['facebook', 'instagram'],
    },
    mensaje_template:
      'Bienvenido a Panoramex, {nombre}. Somos la operadora turística #1 de Guadalajara. ¿Qué destino te llama? 📍',
    fecha_envio: '2024-07-01T09:00:00.000Z',
    metricas: {
      enviados: 120,
      leidos: 89,
      respondidos: 34,
      conversiones: 12,
    },
    created_at: '2024-06-28T10:00:00.000Z',
  },
  {
    id: 'c4',
    nombre: 'Flash Lucha Libre Viernes',
    estado: 'borrador',
    segmento: {
      tour_ids: ['t6'],
    },
    mensaje_template:
      '¡Esta noche hay Lucha Libre! 🥊 Quedan 4 lugares. ¿Te apuntas, {nombre}?',
    metricas: {
      enviados: 0,
      leidos: 0,
      respondidos: 0,
      conversiones: 0,
    },
    created_at: '2024-07-30T11:00:00.000Z',
  },
]
