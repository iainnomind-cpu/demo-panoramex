import { ConversionChart } from './ConversionChart'
import { AgentTable } from './AgentTable'
import { TourRankingChart } from './TourRankingChart'
import { Button } from '../../components/ui/Button'

export function Analytics() {
  return (
    <div className="flex flex-col gap-6 h-full pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-headline-h2 text-on-surface">Analytics y Dashboard Ejecutivo</h1>
          <p className="text-body-md text-on-surface-variant">Reportes de inteligencia de negocio y rendimiento.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" leftIcon="download">Exportar PDF</Button>
          <Button variant="primary" leftIcon="date_range">Mes Actual</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-1">
          <ConversionChart />
        </div>
        <div className="lg:col-span-1">
          <TourRankingChart />
        </div>
        <div className="lg:col-span-2">
          <AgentTable />
        </div>
      </div>
    </div>
  )
}
