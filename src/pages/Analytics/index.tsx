import { useEffect, useState } from 'react'
import { useAnalyticsStore } from '../../store/useAnalyticsStore'
import { KpiCards } from './KpiCards'
import { FunnelChart } from './FunnelChart'
import { ConversionCharts } from './ConversionCharts'
import { BotPerformance } from './BotPerformance'
import { ExportPanel } from './ExportPanel'

export function Analytics() {
  const { 
    kpis, 
    funnel,
    isLoading, 
    error, 
    loadDashboardData 
  } = useAnalyticsStore()

  // For MVP we just use a fixed 30 day window relative to today
  const [dateRange] = useState(() => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - 30)
    return {
      start: start.toISOString(),
      end: end.toISOString()
    }
  })

  useEffect(() => {
    loadDashboardData(dateRange.start, dateRange.end)
    // Realtime could be added here by subscribing to DB changes and re-fetching
  }, [dateRange.start, dateRange.end, loadDashboardData])

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-error/10 text-error p-4 rounded-xl flex items-center gap-2">
          <span className="material-symbols-outlined">warning</span>
          <p>Error cargando analíticas: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-h1 text-on-surface">Dashboard de Analíticas</h1>
          <p className="text-body-lg text-on-surface-variant">
            Métricas consolidadas de los últimos 30 días
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <ExportPanel />
          
          <button 
             onClick={() => loadDashboardData(dateRange.start, dateRange.end)}
             className="p-2 bg-surface-container hover:bg-surface-container-high rounded-full transition-colors flex items-center justify-center text-on-surface-variant"
             title="Actualizar datos"
             disabled={isLoading}
           >
             <span className={`material-symbols-outlined ${isLoading ? 'animate-spin' : ''}`}>sync</span>
           </button>
        </div>
      </div>

      {isLoading && !kpis ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {kpis && <KpiCards kpis={kpis} />}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FunnelChart data={funnel} />
            <BotPerformance />
          </div>

          <ConversionCharts />
        </>
      )}
    </div>
  )
}
