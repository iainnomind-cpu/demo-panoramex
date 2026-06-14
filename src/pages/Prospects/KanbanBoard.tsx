import React from 'react'
import { useAppStore } from '../../store/useAppStore'
import { KanbanColumn } from './KanbanColumn'
import { ProspectStatus } from '../../types'

const KANBAN_COLUMNS: ProspectStatus[] = [
  'nuevo',
  'calificado',
  'en_proceso',
  'sin_respuesta',
  'reservado',
  'convertido'
]

interface KanbanBoardProps {
  onProspectClick?: (id: string) => void
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ onProspectClick }) => {
  const { prospects } = useAppStore()

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden h-full">
      {/* Container with padding so scrollbar looks good */}
      <div className="flex gap-6 h-full items-start p-6 min-h-0">
        {KANBAN_COLUMNS.map((status) => {
          const columnProspects = prospects.filter((p) => p.estado === status)
          return (
            <KanbanColumn 
              key={status}
              status={status} 
              prospects={columnProspects} 
              onProspectClick={onProspectClick}
            />
          )
        })}
      </div>
    </div>
  )
}
