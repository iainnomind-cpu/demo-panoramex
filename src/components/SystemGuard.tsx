/**
 * SystemGuard.tsx — Panoramex CRM
 *
 * Global system-status guard. Wraps all protected routes.
 * When org_settings.system_status === 'paused', redirects all
 * authenticated users (regardless of role) to the SystemPaused page.
 *
 * Uses Supabase Realtime (via useOrgSettings) so the transition
 * to "paused" propagates to all active sessions in near-real-time
 * without requiring a page refresh.
 */

import { Outlet } from 'react-router-dom'
import { useOrgSettings } from '../hooks/useOrgSettings'
import { SystemPaused } from '../pages/SystemPaused'

export function SystemGuard() {
  const { data: orgSettings, isLoading } = useOrgSettings()

  // While loading org settings, let the app render normally.
  // This avoids a flash of the paused screen on startup.
  if (isLoading) {
    return <Outlet />
  }

  if (orgSettings?.system_status === 'paused') {
    return <SystemPaused />
  }

  return <Outlet />
}
