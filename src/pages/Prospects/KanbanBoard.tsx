import React from 'react'
import { KanbanColumn } from './KanbanColumn'
import type { ProspectStatus } from '../../types'
import type { ProspectRow } from '../../hooks/useProspects'

const KANBAN_COLUMNS: ProspectStatus[] = [
  'nuevo',
  'calificado',
  'en_proceso',
  'sin_respuesta',
  'reservado',
  'convertido'
]

interface KanbanBoardProps {
  prospects: ProspectRow[]
  isLoading?: boolean
  error?: Error | null
  onProspectClick?: (id: string) => void
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  prospects,
  isLoading,
  error,
  onProspectClick,
}) => {
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-on-surface-variant text-sm">
        <span className="material-symbols-outlined animate-spin mr-2 text-[20px]">
          progress_activity
        </span>
        Cargando prospectos...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 text-error text-sm">
        <span className="material-symbols-outlined text-[32px]">error</span>
        <p>Error al cargar prospectos: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden h-full">
      <div className="flex gap-6 h-full items-start p-6 min-h-0">
        {KANBAN_COLUMNS.map((status) => {
          const columnProspects = prospects.filter((p) => p.status === status)
          return (
            <KanbanColumn
              key={status}
              status={status}
              prospects={columnProspects as any}
              onProspectClick={onProspectClick}
            />
          )
        })}
      </div>
    </div>
  )
}
