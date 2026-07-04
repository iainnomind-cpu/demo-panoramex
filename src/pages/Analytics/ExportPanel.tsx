import { useAnalyticsStore } from '../../store/useAnalyticsStore'

export function ExportPanel() {
  const { metaConsumption } = useAnalyticsStore()

  const handleExport = (format: 'pdf' | 'excel') => {
    // In a real app we'd use jspdf or xlsx to generate the file client-side.
    // For MVP we just show a console message.
    console.log(`Exporting dashboard to ${format}...`)
    alert(`La exportación a ${format.toUpperCase()} está siendo procesada.`)
  }

  if (!metaConsumption) return null

  // Supongamos un límite mensual de 10,000 interacciones de Meta
  const LIMIT = 10000
  const total = metaConsumption.total_interactions
  const percent = Math.min((total / LIMIT) * 100, 100)

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-surface-container-low border border-outline-variant p-4 rounded-xl">
      
      {/* Meta API Usage */}
      <div className="flex-1 flex flex-col gap-1 pr-4 sm:border-r border-outline-variant">
        <div className="flex justify-between items-end">
          <span className="text-label-sm text-on-surface-variant font-medium">Consumo API Meta (Mensual)</span>
          <span className="text-label-sm font-bold text-on-surface">{total.toLocaleString()} / {LIMIT.toLocaleString()}</span>
        </div>
        <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
          <div 
            className={`h-full ${percent > 90 ? 'bg-error' : percent > 75 ? 'bg-status-orange' : 'bg-status-green'} transition-all`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex items-center gap-2">
        <button 
          onClick={() => handleExport('excel')}
          className="flex items-center gap-2 px-3 py-1.5 text-label-md font-medium text-on-surface-variant hover:bg-surface-container-high rounded-lg border border-outline-variant transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">table_view</span>
          Excel
        </button>
        <button 
          onClick={() => handleExport('pdf')}
          className="flex items-center gap-2 px-3 py-1.5 text-label-md font-medium text-on-surface-variant hover:bg-surface-container-high rounded-lg border border-outline-variant transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
          PDF
        </button>
      </div>

    </div>
  )
}
