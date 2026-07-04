import { AnalyticsKPIs } from '../../types'

interface Props {
  kpis: AnalyticsKPIs
}

export function KpiCards({ kpis }: Props) {
  const cards = [
    {
      title: 'Leads Hoy',
      value: kpis.leads_today,
      icon: 'person_add',
      color: 'text-status-blue',
      bg: 'bg-status-blue-bg',
    },
    {
      title: 'En Pipeline',
      value: kpis.leads_in_pipeline,
      icon: 'pending',
      color: 'text-status-orange',
      bg: 'bg-status-orange-bg',
    },
    {
      title: 'Reservas Totales',
      value: kpis.total_reservations,
      icon: 'event_available',
      color: 'text-status-green',
      bg: 'bg-status-green-bg',
    },
    {
      title: 'Conversiones',
      value: kpis.total_conversions,
      icon: 'check_circle',
      color: 'text-status-teal',
      bg: 'bg-status-teal-bg',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.title} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${c.bg}`}>
            <span className={`material-symbols-outlined text-[28px] ${c.color}`}>{c.icon}</span>
          </div>
          <div>
            <div className="text-body-sm text-on-surface-variant font-medium uppercase tracking-wider">{c.title}</div>
            <div className={`text-headline-h2 font-bold ${c.color}`}>{c.value.toLocaleString()}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
