import { KPICard } from './KPICard'
import { SalesFunnel } from './SalesFunnel'
import { RecentActivity } from './RecentActivity'
import { TopTours } from './TopTours'
import { useAppStore } from '../../store/useAppStore'

export function Dashboard() {
  const { dashboardStats, prospects, tours } = useAppStore()

  // Format data for funnel
  const funnelData = [
    { status: 'nuevo' as const, count: dashboardStats.embudo.nuevo },
    { status: 'en_proceso' as const, count: Math.round(dashboardStats.embudo.nuevo * 0.8) },
    { status: 'calificado' as const, count: dashboardStats.embudo.calificado },
    { status: 'reservado' as const, count: dashboardStats.embudo.reservado },
    { status: 'convertido' as const, count: dashboardStats.embudo.convertido },
  ]

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Dashboard Ejecutivo</h1>
        <p className="text-sm text-on-surface-variant mt-1">Resumen de actividad y métricas clave de hoy.</p>
      </div>

      {/* KPI Cards - 4 cols with generous gap */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard 
          title="Leads Hoy" 
          value={dashboardStats.leads_hoy} 
          subtitle="Nuevos contactos" 
          icon="group_add" 
          colorClass="bg-blue-50 text-blue-600"
          trend="up"
          trendValue="+12%"
        />
        <KPICard 
          title="Calificados" 
          value={dashboardStats.calificados_hoy} 
          subtitle="Listos para cotizar" 
          icon="verified" 
          colorClass="bg-emerald-50 text-emerald-600"
          trend="up"
          trendValue="+5%"
        />
        <KPICard 
          title="Reservas Activas" 
          value={dashboardStats.reservas_activas} 
          subtitle="En el pipeline" 
          icon="event_available" 
          colorClass="bg-amber-50 text-amber-600"
          trend="neutral"
          trendValue="0%"
        />
        <KPICard 
          title="Conversión" 
          value={`${dashboardStats.tasa_conversion}%`} 
          subtitle="Tasa global" 
          icon="monitoring" 
          colorClass="bg-indigo-50 text-indigo-600"
          trend="up"
          trendValue="+2.4%"
        />
      </div>

      {/* Row 2: Funnel (wide) + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <SalesFunnel data={funnelData} />
        </div>
        <div className="lg:col-span-2">
          <RecentActivity prospects={prospects} />
        </div>
      </div>

      {/* Row 3: Tours Destacados full width */}
      <TopTours tours={tours} />
    </div>
  )
}
