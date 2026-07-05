import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Prospect, STATUS_CONFIG, CHANNEL_CONFIG, ProspectStatus, Channel } from '../../types'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Prospect360Modal } from '../../components/shared/Prospect360Modal'

interface RecentActivityProps {
  prospects: Prospect[]
}

export function RecentActivity({ prospects }: RecentActivityProps) {
  const navigate = useNavigate()
  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(null)

  const recentProspects = prospects.slice(0, 4)

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm h-full flex flex-col">
      <div className="px-6 py-5 border-b border-outline-variant/50 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-on-surface">Actividad Reciente</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">Últimos prospectos</p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/prospectos')}>Ver Todos</Button>
      </div>

      {recentProspects.length === 0 ? (
        /* Empty state */
        <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
          <span className="material-symbols-outlined text-[40px] text-outline">person_search</span>
          <div>
            <p className="text-sm font-medium text-on-surface">Sin actividad reciente</p>
            <p className="text-xs text-on-surface-variant mt-0.5">Los prospectos nuevos aparecerán aquí</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/prospectos')}>
            Ir a Prospectos
          </Button>
        </div>
      ) : (
        <div className="flex-1 overflow-auto divide-y divide-outline-variant/30" role="list">
          {recentProspects.map((prospect) => {
            const statusConfig = STATUS_CONFIG[prospect.status as ProspectStatus]
            const channelConfig = CHANNEL_CONFIG[(prospect.origin_channel as Channel) || 'whatsapp']

            return (
              <div
                key={prospect.id}
                role="button"
                tabIndex={0}
                aria-label={`Ver prospecto ${prospect.name}, estado: ${statusConfig.label}`}
                className="px-6 py-4 flex items-center gap-3 cursor-pointer hover:bg-surface-container-low/60 transition-colors focus:outline-none focus:bg-surface-container-low"
                onClick={() => setSelectedProspectId(prospect.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSelectedProspectId(prospect.id)
                  }
                }}
              >
                <div
                  className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: channelConfig.color }}
                  aria-hidden="true"
                >
                  <span className="material-symbols-outlined text-lg">{channelConfig.icon}</span>
                </div>
                <div className="min-w-0 flex-1">
                  {/* Added font-sans to explicitly use the Inter token for the name */}
                  <h4 className="text-sm font-medium font-sans text-on-surface truncate">
                    {prospect.name}
                  </h4>
                  <span className="text-xs text-outline font-mono">{prospect.phone}</span>
                </div>
                <Badge status={prospect.status as ProspectStatus} />
              </div>
            )
          })}
        </div>
      )}

      <Prospect360Modal
        isOpen={!!selectedProspectId}
        onClose={() => setSelectedProspectId(null)}
        prospectId={selectedProspectId}
      />
    </div>
  )
}
