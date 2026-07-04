// ============================================================
// PANORAMEX CRM — Campaign Store (src/store/useCampaignStore.ts)
// ============================================================

import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Campaign, CampaignSend } from '../types'

interface CampaignMetrics {
  total: number
  queued: number
  sent: number
  delivered: number
  read: number
  replied: number
  failed: number
}

interface CampaignState {
  campaigns: Campaign[]
  sends: CampaignSend[]
  isLoading: boolean
  isSending: boolean
  error: string | null

  // Actions
  loadCampaigns: () => Promise<void>
  loadSendsForCampaign: (campaignId: string) => Promise<void>
  createCampaign: (campaign: Omit<Campaign, 'id' | 'created_at'>) => Promise<Campaign | null>
  updateCampaignStatus: (campaignId: string, status: Campaign['status']) => Promise<void>
  getMetrics: (campaignId: string) => CampaignMetrics
}

export const useCampaignStore = create<CampaignState>((set, get) => ({
  campaigns: [],
  sends: [],
  isLoading: false,
  isSending: false,
  error: null,

  loadCampaigns: async () => {
    set({ isLoading: true, error: null })
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      set({ error: error.message, isLoading: false })
      return
    }
    set({ campaigns: (data as unknown as Campaign[]) ?? [], isLoading: false })
  },

  loadSendsForCampaign: async (campaignId: string) => {
    const { data, error } = await supabase
      .from('campaign_sends')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: true })

    if (!error && data) {
      set({ sends: data as unknown as CampaignSend[] })
    }
  },

  createCampaign: async (campaignData) => {
    const { data, error } = await supabase
      .from('campaigns')
      .insert(campaignData as any)
      .select()
      .single()

    if (error) {
      set({ error: error.message })
      return null
    }

    const campaign = data as unknown as Campaign
    set((state) => ({ campaigns: [campaign, ...state.campaigns] }))
    return campaign
  },

  updateCampaignStatus: async (campaignId: string, status: Campaign['status']) => {
    const { error } = await (supabase
      .from('campaigns') as any)
      .update({ status })
      .eq('id', campaignId)

    if (!error) {
      set((state) => ({
        campaigns: state.campaigns.map((c) =>
          c.id === campaignId ? { ...c, status } : c
        ),
      }))
    }
  },

  getMetrics: (campaignId: string): CampaignMetrics => {
    const sends = get().sends.filter((s) => s.campaign_id === campaignId)
    return {
      total: sends.length,
      queued: sends.filter((s) => s.status === 'queued').length,
      sent: sends.filter((s) => s.status === 'sent').length,
      delivered: sends.filter((s) => s.status === 'delivered').length,
      read: sends.filter((s) => s.status === 'read').length,
      replied: sends.filter((s) => s.status === 'replied').length,
      failed: sends.filter((s) => s.status === 'failed').length,
    }
  },
}))
