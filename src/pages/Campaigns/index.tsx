import { useEffect, useState } from 'react'
import { CampaignCard } from './CampaignCard'
import { CampaignCreator } from './CampaignCreator'
import { CampaignDetail } from './CampaignDetail'
import { useCampaignStore } from '../../store/useCampaignStore'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import type { Campaign } from '../../types'

const STATUS_FILTERS = [
  { label: 'Todas', value: '' },
  { label: 'Activas', value: 'running' },
  { label: 'Completadas', value: 'completed' },
  { label: 'Borradores', value: 'draft' },
  { label: 'Pausadas', value: 'paused' },
]

export function Campaigns() {
  const { campaigns, sends, isLoading, loadCampaigns, loadSendsForCampaign } = useCampaignStore()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreator, setShowCreator] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)

  useEffect(() => {
    loadCampaigns()
  }, [loadCampaigns])

  const filtered = campaigns.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.template_name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleCampaignClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    loadSendsForCampaign(campaign.id)
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-headline-h2 text-on-surface">Campañas</h1>
          <p className="text-body-md text-on-surface-variant">Mensajes masivos, automatizaciones y encuestas por WhatsApp.</p>
        </div>
        <Button variant="primary" leftIcon="campaign" onClick={() => setShowCreator(true)}>
          Nueva Campaña
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="w-full md:w-80">
          <Input
            placeholder="Buscar campaña o plantilla..."
            leftIcon="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-label-sm transition-colors border ${
                statusFilter === f.value
                  ? 'bg-primary text-on-primary border-primary'
                  : 'text-on-surface-variant border-outline-variant hover:bg-surface-container-low'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Campañas', value: campaigns.length, icon: 'campaign', color: 'text-primary' },
          { label: 'Activas', value: campaigns.filter(c => c.status === 'running').length, icon: 'send', color: 'text-status-green' },
          { label: 'Completadas', value: campaigns.filter(c => c.status === 'completed').length, icon: 'task_alt', color: 'text-status-teal' },
          { label: 'Total Enviados', value: sends.length, icon: 'mark_email_read', color: 'text-status-blue' },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 flex items-center gap-3">
            <span className={`material-symbols-outlined text-2xl ${stat.color}`}>{stat.icon}</span>
            <div>
              <div className={`text-headline-h2 ${stat.color}`}>{stat.value}</div>
              <div className="text-label-caps text-on-surface-variant">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Campaign Grid */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl animate-spin">refresh</span>
            <p className="text-body-md">Cargando campañas...</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-on-surface-variant text-center">
            <span className="material-symbols-outlined text-5xl">campaign</span>
            <h3 className="text-headline-h3 text-on-surface">Sin campañas</h3>
            <p className="text-body-md max-w-xs">Crea tu primera campaña para reactivar prospectos y enviar mensajes masivos.</p>
            <Button variant="primary" leftIcon="add" onClick={() => setShowCreator(true)}>
              Nueva Campaña
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              sends={sends.filter((s) => s.campaign_id === campaign.id)}
              onClick={() => handleCampaignClick(campaign)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreator && (
        <CampaignCreator
          onClose={() => setShowCreator(false)}
          onSuccess={() => { setShowCreator(false); loadCampaigns() }}
        />
      )}
      {selectedCampaign && (
        <CampaignDetail
          campaign={selectedCampaign}
          sends={sends.filter((s) => s.campaign_id === selectedCampaign.id)}
          onClose={() => setSelectedCampaign(null)}
        />
      )}
    </div>
  )
}
