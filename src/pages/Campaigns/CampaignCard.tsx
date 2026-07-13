import { Campaign, CampaignSend } from '../../types'
import { Button } from '../../components/ui/Button'
import { useCampaignStore } from '../../store/useCampaignStore'

interface CampaignCardProps {
  campaign: Campaign
  sends?: CampaignSend[]
  onClick?: () => void
}

const STATUS_MAP = {
  draft: { label: 'Borrador', icon: 'edit_document', cls: 'bg-surface-variant text-on-surface-variant border-outline-variant' },
  running: { label: 'Activa', icon: 'send', cls: 'bg-status-green-bg text-status-green border-status-green' },
  completed: { label: 'Completada', icon: 'task_alt', cls: 'bg-status-teal-bg text-status-teal border-status-teal' },
  paused: { label: 'Pausada', icon: 'pause_circle', cls: 'bg-status-amber-bg text-status-amber border-status-amber' },
}

const TYPE_LABEL: Record<Campaign['type'], { label: string; icon: string }> = {
  batch: { label: 'Envío Masivo', icon: 'campaign' },
  automated_birthday: { label: 'Cumpleaños', icon: 'cake' },
  automated_survey: { label: 'Encuesta Post-Tour', icon: 'star_rate' },
}

function MetricPill({ label, value, color = 'text-on-surface' }: { label: string; value: number; color?: string }) {
  return (
    <div className="text-center p-2 bg-surface-container-low rounded-lg">
      <div className="text-label-caps text-on-surface-variant">{label}</div>
      <div className={`text-headline-h3 ${color}`}>{value}</div>
    </div>
  )
}

export function CampaignCard({ campaign, sends = [], onClick }: CampaignCardProps) {
  const { updateCampaignStatus } = useCampaignStore()
  const status = STATUS_MAP[campaign.status] ?? STATUS_MAP.draft
  const typeInfo = TYPE_LABEL[campaign.type]

  const metrics = {
    total: sends.length,
    sent: sends.filter((s) => ['sent', 'delivered', 'read', 'replied'].includes(s.status)).length,
    read: sends.filter((s) => s.status === 'read' || s.status === 'replied').length,
    replied: sends.filter((s) => s.status === 'replied').length,
  }

  return (
    <div
      className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow flex flex-col h-full cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0 mr-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-[18px]">{typeInfo.icon}</span>
            <span className="text-label-caps text-primary">{typeInfo.label}</span>
          </div>
          <h3 className="text-headline-h3 text-on-surface truncate">{campaign.name}</h3>
          <p className="text-label-caps text-on-surface-variant mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">calendar_today</span>
            {new Date(campaign.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-md text-xs font-semibold border flex items-center gap-1 shrink-0 ${status.cls}`}>
          <span className="material-symbols-outlined text-[14px]">{status.icon}</span>
          {status.label}
        </span>
      </div>

      <div className="bg-surface-bright border border-outline-variant rounded-xl p-3 mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-on-surface-variant text-[18px]">smart_display</span>
        <p className="text-body-md text-on-surface-variant truncate">
          Plantilla: <span className="text-on-surface font-medium">{campaign.template_name}</span>
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        <MetricPill label="Enviados" value={metrics.sent} />
        <MetricPill label="Leídos" value={metrics.read} color="text-status-blue" />
        <MetricPill label="Resp." value={metrics.replied} color="text-status-amber" />
        <MetricPill label="Total" value={metrics.total} color="text-on-surface-variant" />
      </div>

      <div className="pt-4 border-t border-outline-variant flex gap-2">
        <Button variant="outline" className="flex-1" onClick={(e) => { e.stopPropagation(); onClick?.() }}>
          Ver Reporte
        </Button>
        {campaign.status === 'draft' && (
          <Button variant="primary" className="flex-1" onClick={(e) => {
            e.stopPropagation();
            if (window.confirm('¿Estás seguro de que deseas enviar esta campaña a todos los prospectos segmentados? Esta acción no se puede deshacer.')) {
              updateCampaignStatus(campaign.id, 'sending' as any);
              // The backend API /api/campaigns/send-batch would be called here.
            }
          }}>
            Enviar
          </Button>
        )}
      </div>
    </div>
  )
}
