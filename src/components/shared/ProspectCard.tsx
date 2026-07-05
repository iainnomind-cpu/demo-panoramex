import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Prospect, STATUS_CONFIG, CHANNEL_CONFIG, ProspectStatus, Channel } from '../../types'
import { useAppStore } from '../../store/useAppStore'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Button } from '../ui/Button'

interface ProspectCardProps {
  prospect: Prospect
  onProspectClick?: (id: string) => void
}

export const ProspectCard: React.FC<ProspectCardProps> = ({ prospect, onProspectClick }) => {
  const navigate = useNavigate()
  const { agents, tours } = useAppStore()

  const statusConfig = STATUS_CONFIG[prospect.status as ProspectStatus]
  const channelConfig = CHANNEL_CONFIG[(prospect.origin_channel as Channel) || 'whatsapp']
  const tour = tours.find((t) => t.id === prospect.tour_of_interest)
  const agent = agents.find((a) => a.id === prospect.assigned_to)

  const dateStr = prospect.desired_date
    ? format(new Date(prospect.desired_date), 'd MMM yyyy', { locale: es })
    : 'Sin fecha'

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('prospect_id', prospect.id)
      }}
      className="bg-surface-container-lowest rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing border border-outline-variant"
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <button 
            className="font-semibold text-on-surface font-sans truncate hover:text-primary transition-colors text-left max-w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
            onClick={() => onProspectClick && onProspectClick(prospect.id)}
            title={prospect.name}
          >
            {prospect.name}
          </button>
          <p className="text-sm text-on-surface-variant font-mono mt-0.5 flex items-center gap-1">
            <span
              className="material-symbols-outlined text-[16px]"
              style={{ color: channelConfig?.color || 'inherit' }}
              aria-hidden="true"
            >
              {channelConfig?.icon || 'help'}
            </span>
            {prospect.phone}
          </p>
        </div>
        {agent && (
          <div
            className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
            style={{ backgroundColor: agent.color || 'var(--color-primary)' }}
            title={`Asignado a: ${agent.full_name}`}
          >
            {agent.full_name?.substring(0, 2).toUpperCase() || 'AG'}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {tour && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-surface-container text-on-surface-variant max-w-full">
            <span className="material-symbols-outlined text-[14px]">map</span>
            <span className="truncate">{tour.name}</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-on-surface-variant mt-1">
        <div className="flex items-center gap-1 truncate">
          <span className="material-symbols-outlined text-[16px]">calendar_today</span>
          {dateStr}
        </div>
        <div className="flex items-center gap-1 whitespace-nowrap">
          <span className="material-symbols-outlined text-[16px]">group</span>
          {prospect.num_people || 1} pax
        </div>
      </div>

      {/* Action buttons - Replaced generic HTML buttons and fake alert with proper UI components */}
      <div className="flex items-center gap-2 mt-2 pt-3 border-t border-outline-variant/50">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          leftIcon="chat"
          onClick={() => navigate(`/conversaciones?id=${prospect.id}`)}
        >
          Chat
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          leftIcon="visibility"
          onClick={() => onProspectClick && onProspectClick(prospect.id)}
        >
          Detalles
        </Button>
      </div>
    </div>
  )
}
