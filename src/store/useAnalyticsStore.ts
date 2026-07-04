import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import {
  AnalyticsKPIs,
  FunnelData,
  BotPerformance,
  SurveyAggregates,
  MetaConsumption,
  ConversionByTour,
  ConversionByChannel,
  AgentPerformance,
} from '../types'

interface AnalyticsState {
  kpis: AnalyticsKPIs | null
  funnel: FunnelData[]
  botPerformance: BotPerformance | null
  surveyAggregates: SurveyAggregates | null
  metaConsumption: MetaConsumption | null
  conversionByTour: ConversionByTour[]
  conversionByChannel: ConversionByChannel[]
  agentPerformance: AgentPerformance[]
  isLoading: boolean
  error: string | null
  loadDashboardData: (startDate: string, endDate: string) => Promise<void>
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  kpis: null,
  funnel: [],
  botPerformance: null,
  surveyAggregates: null,
  metaConsumption: null,
  conversionByTour: [],
  conversionByChannel: [],
  agentPerformance: [],
  isLoading: false,
  error: null,

  loadDashboardData: async (startDate: string, endDate: string) => {
    set({ isLoading: true, error: null })
    try {
      // Fetch Views
      const [
        { data: kpisData },
        { data: funnelData },
        { data: botData },
        { data: surveyData },
        { data: metaData },
      ] = await Promise.all([
        supabase.from('view_analytics_kpis').select('*').single(),
        supabase.from('view_analytics_funnel').select('*'),
        supabase.from('view_analytics_bot_performance').select('*').single(),
        supabase.from('view_analytics_surveys').select('*').single(),
        supabase.from('view_analytics_consumption').select('*').single(),
      ])

      // Fetch RPCs
      const [
        { data: tourData },
        { data: channelData },
        { data: agentData },
      ] = await Promise.all([
        supabase.rpc('get_conversions_by_tour', { start_date: startDate, end_date: endDate } as any),
        supabase.rpc('get_conversions_by_channel', { start_date: startDate, end_date: endDate } as any),
        supabase.rpc('get_agent_performance', { start_date: startDate, end_date: endDate } as any),
      ])

      set({
        kpis: (kpisData as unknown) as AnalyticsKPIs,
        funnel: (funnelData as unknown) as FunnelData[],
        botPerformance: (botData as unknown) as BotPerformance,
        surveyAggregates: (surveyData as unknown) as SurveyAggregates,
        metaConsumption: (metaData as unknown) as MetaConsumption,
        conversionByTour: (tourData || []) as unknown as ConversionByTour[],
        conversionByChannel: (channelData || []) as unknown as ConversionByChannel[],
        agentPerformance: (agentData || []) as unknown as AgentPerformance[],
      })
    } catch (err: any) {
      console.error('Error loading analytics:', err)
      set({ error: err.message })
    } finally {
      set({ isLoading: false })
    }
  },
}))
