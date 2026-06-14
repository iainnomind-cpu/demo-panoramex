// ============================================================
// PANORAMEX CRM — TypeScript Types & Interfaces
// ============================================================

export type ProspectStatus =
  | 'nuevo'
  | 'en_proceso'
  | 'calificado'
  | 'sin_respuesta'
  | 'reservado'
  | 'convertido'
  | 'perdido'

export type Channel = 'whatsapp' | 'facebook' | 'instagram' | 'telefono' | 'web'

export type TourCategory =
  | 'tren'
  | 'pueblos_magicos'
  | 'cultural'
  | 'aventura'
  | 'privado'
  | 'gastronomia'

export interface Agent {
  id: string
  nombre: string
  apellido: string
  iniciales: string
  rol: 'asesor' | 'directivo'
  email: string
  avatar?: string
  prospectos_activos: number
  color: string // para avatar placeholder
}

export interface Tour {
  id: string
  nombre: string
  categoria: TourCategory
  descripcion: string
  ubicacion: string
  precio_base: number
  precio_premium?: number
  precio_diamante?: number
  duracion_horas: number
  capacidad_max: number
  capacidad_min: number
  dias_disponibles: string[]
  horario_salida: string
  horario_regreso: string
  incluye: string[]
  imagen: string
  activo: boolean
  destacado: boolean
}

export interface Prospect {
  id: string
  nombre: string
  apellido: string
  telefono: string
  email?: string
  canal: Channel
  tour_interes_id: string
  fecha_deseada?: string
  num_personas: number
  estado: ProspectStatus
  agente_id?: string
  notas?: string
  created_at: string
  ultima_actividad: string
  campana_origen?: string
  etiquetas: string[]
}

export interface Message {
  id: string
  conversacion_id: string
  tipo: 'entrante' | 'saliente' | 'nota' | 'evento'
  contenido: string
  timestamp: string
  leido: boolean
  agente_id?: string
}

export interface Conversation {
  id: string
  prospect_id: string
  mensajes: Message[]
  ultima_actividad: string
  no_leidos: number
}

export interface Reservation {
  id: string
  prospect_id: string
  tour_id: string
  fecha_tour: string
  num_personas: number
  agente_id: string
  monto_total: number
  deposito_pagado: number
  metodo_pago?: string
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada'
  notas?: string
  created_at: string
}

export interface Campaign {
  id: string
  nombre: string
  estado: 'borrador' | 'programada' | 'activa' | 'completada'
  segmento: {
    tour_ids?: string[]
    estados?: ProspectStatus[]
    canales?: Channel[]
    dias_sin_actividad?: number
  }
  mensaje_template: string
  fecha_envio?: string
  metricas: {
    enviados: number
    leidos: number
    respondidos: number
    conversiones: number
  }
  created_at: string
}

// UI Types
export interface StatusConfig {
  label: string
  color: string
  bg: string
  border: string
  icon: string
}

export const STATUS_CONFIG: Record<ProspectStatus, StatusConfig> = {
  nuevo: {
    label: 'NUEVO',
    color: '#6B7280',
    bg: '#F3F4F6',
    border: '#6B7280',
    icon: 'fiber_new',
  },
  en_proceso: {
    label: 'EN PROCESO',
    color: '#D97706',
    bg: '#FEF3C7',
    border: '#D97706',
    icon: 'pending',
  },
  calificado: {
    label: 'CALIFICADO',
    color: '#16A34A',
    bg: '#DCFCE7',
    border: '#16A34A',
    icon: 'verified',
  },
  sin_respuesta: {
    label: 'SIN RESPUESTA',
    color: '#DC2626',
    bg: '#FEE2E2',
    border: '#DC2626',
    icon: 'do_not_disturb',
  },
  reservado: {
    label: 'RESERVADO',
    color: '#2563EB',
    bg: '#DBEAFE',
    border: '#2563EB',
    icon: 'event_available',
  },
  convertido: {
    label: 'CONVERTIDO',
    color: '#0D9488',
    bg: '#CCFBF1',
    border: '#0D9488',
    icon: 'check_circle',
  },
  perdido: {
    label: 'PERDIDO',
    color: '#9CA3AF',
    bg: '#F9FAFB',
    border: '#9CA3AF',
    icon: 'cancel',
  },
}

export const CHANNEL_CONFIG: Record<Channel, { label: string; icon: string; color: string }> = {
  whatsapp: { label: 'WhatsApp', icon: 'chat', color: '#16A34A' },
  facebook: { label: 'Facebook', icon: 'thumb_up', color: '#2563EB' },
  instagram: { label: 'Instagram', icon: 'photo_camera', color: '#C026D3' },
  telefono: { label: 'Teléfono', icon: 'phone', color: '#D97706' },
  web: { label: 'Web', icon: 'language', color: '#6B7280' },
}

export const TOUR_CATEGORY_CONFIG: Record<TourCategory, { label: string; icon: string }> = {
  tren: { label: 'TREN JOSÉ CUERVO', icon: 'train' },
  pueblos_magicos: { label: 'PUEBLOS MÁGICOS', icon: 'location_city' },
  cultural: { label: 'CULTURAL', icon: 'museum' },
  aventura: { label: 'AVENTURA Y NATURALEZA', icon: 'hiking' },
  privado: { label: 'TOUR PRIVADO', icon: 'star' },
  gastronomia: { label: 'GASTRONOMÍA', icon: 'restaurant' },
}
