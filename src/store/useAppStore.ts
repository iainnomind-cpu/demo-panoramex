import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import {
  agents,
  prospects,
  conversations,
  dashboardStats,
} from '../data'
import type {
  Agent,
  Tour,
  Prospect,
  Conversation,
  Reservation,
  Campaign,
  ProspectStatus,
  Message,
} from '../types'

interface AppState {
  agents: Agent[]
  tours: Tour[]
  prospects: Prospect[]
  conversations: Conversation[]
  reservations: Reservation[]
  campaigns: Campaign[]
  dashboardStats: typeof dashboardStats
  currentAgent: Agent | null

  // Actions
  updateProspectStatus: (id: string, newStatus: ProspectStatus) => void
  addMessageToConversation: (conversationId: string, message: Message) => void
  createReservation: (reservation: Reservation) => void
  loadTours: () => Promise<void>
  updateVariantPrice: (variantId: string, newPrice: number) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  agents,
  tours: [],
  prospects,
  conversations,
  reservations: [],
  dashboardStats,
  currentAgent: agents.find((a) => a.id === 'a1') || null,

  updateProspectStatus: (id, newStatus) =>
    set((state) => ({
      prospects: state.prospects.map((p) =>
        p.id === id ? { ...p, status: newStatus } : p
      ),
    })),

  addMessageToConversation: (conversationId, message) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              mensajes: [...c.mensajes, message],
              ultima_actividad: new Date().toISOString(),
            }
          : c
      ),
    })),

  createReservation: (reservation) =>
    set((state) => ({
      reservations: [...state.reservations, reservation],
      dashboardStats: {
        ...state.dashboardStats,
        reservas_activas: state.dashboardStats.reservas_activas + 1,
      },
    })),

  loadTours: async () => {
    const { data, error } = await supabase
      .from('tours')
      .select('*, tour_variants(*)')
      .order('created_at', { ascending: true })
    
    if (!error && data) {
      set({ tours: data as unknown as Tour[] })
    }
  },

  updateVariantPrice: (variantId, newPrice) =>
    set((state) => ({
      tours: state.tours.map((t) => ({
        ...t,
        tour_variants: t.tour_variants?.map((v) =>
          v.id === variantId ? { ...v, price_per_person: newPrice } : v
        ),
      })),
    })),
}))
