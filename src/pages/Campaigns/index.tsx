import { CampaignCard } from './CampaignCard'
import { useAppStore } from '../../store/useAppStore'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export function Campaigns() {
  const { campaigns } = useAppStore()

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-headline-h2 text-on-surface">Campañas</h1>
          <p className="text-body-md text-on-surface-variant">Mensajes masivos y reactivación de prospectos por WhatsApp.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="primary" leftIcon="campaign">Nueva Campaña</Button>
        </div>
      </div>

      <div className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="w-full md:w-96">
          <Input 
            placeholder="Buscar campaña..." 
            leftIcon="search"
          />
        </div>
        
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="text-on-surface-variant">
            <span className="material-symbols-outlined nav-icon mr-2">filter_list</span>
            Filtrar por estado
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {campaigns.map(campaign => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </div>
  )
}
