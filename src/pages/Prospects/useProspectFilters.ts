/**
 * useProspectFilters.ts — Panoramex CRM
 *
 * Centralised filter state + derived prospect list for the Prospectos page.
 * Filters are applied client-side against the full prospects cache from
 * useProspects() — the data is already fetched and subscribed via Realtime.
 *
 * Client-side filtering is the right call here because:
 * 1. The Realtime subscription already keeps the full list hot in cache.
 * 2. The prospects table is unlikely to exceed a few thousand rows per org.
 * 3. It avoids extra round-trips and keeps the UI instantaneous.
 */

import { useMemo, useState } from 'react'
import { useProspects } from '../../hooks/useProspects'
import type { Channel, ProspectStatus } from '../../types'
import type { ProspectRow } from '../../hooks/useProspects'

export interface ProspectFilters {
  search: string
  statuses: ProspectStatus[]
  channels: Channel[]
  tour: string
  assignedTo: string
}

const DEFAULT_FILTERS: ProspectFilters = {
  search: '',
  statuses: [],
  channels: [],
  tour: '',
  assignedTo: '',
}

export function useProspectFilters() {
  const { data: allProspects = [], isLoading, error } = useProspects()
  const [filters, setFilters] = useState<ProspectFilters>(DEFAULT_FILTERS)

  const updateFilters = (next: Partial<ProspectFilters>) =>
    setFilters((prev) => ({ ...prev, ...next }))

  const resetFilters = () => setFilters(DEFAULT_FILTERS)

  /** Debounce-free: filtering 1000 prospects takes <1 ms on modern hardware */
  const filtered = useMemo<ProspectRow[]>(() => {
    let list = allProspects

    // 1. Full-text search on name + phone
    if (filters.search.trim()) {
      const q = filters.search.trim().toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.phone ?? '').toLowerCase().includes(q) ||
          (p.tour_of_interest ?? '').toLowerCase().includes(q)
      )
    }

    // 2. Status filter (multi-select)
    if (filters.statuses.length > 0) {
      list = list.filter((p) =>
        filters.statuses.includes(p.status as ProspectStatus)
      )
    }

    // 3. Channel filter (multi-select)
    if (filters.channels.length > 0) {
      list = list.filter((p) =>
        filters.channels.includes(p.origin_channel as Channel)
      )
    }

    // 4. Tour filter (single select)
    if (filters.tour) {
      list = list.filter(
        (p) => (p.tour_of_interest ?? '') === filters.tour
      )
    }

    // 5. Agent assignment filter
    if (filters.assignedTo) {
      list = list.filter((p) => p.assigned_to === filters.assignedTo)
    }

    return list
  }, [allProspects, filters])

  /** Unique tours present in the data — for the filter dropdown */
  const availableTours = useMemo<string[]>(
    () =>
      Array.from(
        new Set(
          allProspects
            .map((p) => p.tour_of_interest)
            .filter((t): t is string => !!t)
        )
      ).sort(),
    [allProspects]
  )

  /**
   * Unique agents referenced in the data.
   * We only have the ID here; the parent will enrich this from the agents cache.
   */
  const assignedAgentIds = useMemo<string[]>(
    () =>
      Array.from(
        new Set(
          allProspects
            .map((p) => p.assigned_to)
            .filter((id): id is string => !!id)
        )
      ),
    [allProspects]
  )

  const hasActiveFilters =
    filters.statuses.length > 0 ||
    filters.channels.length > 0 ||
    !!filters.tour ||
    !!filters.assignedTo

  const activeFilterCount =
    filters.statuses.length +
    filters.channels.length +
    (filters.tour ? 1 : 0) +
    (filters.assignedTo ? 1 : 0)

  return {
    filters,
    updateFilters,
    resetFilters,
    filtered,
    isLoading,
    error,
    availableTours,
    assignedAgentIds,
    hasActiveFilters,
    activeFilterCount,
  }
}
