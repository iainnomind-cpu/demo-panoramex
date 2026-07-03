/**
 * useOrgSettings.ts — Panoramex CRM
 *
 * React Query hook for fetching org_settings with Supabase Realtime subscription.
 *
 * When an admin pauses/activates the system via /api/admin/system-status,
 * the change propagates to all connected clients through the Realtime channel,
 * which then invalidates the React Query cache and triggers a re-render.
 *
 * This allows the SystemGuard to react in near-real-time without polling.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/database.types'
import { useAuthStore } from '../store/authStore'

export type OrgSettingsRow = Database['public']['Tables']['org_settings']['Row']

const ORG_SETTINGS_KEY = ['org_settings'] as const

/** Fetch the single org_settings row. */
export function useOrgSettings() {
  const session = useAuthStore((s) => s.session)
  const queryClient = useQueryClient()

  // Subscribe to Realtime changes on org_settings so that when an admin
  // pauses/unpauses the system, all active sessions pick it up immediately.
  useEffect(() => {
    if (!session) return

    const channel = supabase
      .channel('org_settings_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'org_settings' },
        () => {
          // Invalidate cache to trigger an immediate re-fetch when org_settings changes
          queryClient.invalidateQueries({ queryKey: ORG_SETTINGS_KEY })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session, queryClient])

  return useQuery<OrgSettingsRow, Error>({
    queryKey: ORG_SETTINGS_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('org_settings')
        .select('*')
        .order('id')
        .limit(1)
        .single()

      if (error) throw new Error(error.message)
      return data
    },
    // Refetch every 30 seconds as a fallback if Realtime misses an update
    refetchInterval: 30_000,
    // Don't query if user isn't authenticated
    enabled: !!session,
  })
}

// ─── Admin Mutation ───────────────────────────────────────────────────────────

type SystemStatus = 'active' | 'paused'

/**
 * useToggleSystemStatus — Admin-only mutation.
 * Routes through the Vercel serverless function (service_role protected).
 */
export function useToggleSystemStatus() {
  const queryClient = useQueryClient()
  const session = useAuthStore((s) => s.session)

  const toggle = async (status: SystemStatus): Promise<void> => {
    const jwt = session?.access_token
    if (!jwt) throw new Error('Not authenticated')

    const response = await fetch('/api/admin/system-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      const body = await response.json() as { error?: string }
      throw new Error(body.error ?? 'Failed to update system status')
    }

    // Optimistically invalidate — Realtime will also fire but this ensures
    // the triggering admin sees the update immediately.
    queryClient.invalidateQueries({ queryKey: ORG_SETTINGS_KEY })
  }

  return { toggle }
}
