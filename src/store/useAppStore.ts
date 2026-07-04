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
  OrganizationSettings,
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
  organizationSettings: OrganizationSettings | null

  // Actions
  updateProspectStatus: (id: string, newStatus: ProspectStatus) => void
  addMessageToConversation: (conversationId: string, message: Message) => void
  createReservation: (reservation: Reservation) => void
  loadTours: () => Promise<void>
  updateVariantPrice: (variantId: string, newPrice: number) => void
  loadSettings: () => Promise<void>
  updateSettings: (status: 'active' | 'paused', accessToken?: string) => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  agents,
  tours: [],
  prospects,
  conversations,
  reservations: [],
  campaigns: [],
  dashboardStats,
  currentAgent: agents.find((a) => a.id === 'a1') || null,
  organizationSettings: null,

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
        tour_variants: t.tour_variants?.map((v: any) =>
          v.id === variantId ? { ...v, price_per_person: newPrice } : v
        ),
      })),
    })),

  loadSettings: async () => {
    const { data } = await supabase
      .from('org_settings')
      .select('*')
      .limit(1)
      .single()
    if (data) {
      set({ organizationSettings: data as unknown as OrganizationSettings })
    }
  },

  /**
   * updateSettings — routes through the serverless function so the UPDATE
   * carries the user's JWT and auth.uid() is available in the Postgres trigger.
   * Requires the caller to pass the current session access_token.
   */
  updateSettings: async (status, accessToken?) => {
    const { organizationSettings } = get()
    if (!organizationSettings) return

    if (accessToken) {
      const response = await fetch('/api/admin/system-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status }),
      })
      if (response.ok) {
        set({
          organizationSettings: { ...organizationSettings, system_status: status },
        })
      }
    }
  },
}))
