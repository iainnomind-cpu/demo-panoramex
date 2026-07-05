/**
 * FiltrosPanel.tsx — Panoramex CRM
 *
 * Slide-in filter drawer for the Prospectos page.
 * Filters: status, origin_channel, tour_of_interest, assigned_to.
 * All values come from real data in the prospects table; no mocking.
 */

import React, { useEffect, useRef } from 'react'
import { Button } from '../ui/Button'
import { Channel, CHANNEL_CONFIG, ProspectStatus, STATUS_CONFIG } from '../../types'
import type { ProspectFilters } from '../../pages/Prospects/useProspectFilters'

interface FiltrosPanelProps {
  isOpen: boolean
  onClose: () => void
  filters: ProspectFilters
  onChange: (next: Partial<ProspectFilters>) => void
  onReset: () => void
  /** Unique tours extracted from actual prospect data */
  availableTours: string[]
  /** Unique agents extracted from actual prospect data */
  availableAgents: { id: string; name: string }[]
}

const ALL_STATUSES = Object.keys(STATUS_CONFIG) as ProspectStatus[]
const ALL_CHANNELS = Object.keys(CHANNEL_CONFIG) as Channel[]

export const FiltrosPanel: React.FC<FiltrosPanelProps> = ({
  isOpen,
  onClose,
  filters,
  onChange,
  onReset,
  availableTours,
  availableAgents,
}) => {
  const panelRef = useRef<HTMLDivElement>(null)

  // Trap focus and handle Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  const toggleStatus = (s: ProspectStatus) => {
    const next = filters.statuses.includes(s)
      ? filters.statuses.filter((x) => x !== s)
      : [...filters.statuses, s]
    onChange({ statuses: next })
  }

  const toggleChannel = (c: Channel) => {
    const next = filters.channels.includes(c)
      ? filters.channels.filter((x) => x !== c)
      : [...filters.channels, c]
    onChange({ channels: next })
  }

  const activeCount =
    filters.statuses.length +
    filters.channels.length +
    (filters.tour ? 1 : 0) +
    (filters.assignedTo ? 1 : 0)

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40 transition-opacity"
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Panel de filtros"
        aria-modal="true"
        className={`fixed top-0 right-0 h-full w-80 bg-surface border-l border-outline-variant shadow-modal z-50 flex flex-col transition-transform duration-200 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-outline-variant flex-shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-on-surface">Filtros</h2>
            {activeCount > 0 && (
              <span className="text-xs font-semibold bg-primary text-on-primary rounded-full px-2 py-0.5 leading-none">
                {activeCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar filtros"
            className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6">
          {/* Status */}
          <section>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
              Estado
            </p>
            <div className="flex flex-col gap-1.5">
              {ALL_STATUSES.map((s) => {
                const cfg = STATUS_CONFIG[s]
                const active = filters.statuses.includes(s)
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleStatus(s)}
                    aria-pressed={active}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      active
                        ? 'bg-surface-container text-on-surface font-medium'
                        : 'text-on-surface-variant hover:bg-surface-container-low'
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-[16px] flex-shrink-0"
                      style={{ color: cfg.color }}
                    >
                      {cfg.icon}
                    </span>
                    <span className="flex-1">{cfg.label}</span>
                    {active && (
                      <span className="material-symbols-outlined text-[16px] text-primary">
                        check
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </section>

          {/* Canal */}
          <section>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
              Canal de origen
            </p>
            <div className="flex flex-wrap gap-2">
              {ALL_CHANNELS.map((c) => {
                const cfg = CHANNEL_CONFIG[c]
                const active = filters.channels.includes(c)
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleChannel(c)}
                    aria-pressed={active}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      active
                        ? 'border-primary bg-surface-container text-primary'
                        : 'border-outline-variant text-on-surface-variant hover:border-outline'
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-[14px]"
                      style={{ color: active ? cfg.color : undefined }}
                    >
                      {cfg.icon}
                    </span>
                    <span className="capitalize">{c}</span>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Tour */}
          {availableTours.length > 0 && (
            <section>
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
                Tour de interés
              </p>
              <select
                value={filters.tour}
                onChange={(e) => onChange({ tour: e.target.value })}
                className="w-full rounded-md border border-outline-variant py-2 px-3 text-sm text-on-surface bg-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              >
                <option value="">Todos los tours</option>
                {availableTours.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </section>
          )}

          {/* Asignado a */}
          {availableAgents.length > 0 && (
            <section>
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
                Asignado a
              </p>
              <select
                value={filters.assignedTo}
                onChange={(e) => onChange({ assignedTo: e.target.value })}
                className="w-full rounded-md border border-outline-variant py-2 px-3 text-sm text-on-surface bg-surface focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              >
                <option value="">Todos los agentes</option>
                {availableAgents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-outline-variant flex-shrink-0">
          <button
            type="button"
            onClick={onReset}
            disabled={activeCount === 0}
            className="text-sm font-medium text-on-surface-variant hover:text-on-surface disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
          >
            Limpiar filtros
          </button>
          <Button variant="primary" onClick={onClose} size="sm">
            Aplicar
          </Button>
        </div>
      </div>
    </>
  )
}
