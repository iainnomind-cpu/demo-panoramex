import { create } from 'zustand'
import {
  agents,
  tours,
  prospects,
  conversations,
  reservations,
  campaigns,
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
}

export const useAppStore = create<AppState>((set) => ({
  agents,
  tours,
  prospects,
  conversations,
  reservations,
  campaigns,
  dashboardStats,
  currentAgent: agents.find((a) => a.id === 'a1') || null,

  updateProspectStatus: (id, newStatus) =>
    set((state) => ({
      prospects: state.prospects.map((p) =>
        p.id === id ? { ...p, estado: newStatus } : p
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
}))
