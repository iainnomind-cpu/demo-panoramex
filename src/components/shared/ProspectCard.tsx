import React from 'react'

import { Prospect, STATUS_CONFIG, CHANNEL_CONFIG, ProspectStatus, Channel } from '../../types'
import { useAppStore } from '../../store/useAppStore'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ProspectCardProps {
  prospect: Prospect
  onProspectClick?: (id: string) => void
}

export const ProspectCard: React.FC<ProspectCardProps> = ({ prospect, onProspectClick }) => {
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
      onClick={() => onProspectClick && onProspectClick(prospect.id)}
      className="bg-surface-container-lowest rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow hover:border-primary/30 cursor-pointer border border-outline-variant group"
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <h4 
            className="font-semibold text-on-surface font-sans truncate group-hover:text-primary transition-colors text-left max-w-full"
            title={prospect.name}
          >
            {prospect.name}
          </h4>
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

    </div>
  )
}
