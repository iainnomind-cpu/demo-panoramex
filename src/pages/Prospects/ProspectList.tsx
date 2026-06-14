import { useAppStore } from '../../store/useAppStore'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { CHANNEL_CONFIG } from '../../types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ProspectListProps {
  onProspectClick?: (prospectId: string) => void
}

export function ProspectList({ onProspectClick }: ProspectListProps) {
  const { prospects, tours } = useAppStore()

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mx-6 my-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-6 py-4">Prospecto</th>
              <th className="px-6 py-4">Contacto</th>
              <th className="px-6 py-4">Interés</th>
              <th className="px-6 py-4">Origen</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4">Registro</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {prospects.map((prospect) => {
              const channelConfig = CHANNEL_CONFIG[prospect.canal]
              const tour = tours.find(t => t.id === prospect.tour_interes_id)
              
              return (
                <tr key={prospect.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => onProspectClick && onProspectClick(prospect.id)}
                      className="flex items-center gap-3 text-left hover:opacity-80"
                    >
                      <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center font-bold text-xs">
                        {prospect.nombre[0]}{prospect.apellido[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{prospect.nombre} {prospect.apellido}</div>
                        {prospect.etiquetas?.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {prospect.etiquetas.map(e => (
                              <span key={e} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{e}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-mono text-gray-600">{prospect.telefono}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700 max-w-[200px] truncate">
                      {tour?.nombre || 'General'}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{prospect.num_personas} pax</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm" style={{ color: channelConfig.color }}>
                      <span className="material-symbols-outlined text-[18px]">{channelConfig.icon}</span>
                      <span className="capitalize">{prospect.canal}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge status={prospect.estado} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">
                      {format(new Date(prospect.created_at), 'd MMM, yyyy', { locale: es })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" onClick={() => onProspectClick && onProspectClick(prospect.id)}>
                      Ver 360
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
