import { useProspects } from '../../hooks/useProspects'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { CHANNEL_CONFIG, ProspectStatus, Channel } from '../../types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ProspectListProps {
  onProspectClick?: (prospectId: string) => void
}

export function ProspectList({ onProspectClick }: ProspectListProps) {
  const { data: prospects = [] } = useProspects()

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
              const channelConfig = CHANNEL_CONFIG[(prospect.origin_channel as Channel) || 'whatsapp']
              const tourName = prospect.tour_of_interest || 'General'
              const nameParts = prospect.name.split(' ')
              const initials = nameParts.length > 1 
                ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
                : prospect.name.substring(0, 2).toUpperCase()
              
              return (
                <tr key={prospect.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => onProspectClick && onProspectClick(prospect.id)}
                      className="flex items-center gap-3 text-left hover:opacity-80"
                    >
                      <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center font-bold text-xs">
                        {initials}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{prospect.name}</div>
                        {(prospect.tags && prospect.tags.length > 0) && (
                          <div className="flex gap-1 mt-1">
                            {prospect.tags.map((e: string) => (
                              <span key={e} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{e}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-mono text-gray-600">{prospect.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-700 max-w-[200px] truncate">
                      {tourName}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{prospect.num_people || 1} pax</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-sm" style={{ color: channelConfig?.color || '#000' }}>
                      <span className="material-symbols-outlined text-[18px]">{channelConfig?.icon || 'help'}</span>
                      <span className="capitalize">{prospect.origin_channel || 'Desconocido'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge status={prospect.status as ProspectStatus} />
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
