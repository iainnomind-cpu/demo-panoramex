import { Campaign, CampaignSend } from '../../types'
import { Button } from '../../components/ui/Button'

interface Props {
  campaign: Campaign
  sends: CampaignSend[]
  onClose: () => void
}

const STATUS_MAP: Record<CampaignSend['status'], { label: string; cls: string }> = {
  queued: { label: 'En Cola', cls: 'bg-surface-variant text-on-surface-variant' },
  sent: { label: 'Enviado', cls: 'bg-status-blue-bg text-status-blue' },
  delivered: { label: 'Entregado', cls: 'bg-status-blue-bg text-status-blue' },
  read: { label: 'Leído', cls: 'bg-status-teal-bg text-status-teal' },
  replied: { label: 'Respondió', cls: 'bg-status-green-bg text-status-green' },
  failed: { label: 'Fallido', cls: 'bg-error/10 text-error' },
}

export function CampaignDetail({ campaign, sends, onClose }: Props) {
  const total = sends.length
  const sent = sends.filter((s) => ['sent', 'delivered', 'read', 'replied'].includes(s.status)).length
  const read = sends.filter((s) => ['read', 'replied'].includes(s.status)).length
  const replied = sends.filter((s) => s.status === 'replied').length
  const failed = sends.filter((s) => s.status === 'failed').length
  const readRate = total > 0 ? Math.round((read / total) * 100) : 0
  const replyRate = total > 0 ? Math.round((replied / total) * 100) : 0

  return (
    <div className="fixed inset-0 bg-scrim/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant">
          <div>
            <h2 className="text-headline-h2 text-on-surface">{campaign.name}</h2>
            <p className="text-body-sm text-on-surface-variant">
              Plantilla: <code className="text-primary">{campaign.template_name}</code>
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total', value: total, icon: 'group', color: 'text-on-surface' },
              { label: 'Enviados', value: sent, icon: 'send', color: 'text-status-blue' },
              { label: 'Leídos', value: read, icon: 'done_all', color: 'text-status-teal' },
              { label: 'Respondieron', value: replied, icon: 'chat', color: 'text-status-green' },
            ].map((m) => (
              <div key={m.label} className="bg-surface-container-low rounded-2xl p-4 text-center">
                <span className={`material-symbols-outlined text-2xl ${m.color}`}>{m.icon}</span>
                <div className={`text-headline-h2 ${m.color}`}>{m.value}</div>
                <div className="text-label-caps text-on-surface-variant">{m.label}</div>
              </div>
            ))}
          </div>

          {/* Rate bars */}
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-label-sm text-on-surface-variant mb-1">
                <span>Tasa de Lectura</span>
                <span className="font-semibold text-status-teal">{readRate}%</span>
              </div>
              <div className="h-2 bg-surface-container-low rounded-full overflow-hidden">
                <div className="h-full bg-status-teal rounded-full transition-all" style={{ width: `${readRate}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-label-sm text-on-surface-variant mb-1">
                <span>Tasa de Respuesta</span>
                <span className="font-semibold text-status-green">{replyRate}%</span>
              </div>
              <div className="h-2 bg-surface-container-low rounded-full overflow-hidden">
                <div className="h-full bg-status-green rounded-full transition-all" style={{ width: `${replyRate}%` }} />
              </div>
            </div>
            {failed > 0 && (
              <p className="text-body-sm text-error flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                {failed} mensajes fallidos
              </p>
            )}
          </div>

          {/* Recipients list */}
          <div>
            <h3 className="text-label-lg text-on-surface mb-3 font-medium">Destinatarios</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sends.length === 0 ? (
                <p className="text-body-md text-on-surface-variant text-center py-4">Sin registros aún</p>
              ) : (
                sends.map((s) => {
                  const st = STATUS_MAP[s.status] ?? STATUS_MAP.queued
                  return (
                    <div key={s.id} className="flex items-center justify-between px-3 py-2 bg-surface-container-low rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-on-surface-variant text-[18px]">phone</span>
                        <span className="text-body-md text-on-surface font-mono">{s.phone_number}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-label-caps ${st.cls}`}>{st.label}</span>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-outline-variant">
          <Button variant="outline" onClick={onClose} className="w-full">Cerrar</Button>
        </div>
      </div>
    </div>
  )
}
