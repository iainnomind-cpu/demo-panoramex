import { useState, useRef } from 'react'
import Papa from 'papaparse'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useAppStore } from '../../store/useAppStore'
import { useCampaignStore } from '../../store/useCampaignStore'
import type { ProspectStatus, Channel } from '../../types'

interface Props {
  onClose: () => void
  onSuccess?: () => void
}

interface CsvRow {
  phone?: string
  telefono?: string
  phone_number?: string
  name?: string
  nombre?: string
}

const CHUNK_SIZE = 500 // Send 500 recipients per API call

function sanitizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  // Accept 10-13 digit numbers, prepend '52' if 10 digits (Mexico)
  if (digits.length === 10) return `52${digits}`
  if (digits.length >= 11 && digits.length <= 13) return digits
  return null
}

async function chunk<T>(arr: T[], size: number): Promise<T[][]> {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size))
  return chunks
}

export function CampaignCreator({ onClose, onSuccess }: Props) {
  const { prospects } = useAppStore()
  const { createCampaign } = useCampaignStore()

  const [step, setStep] = useState<'config' | 'audience' | 'preview'>('config')

  // Step 1: Campaign config
  const [campaignName, setCampaignName] = useState('')
  const [templateName, setTemplateName] = useState('')
  const [campaignType, setCampaignType] = useState<'batch' | 'automated_birthday' | 'automated_survey'>('batch')

  // Step 2: Audience — CRM segment
  const [filterStatus, setFilterStatus] = useState<ProspectStatus | ''>('')
  const [filterChannel, setFilterChannel] = useState<Channel | ''>('')
  const [filterDaysSilent, setFilterDaysSilent] = useState<number | ''>('')

  // Step 2: Audience — External CSV
  const fileRef = useRef<HTMLInputElement>(null)
  const [csvRows, setCsvRows] = useState<Array<{ phone: string; name?: string }>>([])
  const [csvError, setCsvError] = useState<string | null>(null)

  const [isSending, setIsSending] = useState(false)
  const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null)

  // Compute CRM segment
  const segmentedProspects = prospects.filter((p) => {
    if (filterStatus && (p as any).status !== filterStatus) return false
    if (filterChannel && (p as any).canal_origen !== filterChannel) return false
    if (filterDaysSilent && p.last_activity_at) {
      const daysAgo = (Date.now() - new Date(p.last_activity_at).getTime()) / (1000 * 86400)
      if (daysAgo < Number(filterDaysSilent)) return false
    }
    return true
  })

  const crmRecipients = segmentedProspects
    .filter((p) => (p as any).phone_number)
    .map((p) => ({ phone_number: sanitizePhone((p as any).phone_number) ?? '', prospect_id: p.id, name: p.name }))
    .filter((r) => r.phone_number !== '')

  const allRecipients = [
    ...crmRecipients,
    ...csvRows.filter((r) => r.phone).map((r) => ({ phone_number: r.phone, name: r.name })),
  ]

  // Deduplicate by phone
  const uniqueRecipients = Array.from(
    new Map(allRecipients.map((r) => [r.phone_number, r])).values()
  )

  function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvError(null)

    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows: Array<{ phone: string; name?: string }> = []
        let invalid = 0
        for (const row of results.data) {
          const rawPhone = row.phone ?? row.telefono ?? row.phone_number ?? ''
          const sanitized = sanitizePhone(rawPhone)
          if (sanitized) {
            rows.push({ phone: sanitized, name: row.name ?? row.nombre })
          } else {
            invalid++
          }
        }
        setCsvRows(rows)
        if (invalid > 0) setCsvError(`${invalid} número(s) inválidos fueron ignorados.`)
      },
      error: () => setCsvError('Error al leer el archivo CSV.'),
    })
  }

  async function handleSend() {
    if (!campaignName || !templateName) return
    setIsSending(true)

    const { data: { user } } = await (await import('../../lib/supabase')).supabase.auth.getUser()
    const campaign = await createCampaign({
      name: campaignName,
      type: campaignType,
      template_name: templateName,
      status: 'draft',
      target_filters: filterStatus || filterChannel ? { status: filterStatus, channel: filterChannel } : null,
      created_by: user?.id ?? '',
    })

    if (!campaign) {
      setIsSending(false)
      return
    }

    // Send in chunks of CHUNK_SIZE to avoid Vercel timeouts
    const chunks = await chunk(uniqueRecipients, CHUNK_SIZE)
    let totalSent = 0
    let totalFailed = 0

    for (const batch of chunks) {
      try {
        const res = await fetch('/api/campaigns/send-batch', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${(await (await import('../../lib/supabase')).supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            campaign_id: campaign.id,
            template_name: templateName,
            recipients: batch,
          }),
        })
        if (res.ok) {
          const data = await res.json()
          totalSent += data.sent ?? 0
          totalFailed += data.failed ?? 0
        } else {
          totalFailed += batch.length
        }
      } catch {
        totalFailed += batch.length
      }
    }

    setResult({ sent: totalSent, failed: totalFailed, total: uniqueRecipients.length })
    setIsSending(false)
    onSuccess?.()
  }

  return (
    <div className="fixed inset-0 bg-scrim/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">campaign</span>
            <div>
              <h2 className="text-headline-h2 text-on-surface">Nueva Campaña</h2>
              <p className="text-body-sm text-on-surface-variant">
                {step === 'config' ? 'Configuración' : step === 'audience' ? 'Audiencia' : 'Resumen'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </div>

        {/* Steps indicator */}
        <div className="flex px-6 pt-4 gap-2">
          {(['config', 'audience', 'preview'] as const).map((s, i) => (
            <div key={s} className={`flex-1 h-1 rounded-full ${step === s ? 'bg-primary' : i < ['config', 'audience', 'preview'].indexOf(step) ? 'bg-primary/40' : 'bg-outline-variant'}`} />
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {result ? (
            <div className="text-center py-8 space-y-4">
              <span className="material-symbols-outlined text-status-green text-5xl">check_circle</span>
              <h3 className="text-headline-h2 text-on-surface">¡Campaña Enviada!</h3>
              <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
                <div className="bg-status-green-bg rounded-xl p-3 text-center">
                  <div className="text-headline-h2 text-status-green">{result.sent}</div>
                  <div className="text-label-caps text-status-green">Enviados</div>
                </div>
                <div className="bg-status-amber-bg rounded-xl p-3 text-center">
                  <div className="text-headline-h2 text-status-amber">{result.failed}</div>
                  <div className="text-label-caps text-status-amber">Fallidos</div>
                </div>
                <div className="bg-surface-container-low rounded-xl p-3 text-center">
                  <div className="text-headline-h2 text-on-surface">{result.total}</div>
                  <div className="text-label-caps text-on-surface-variant">Total</div>
                </div>
              </div>
              <Button variant="primary" onClick={onClose}>Cerrar</Button>
            </div>
          ) : step === 'config' ? (
            <>
              <div>
                <label className="text-label-md text-on-surface-variant block mb-2">Nombre de la Campaña *</label>
                <Input
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="ej. Reactivación Julio - Tren José Cuervo"
                />
              </div>
              <div>
                <label className="text-label-md text-on-surface-variant block mb-2">Plantilla de Meta *</label>
                <Input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="ej. reactivacion_cliente_v2"
                  leftIcon="smart_display"
                />
                <p className="text-body-sm text-on-surface-variant mt-1">Nombre exacto de la plantilla aprobada en Meta Business Manager.</p>
              </div>
              <div>
                <label className="text-label-md text-on-surface-variant block mb-2">Tipo de Campaña</label>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { v: 'batch', label: 'Envío Masivo', icon: 'campaign' },
                    { v: 'automated_birthday', label: 'Cumpleaños', icon: 'cake' },
                    { v: 'automated_survey', label: 'Encuesta', icon: 'star_rate' },
                  ] as const).map(({ v, label, icon }) => (
                    <button
                      key={v}
                      onClick={() => setCampaignType(v)}
                      className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-colors ${campaignType === v ? 'border-primary bg-primary/10 text-primary' : 'border-outline-variant text-on-surface-variant hover:border-outline'}`}
                    >
                      <span className="material-symbols-outlined text-xl">{icon}</span>
                      <span className="text-label-sm">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : step === 'audience' ? (
            <>
              <div className="bg-surface-container-low rounded-2xl p-4 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-primary">filter_alt</span>
                  <h3 className="text-label-lg text-on-surface font-medium">Segmentar del CRM</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-label-sm text-on-surface-variant block mb-1">Estado del prospecto</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value as ProspectStatus | '')}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3 py-2 text-body-md text-on-surface"
                    >
                      <option value="">Todos</option>
                      <option value="nuevo">Nuevo</option>
                      <option value="en_proceso">En Proceso</option>
                      <option value="sin_respuesta">Sin Respuesta</option>
                      <option value="calificado">Calificado</option>
                      <option value="convertido">Convertido</option>
                      <option value="perdido">Perdido</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-label-sm text-on-surface-variant block mb-1">Canal de origen</label>
                    <select
                      value={filterChannel}
                      onChange={(e) => setFilterChannel(e.target.value as Channel | '')}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-3 py-2 text-body-md text-on-surface"
                    >
                      <option value="">Todos</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="facebook">Facebook</option>
                      <option value="instagram">Instagram</option>
                      <option value="telefono">Teléfono</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-label-sm text-on-surface-variant block mb-1">Días sin actividad (mínimo)</label>
                  <Input
                    type="number"
                    value={filterDaysSilent === '' ? '' : String(filterDaysSilent)}
                    onChange={(e) => setFilterDaysSilent(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="ej. 30"
                    leftIcon="schedule"
                  />
                </div>
                <div className="bg-surface-bright border border-outline-variant rounded-xl p-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">group</span>
                  <span className="text-body-md text-on-surface">
                    <span className="font-semibold text-primary">{crmRecipients.length}</span> prospectos del CRM cumplen el filtro
                  </span>
                </div>
              </div>

              <div className="bg-surface-container-low rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-primary">upload_file</span>
                  <h3 className="text-label-lg text-on-surface font-medium">Importar CSV Externo</h3>
                </div>
                <p className="text-body-sm text-on-surface-variant">
                  Columnas: <code className="bg-surface-bright px-1 rounded">phone</code> (requerido) y <code className="bg-surface-bright px-1 rounded">name</code> (opcional)
                </p>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-outline-variant rounded-xl p-4 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors text-on-surface-variant"
                >
                  <span className="material-symbols-outlined text-3xl">csv</span>
                  <span className="text-label-md">{csvRows.length > 0 ? `${csvRows.length} contactos cargados` : 'Haz clic para cargar .csv'}</span>
                </button>
                <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
                {csvError && (
                  <p className="text-body-sm text-error flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">warning</span>
                    {csvError}
                  </p>
                )}
              </div>
            </>
          ) : (
            // Preview step
            <div className="space-y-4">
              <div className="bg-surface-container-low rounded-2xl p-4 space-y-3">
                <h3 className="text-label-lg text-on-surface font-medium">Resumen de Campaña</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-body-md">
                    <span className="text-on-surface-variant">Nombre</span>
                    <span className="text-on-surface font-medium">{campaignName}</span>
                  </div>
                  <div className="flex justify-between text-body-md">
                    <span className="text-on-surface-variant">Plantilla</span>
                    <code className="text-primary text-sm">{templateName}</code>
                  </div>
                  <div className="flex justify-between text-body-md">
                    <span className="text-on-surface-variant">Destinatarios CRM</span>
                    <span className="text-on-surface">{crmRecipients.length}</span>
                  </div>
                  <div className="flex justify-between text-body-md">
                    <span className="text-on-surface-variant">Destinatarios CSV</span>
                    <span className="text-on-surface">{csvRows.length}</span>
                  </div>
                  <div className="flex justify-between text-body-md border-t border-outline-variant pt-2">
                    <span className="text-on-surface font-semibold">Total únicos</span>
                    <span className="text-primary font-bold text-lg">{uniqueRecipients.length}</span>
                  </div>
                </div>
              </div>
              <div className="bg-status-amber-bg border border-status-amber rounded-2xl p-4 flex gap-2">
                <span className="material-symbols-outlined text-status-amber text-xl mt-0.5">info</span>
                <p className="text-body-sm text-on-surface">
                  Solo se pueden enviar <strong>plantillas pre-aprobadas por Meta</strong>. Verifica que el nombre de la plantilla sea correcto antes de confirmar.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!result && (
          <div className="p-6 border-t border-outline-variant flex justify-between gap-3">
            <Button variant="ghost" onClick={step === 'config' ? onClose : () => setStep(step === 'preview' ? 'audience' : 'config')}>
              {step === 'config' ? 'Cancelar' : 'Atrás'}
            </Button>
            {step !== 'preview' ? (
              <Button
                variant="primary"
                onClick={() => setStep(step === 'config' ? 'audience' : 'preview')}
                disabled={step === 'config' && (!campaignName || !templateName)}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                variant="primary"
                leftIcon="send"
                onClick={handleSend}
                disabled={isSending || uniqueRecipients.length === 0}
              >
                {isSending ? 'Enviando...' : `Enviar a ${uniqueRecipients.length} contactos`}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
