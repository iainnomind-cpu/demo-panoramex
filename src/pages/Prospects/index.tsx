import React, { useState, useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { KanbanBoard } from './KanbanBoard'
import { ProspectList } from './ProspectList'
import { Prospect360Modal } from '../../components/shared/Prospect360Modal'
import { NuevoProspectoModal } from '../../components/shared/NuevoProspectoModal'
import { FiltrosPanel } from '../../components/shared/FiltrosPanel'
import { useProspectFilters } from './useProspectFilters'
import { supabase } from '../../lib/supabase'

/** Fetch all agents for the assigned-to filter display */
function useAgentsMap(): Map<string, string> {
  const { data = [] } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('id, full_name')
      if (error) throw new Error(error.message)
      return data ?? []
    },
    staleTime: 5 * 60 * 1000,
  })
  return useMemo(
    () => new Map(data.map((a) => [a.id, a.full_name])),
    [data]
  )
}

export const Prospects: React.FC = () => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(null)
  const [isNuevoOpen, setIsNuevoOpen] = useState(false)
  const [isFiltrosOpen, setIsFiltrosOpen] = useState(false)

  const {
    filters,
    updateFilters,
    resetFilters,
    filtered,
    isLoading,
    error,
    availableTours,
    assignedAgentIds,
    activeFilterCount,
  } = useProspectFilters()

  const agentsMap = useAgentsMap()

  // Build agent list from IDs present in the data, enriched with names
  const availableAgents = useMemo(
    () =>
      assignedAgentIds.map((id) => ({
        id,
        name: agentsMap.get(id) ?? id,
      })),
    [assignedAgentIds, agentsMap]
  )

  const handleProspectClick = useCallback((id: string) => {
    setSelectedProspectId(id)
  }, [])

  return (
    <div className="flex flex-col h-full bg-surface relative">
      {/* Top Bar */}
      <div className="px-6 py-5 border-b border-outline-variant flex items-center justify-between bg-surface-container-lowest z-30 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-navy">Prospectos (CRM)</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Gestiona y da seguimiento a tus prospectos en el embudo de ventas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-surface-container p-1 rounded-lg">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${viewMode === 'kanban' ? 'bg-surface-container-lowest shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
              title="Vista Kanban"
              aria-pressed={viewMode === 'kanban'}
            >
              <span className="material-symbols-outlined text-[20px]">view_kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${viewMode === 'list' ? 'bg-surface-container-lowest shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
              title="Vista Lista"
              aria-pressed={viewMode === 'list'}
            >
              <span className="material-symbols-outlined text-[20px]">view_list</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]" aria-hidden="true">
              search
            </span>
            <input
              type="search"
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              placeholder="Buscar por nombre, teléfono o tour..."
              aria-label="Buscar prospecto"
              className="pl-10 pr-4 py-2 border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-72 transition-all bg-surface focus:bg-surface-container-lowest text-on-surface placeholder:text-outline"
            />
            {filters.search && (
              <button
                onClick={() => updateFilters({ search: '' })}
                aria-label="Limpiar búsqueda"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors focus-visible:outline-none"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          {/* Filtros */}
          <button
            onClick={() => setIsFiltrosOpen(true)}
            className={`relative flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              activeFilterCount > 0
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low'
            }`}
            aria-label={`Filtros${activeFilterCount > 0 ? ` (${activeFilterCount} activos)` : ''}`}
          >
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
            Filtros
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-primary text-on-primary text-[10px] font-bold leading-none">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Nuevo Prospecto */}
          <button
            onClick={() => setIsNuevoOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-navy transition-colors shadow-sm ml-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            Nuevo Prospecto
          </button>
        </div>
      </div>

      {/* Result count when filters are active */}
      {(filters.search || activeFilterCount > 0) && !isLoading && (
        <div className="px-6 py-2 border-b border-outline-variant/50 bg-surface-container-lowest flex items-center gap-2 text-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-[14px]">filter_alt</span>
          <span>
            Mostrando <strong className="text-on-surface">{filtered.length}</strong> resultado{filtered.length !== 1 ? 's' : ''}
            {(filters.search || activeFilterCount > 0) && (
              <button
                onClick={() => { resetFilters(); updateFilters({ search: '' }) }}
                className="ml-2 text-primary underline hover:no-underline focus-visible:outline-none"
              >
                Limpiar todos
              </button>
            )}
          </span>
        </div>
      )}

      {/* Main Area */}
      <div className="flex-1 overflow-hidden bg-surface-container-lowest">
        {viewMode === 'kanban' ? (
          <KanbanBoard
            prospects={filtered}
            isLoading={isLoading}
            error={error}
            onProspectClick={handleProspectClick}
          />
        ) : (
          <div className="h-full overflow-auto pb-6">
            <ProspectList
              prospects={filtered}
              onProspectClick={handleProspectClick}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <Prospect360Modal
        isOpen={!!selectedProspectId}
        onClose={() => setSelectedProspectId(null)}
        prospectId={selectedProspectId}
      />

      <NuevoProspectoModal
        isOpen={isNuevoOpen}
        onClose={() => setIsNuevoOpen(false)}
      />

      <FiltrosPanel
        isOpen={isFiltrosOpen}
        onClose={() => setIsFiltrosOpen(false)}
        filters={filters}
        onChange={updateFilters}
        onReset={resetFilters}
        availableTours={availableTours}
        availableAgents={availableAgents}
      />
    </div>
  )
}

export default Prospects
