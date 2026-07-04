import { Reservation } from '../../types'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { useAppStore } from '../../store/useAppStore'

interface ReservationTableProps {
  reservations: Reservation[]
}

export function ReservationTable({ reservations }: ReservationTableProps) {
  const { prospects, tours, agents } = useAppStore()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completada': return 'bg-status-teal-bg text-status-teal border-status-teal'
      case 'confirmada': return 'bg-status-blue-bg text-status-blue border-status-blue'
      case 'pendiente': return 'bg-status-amber-bg text-status-amber border-status-amber'
      case 'cancelada': return 'bg-status-red-bg text-status-red border-status-red'
      default: return 'bg-surface-variant text-on-surface'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount)
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant text-label-caps text-on-surface-variant">
              <th className="p-4 font-semibold">ID</th>
              <th className="p-4 font-semibold">Cliente</th>
              <th className="p-4 font-semibold">Tour</th>
              <th className="p-4 font-semibold">Fecha</th>
              <th className="p-4 font-semibold">Pax</th>
              <th className="p-4 font-semibold">Monto / Saldo</th>
              <th className="p-4 font-semibold">Estado</th>
              <th className="p-4 font-semibold">Agente</th>
              <th className="p-4 font-semibold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-body-md text-on-surface">
            {reservations.map((res) => {
              const prospect = prospects.find(p => p.id === res.prospect_id)
              const tour = tours.find(t => t.tour_variants?.some(v => v.id === res.tour_variant_id))
              const agent = agents.find(a => a.id === res.created_by)
              const saldo = res.total_amount - (res.deposit_amount || 0)

              return (
                <tr key={res.id} className="border-b border-outline-variant hover:bg-surface-bright transition-colors">
                  <td className="p-4 font-mono text-xs text-on-surface-variant">#{res.id.toUpperCase()}</td>
                  <td className="p-4">
                    <div className="font-semibold">{prospect?.name}</div>
                    <div className="text-label-caps text-on-surface-variant">{prospect?.phone}</div>
                  </td>
                  <td className="p-4">
                    <div className="line-clamp-1 max-w-[200px]" title={tour?.name}>{tour?.name}</div>
                  </td>
                  <td className="p-4 font-mono text-xs">{new Date(res.service_date).toLocaleDateString('es-MX')}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-outline">group</span>
                      {res.num_people}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-status-green">{formatCurrency(res.total_amount)}</div>
                    {saldo > 0 && (
                      <div className="text-label-caps text-status-amber mt-1">Saldo: {formatCurrency(saldo)}</div>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold border ${getStatusColor(res.status)}`}>
                      {res.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] text-white" style={{ backgroundColor: agent?.color }}>
                        {agent?.full_name?.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="text-xs">{agent?.full_name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <Button variant="ghost" size="sm">
                      <span className="material-symbols-outlined nav-icon">more_vert</span>
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
