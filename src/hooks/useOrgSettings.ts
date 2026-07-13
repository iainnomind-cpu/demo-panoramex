/**
 * useOrgSettings.ts — Panoramex CRM
 *
 * React Query hook for fetching organization_settings with Supabase Realtime subscription.
 *
 * When an admin pauses/activates the system,
 * the change propagates to all connected clients through the Realtime channel,
 * which then invalidates the React Query cache and triggers a re-render.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { OrganizationSettings } from '../types'

const ORG_SETTINGS_KEY = ['organization_settings'] as const

/** Fetch the single organization_settings row. */
export function useOrgSettings() {
  const session = useAuthStore((s) => s.session)
  const queryClient = useQueryClient()

  // Subscribe to Realtime changes on organization_settings so that when an admin
  // pauses/unpauses the system, all active sessions pick it up immediately.
  useEffect(() => {
    if (!session) return

    const channel = supabase
      .channel(`org_settings_changes_${Date.now()}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'org_settings' },
        () => {
          queryClient.invalidateQueries({ queryKey: ORG_SETTINGS_KEY })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session, queryClient])

  return useQuery<OrganizationSettings, Error>({
    queryKey: ORG_SETTINGS_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('org_settings')
        .select('*')
        .order('id')
        .limit(1)
        .single()

      if (error) throw new Error(error.message)
      return data as unknown as OrganizationSettings
    },
    refetchInterval: 30_000,
    enabled: !!session,
  })
}

// ─── Admin Mutation ───────────────────────────────────────────────────────────

type SystemStatus = 'active' | 'paused'

/**
 * useToggleSystemStatus — Admin-only mutation.
 * Routes through the /api/admin/system-status serverless function so that
 * the UPDATE is executed in the user's JWT context, allowing auth.uid() to
 * resolve correctly inside the PostgreSQL audit trigger.
 */
export function useToggleSystemStatus() {
  const queryClient = useQueryClient()
  const session = useAuthStore((s) => s.session)

  const toggle = async (_id: string, status: SystemStatus): Promise<void> => {
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
      const body = await response.json().catch(() => ({}))
      throw new Error(body?.error ?? `Request failed with status ${response.status}`)
    }

    queryClient.invalidateQueries({ queryKey: ORG_SETTINGS_KEY })
  }

  return { toggle }
}
