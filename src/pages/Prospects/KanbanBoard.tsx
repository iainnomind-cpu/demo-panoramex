import React from 'react'
import { useProspects } from '../../hooks/useProspects'
import { KanbanColumn } from './KanbanColumn'
import type { ProspectStatus, Prospect } from '../../types'

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
  const { data: dbProspects, isLoading, error } = useProspects()

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        Cargando prospectos...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center text-red-400 text-sm">
        Error al cargar prospectos: {error.message}
      </div>
    )
  }

  const prospects: Prospect[] = dbProspects ?? []

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden h-full">
      {/* Container with padding so scrollbar looks good */}
      <div className="flex gap-6 h-full items-start p-6 min-h-0">
        {KANBAN_COLUMNS.map((status) => {
          const columnProspects = prospects.filter((p) => p.status === status)
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
