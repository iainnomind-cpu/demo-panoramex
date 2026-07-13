/**
 * useProspects.ts — Panoramex CRM
 *
 * React Query hook for fetching all prospects from Supabase.
 * Replaces the static mock data previously imported from src/data/prospects.ts.
 *
 * The anon-key Supabase client is used here — RLS policies on the prospects
 * table ensure authenticated users can read all prospects (no privacy between
 * agents per business rules).
 */

import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/database.types'
import { useAuthStore } from '../store/authStore'

export type ProspectRow = Database['public']['Tables']['prospects']['Row']

const PROSPECTS_KEY = ['prospects'] as const

// ─── Queries ─────────────────────────────────────────────────────────────────

/** Fetch all prospects, ordered by most recently created first. */
export function useProspects() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel(`prospects-changes-${Date.now()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'prospects' },
        () => {
          // Invalidate cache to refetch fresh data on any prospect change
          queryClient.invalidateQueries({ queryKey: PROSPECTS_KEY })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  return useQuery<ProspectRow[], Error>({
    queryKey: PROSPECTS_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prospects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw new Error(error.message)
      return data
    },
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

interface ReassignVars {
  prospect_id: string
  new_agent_id: string
}

/**
 * useReassignProspect — Admin-only mutation.
 *
 * Calls the Vercel serverless function /api/admin/reassign-prospect
 * which holds the service_role key. Passes the user's JWT so the
 * function can verify identity and admin role server-side.
 *
 * Constitution gate: privileged ops go through serverless functions only.
 */
export function useReassignProspect() {
  const queryClient = useQueryClient()
  const session = useAuthStore((s) => s.session)

  return useMutation<void, Error, ReassignVars>({
    mutationFn: async ({ prospect_id, new_agent_id }) => {
      const jwt = session?.access_token
      if (!jwt) throw new Error('Not authenticated')

      const response = await fetch('/api/admin/reassign-prospect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ prospect_id, new_agent_id }),
      })

      if (!response.ok) {
        const body = await response.json() as { error?: string }
        throw new Error(body.error ?? 'Reassignment failed')
      }
    },
    onSuccess: () => {
      // Invalidate prospects cache so UI reflects the new assignment immediately
      queryClient.invalidateQueries({ queryKey: PROSPECTS_KEY })
    },
  })
}

interface UpdateStatusVars {
  prospect_id: string
  new_status: string
}

/**
 * useUpdateProspectStatus — Allows any authenticated agent to update a prospect's status.
 */
export function useUpdateProspectStatus() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, UpdateStatusVars>({
    mutationFn: async ({ prospect_id, new_status }) => {
      const { error } = await (supabase
        .from('prospects') as any)
        .update({ status: new_status, last_activity_at: new Date().toISOString() })
        .eq('id', prospect_id)

      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      // Data is invalidated by the Realtime subscription in useProspects,
      // but invalidating here makes the UI responsive immediately for the actor.
      queryClient.invalidateQueries({ queryKey: PROSPECTS_KEY })
    },
  })
}
