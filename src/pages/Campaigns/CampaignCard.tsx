import { Campaign } from '../../types'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'

interface CampaignCardProps {
  campaign: Campaign
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activa': return 'bg-status-green-bg text-status-green border-status-green'
      case 'programada': return 'bg-status-blue-bg text-status-blue border-status-blue'
      case 'borrador': return 'bg-surface-variant text-on-surface-variant border-outline-variant'
      case 'completada': return 'bg-status-teal-bg text-status-teal border-status-teal'
      default: return 'bg-surface-variant text-on-surface'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'activa': return 'send'
      case 'programada': return 'schedule'
      case 'borrador': return 'edit_document'
      case 'completada': return 'task_alt'
      default: return 'campaign'
    }
  }

  return (
    <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-headline-h3 text-on-surface mb-1">{campaign.nombre}</h3>
          <p className="text-label-caps text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
            {campaign.fecha_envio ? new Date(campaign.fecha_envio).toLocaleDateString('es-MX') : 'Sin fecha'}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-md text-xs font-semibold border flex items-center gap-1 ${getStatusColor(campaign.estado)}`}>
          <span className="material-symbols-outlined text-[14px]">{getStatusIcon(campaign.estado)}</span>
          {campaign.estado.toUpperCase()}
        </span>
      </div>

      <div className="bg-surface-bright border border-outline-variant rounded-xl p-4 mb-4 flex-1">
        <p className="text-body-md text-on-surface line-clamp-3">
          "{campaign.mensaje_template}"
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="text-center p-2 bg-surface-container-low rounded-lg">
          <div className="text-label-caps text-on-surface-variant">Enviados</div>
          <div className="text-headline-h3 text-on-surface">{campaign.metricas.enviados}</div>
        </div>
        <div className="text-center p-2 bg-surface-container-low rounded-lg">
          <div className="text-label-caps text-on-surface-variant">Leídos</div>
          <div className="text-headline-h3 text-status-blue">{campaign.metricas.leidos}</div>
        </div>
        <div className="text-center p-2 bg-surface-container-low rounded-lg">
          <div className="text-label-caps text-on-surface-variant">Resp.</div>
          <div className="text-headline-h3 text-status-amber">{campaign.metricas.respondidos}</div>
        </div>
        <div className="text-center p-2 bg-status-green-bg rounded-lg">
          <div className="text-label-caps text-status-green">Conv.</div>
          <div className="text-headline-h3 text-status-green">{campaign.metricas.conversiones}</div>
        </div>
      </div>

      <div className="pt-4 border-t border-outline-variant flex gap-2">
        <Button variant="outline" className="flex-1">Ver Reporte</Button>
        {campaign.estado === 'borrador' && (
          <Button variant="primary" className="flex-1">Editar</Button>
        )}
      </div>
    </div>
  )
}
