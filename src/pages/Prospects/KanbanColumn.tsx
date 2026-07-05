import React from 'react'
import { Prospect, ProspectStatus, STATUS_CONFIG } from '../../types'
import { ProspectCard } from '../../components/shared/ProspectCard'
import { useUpdateProspectStatus } from '../../hooks/useProspects'

interface KanbanColumnProps {
  status: ProspectStatus
  prospects: Prospect[]
  onProspectClick?: (id: string) => void
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, prospects, onProspectClick }) => {
  const statusConfig = STATUS_CONFIG[status]
  const updateStatus = useUpdateProspectStatus()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault() // Required to allow dropping
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const prospectId = e.dataTransfer.getData('prospect_id')
    if (prospectId) {
      updateStatus.mutate({ prospect_id: prospectId, new_status: status })
    }
  }

  return (
    <div 
      className="flex flex-col min-w-[320px] max-w-[320px] max-h-full rounded-xl overflow-hidden border border-outline-variant/50 bg-surface-container-lowest/50 backdrop-blur-sm"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-outline-variant/50 bg-surface-container-lowest">
        <div className="flex items-center gap-2">
          <span 
            className="material-symbols-outlined text-[18px]"
            style={{ color: statusConfig.color }}
            aria-hidden="true"
          >
            {statusConfig.icon}
          </span>
          <h3 className="font-bold text-sm tracking-wide text-on-surface uppercase">
            {statusConfig.label}
          </h3>
        </div>
        <span className="flex items-center justify-center bg-surface-container-high text-xs font-bold rounded-full w-7 h-7 text-on-surface-variant">
          {prospects.length}
        </span>
      </div>

      {/* Column body (scrollable) */}
      <div className="flex-1 p-3 overflow-y-auto chat-scroll flex flex-col gap-3 min-h-[150px]">
        {prospects.map((prospect) => (
          <ProspectCard 
            key={prospect.id} 
            prospect={prospect} 
            onProspectClick={onProspectClick}
          />
        ))}
        {prospects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 opacity-60">
             <span className="material-symbols-outlined text-4xl mb-2 text-outline" aria-hidden="true">
               {statusConfig.icon}
             </span>
             <p className="text-sm font-medium text-on-surface-variant">
               Sin prospectos
             </p>
          </div>
        )}
      </div>
    </div>
  )
}
