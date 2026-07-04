// ============================================================
// PANORAMEX CRM — TypeScript Types & Interfaces
// ============================================================
import { Database } from '../lib/database.types'

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

export type Agent = Database['public']['Tables']['agents']['Row'] & {
  // Add UI-specific fields not in DB if needed
  avatar?: string
  prospectos_activos?: number
  color?: string
}

export type Tour = Database['public']['Tables']['tours']['Row'] & {
  category?: string // To support the UI category filter
  tour_variants?: TourVariant[]
}

export type TourVariant = Database['public']['Tables']['tour_variants']['Row']

export type Prospect = Database['public']['Tables']['prospects']['Row'] & {
  birth_date?: string | null
}

export type InteractionTimeline = Database['public']['Tables']['interactions_timeline']['Row']

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

export type Reservation = Database['public']['Tables']['reservations']['Row'] & {
  reservation_passengers?: ReservationPassenger[]
  tour_variants?: TourVariant
  prospects?: Prospect
}

export type ReservationPassenger = Database['public']['Tables']['reservation_passengers']['Row']

export interface Campaign {
  id: string
  name: string
  type: 'batch' | 'automated_birthday' | 'automated_survey'
  template_name: string
  status: 'draft' | 'running' | 'completed' | 'paused'
  target_filters: Record<string, any> | null
  created_at: string
  created_by: string
}

export interface CampaignSend {
  id: string
  campaign_id: string
  prospect_id: string | null
  phone_number: string
  status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed' | 'replied'
  meta_message_id: string | null
  created_at: string
  updated_at: string
}

export interface SatisfactionSurvey {
  id: string
  reservation_id: string
  prospect_id: string
  rating: number
  feedback: string | null
  created_at: string
}

export interface OrganizationSettings {
  id: string
  system_status: 'active' | 'paused'
  updated_at: string
  updated_by: string | null
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

// ============================================================
// Analytics Dashboard Types
// ============================================================

export interface AnalyticsKPIs {
  leads_today: number
  leads_in_pipeline: number
  total_reservations: number
  total_conversions: number
}

export interface FunnelData {
  status: ProspectStatus
  count: number
}

export interface BotPerformance {
  total_leads: number
  bot_qualified: number
  human_handoff: number
}

export interface SurveyAggregates {
  average_rating: number
  rating_1_count: number
  rating_3_count: number
  rating_5_count: number
}

export interface MetaConsumption {
  current_month_messages: number
  current_month_campaigns: number
  total_interactions: number
}

export interface ConversionByTour {
  tour_name: string
  conversion_count: number
}

export interface ConversionByChannel {
  channel: Channel
  lead_count: number
  conversion_count: number
}

export interface AgentPerformance {
  agent_id: string
  agent_name: string
  leads_assigned: number
  leads_attended: number
  conversions: number
  avg_response_time_minutes: number
}
