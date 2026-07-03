/**
 * ProtectedRoute.tsx — Panoramex CRM
 *
 * Route guard that checks Supabase Auth session state.
 * Renders a loading screen while the initial session is resolving,
 * redirects to /login if unauthenticated, and renders children otherwise.
 *
 * Usage:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="dashboard" element={<Dashboard />} />
 *   </Route>
 */

import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export function ProtectedRoute() {
  const session = useAuthStore((s) => s.session)
  const loading = useAuthStore((s) => s.loading)

  // While the initial getSession() call is in flight, show a neutral loader
  // to avoid a flash of the login page on authenticated page refreshes.
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <span className="text-gray-400 text-sm">Cargando...</span>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
