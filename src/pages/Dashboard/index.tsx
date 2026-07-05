import { KPICard } from './KPICard'
import { SalesFunnel } from './SalesFunnel'
import { RecentActivity } from './RecentActivity'
import { TopTours } from './TopTours'
import { useAppStore } from '../../store/useAppStore'
import type { ProspectStatus } from '../../types'

export function Dashboard() {
  const { dashboardStats, prospects, tours, reservations } = useAppStore()

  // Derive real prospect counts by status from live data
  const prospectCountByStatus = prospects.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1
    return acc
  }, {})

  // Derive tour reservation counts from live reservation data
  const tourReservationCounts = reservations.reduce<Record<string, number>>((acc, r) => {
    const tourVariant = (r as any).tour_variants
    const tourId = tourVariant?.tour_id ?? (r as any).tour_id
    if (tourId) acc[tourId] = (acc[tourId] ?? 0) + 1
    return acc
  }, {})

  // Format funnel using real prospect counts; fall back to seed stats when store has no data yet
  const funnelData: { status: ProspectStatus; count: number }[] = [
    { status: 'nuevo',      count: prospectCountByStatus['nuevo']      ?? dashboardStats.embudo.nuevo },
    { status: 'en_proceso', count: prospectCountByStatus['en_proceso'] ?? 0 },
    { status: 'calificado', count: prospectCountByStatus['calificado'] ?? dashboardStats.embudo.calificado },
    { status: 'reservado',  count: prospectCountByStatus['reservado']  ?? dashboardStats.embudo.reservado },
    { status: 'convertido', count: prospectCountByStatus['convertido'] ?? dashboardStats.embudo.convertido },
  ]

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="Leads Hoy"
          value={dashboardStats.leads_hoy}
          subtitle="Nuevos contactos"
          icon="group_add"
          colorClass="bg-blue-50 text-blue-600"
        />
        <KPICard
          title="Calificados"
          value={dashboardStats.calificados_hoy}
          subtitle="Listos para cotizar"
          icon="verified"
          colorClass="bg-emerald-50 text-emerald-600"
        />
        <KPICard
          title="Reservas Activas"
          value={dashboardStats.reservas_activas}
          subtitle="En el pipeline"
          icon="event_available"
          colorClass="bg-amber-50 text-amber-600"
        />
        <KPICard
          title="Conversión"
          value={`${dashboardStats.tasa_conversion}%`}
          subtitle="Tasa global"
          icon="monitoring"
          colorClass="bg-indigo-50 text-indigo-600"
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
      <TopTours tours={tours} tourReservationCounts={tourReservationCounts} />
    </div>
  )
}
