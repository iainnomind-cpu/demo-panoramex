import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Prospect, STATUS_CONFIG, CHANNEL_CONFIG } from '../../types'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Prospect360Modal } from '../../components/shared/Prospect360Modal'

interface RecentActivityProps {
  prospects: Prospect[]
}

export function RecentActivity({ prospects }: RecentActivityProps) {
  const navigate = useNavigate()
  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(null)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm h-full flex flex-col">
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Actividad Reciente</h3>
          <p className="text-xs text-gray-500 mt-0.5">Últimos prospectos</p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/prospectos')}>Ver Todos</Button>
      </div>

      <div className="flex-1 overflow-auto divide-y divide-gray-50">
        {prospects.slice(0, 4).map((prospect) => {
          const statusConfig = STATUS_CONFIG[prospect.estado]
          const channelConfig = CHANNEL_CONFIG[prospect.canal]

          return (
            <div 
              key={prospect.id}
              className="px-6 py-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50/60 transition-colors"
              onClick={() => setSelectedProspectId(prospect.id)}
            >
              <div 
                className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: channelConfig.color }}
              >
                <span className="material-symbols-outlined text-lg">{channelConfig.icon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {prospect.nombre} {prospect.apellido}
                </h4>
                <span className="text-xs text-gray-400 font-mono">{prospect.telefono}</span>
              </div>
              <Badge status={prospect.estado} />
            </div>
          )
        })}
      </div>
      
      <Prospect360Modal 
        isOpen={!!selectedProspectId}
        onClose={() => setSelectedProspectId(null)}
        prospectId={selectedProspectId}
      />
    </div>
  )
}
