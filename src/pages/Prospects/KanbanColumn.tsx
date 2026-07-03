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
      className="flex flex-col min-w-[320px] max-w-[320px] max-h-full rounded-xl overflow-hidden shadow-sm border border-gray-200"
      style={{ backgroundColor: statusConfig.bg }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-white/40 shadow-sm" style={{ backgroundColor: `${statusConfig.border}15` }}>
        <div className="flex items-center gap-2">
          <span 
            className="material-symbols-outlined text-[20px]"
            style={{ color: statusConfig.color }}
          >
            {statusConfig.icon}
          </span>
          <h3 className="font-bold text-sm tracking-wider" style={{ color: statusConfig.color }}>
            {statusConfig.label}
          </h3>
        </div>
        <span className="flex items-center justify-center bg-white text-xs font-bold rounded-full w-7 h-7 shadow-sm text-gray-700">
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
             <span className="material-symbols-outlined text-4xl mb-2" style={{ color: statusConfig.color }}>
               {statusConfig.icon}
             </span>
             <p className="text-sm font-medium" style={{ color: statusConfig.color }}>
               Sin prospectos
             </p>
          </div>
        )}
      </div>
    </div>
  )
}
