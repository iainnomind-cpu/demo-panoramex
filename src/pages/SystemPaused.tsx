/**
 * SystemPaused.tsx — Panoramex CRM
 *
 * Screen displayed to all users (including agents already logged in)
 * when an admin has paused the CRM system via org_settings.
 * This page is shown by the SystemGuard component.
 */

import { useAuthStore } from '../store/authStore'
import { useToggleSystemStatus, useOrgSettings } from '../hooks/useOrgSettings'
import { useState } from 'react'

export function SystemPaused() {
  const agent = useAuthStore((s) => s.agent)
  const signOut = useAuthStore((s) => s.signOut)
  const { toggle } = useToggleSystemStatus()
  const { data: orgSettings } = useOrgSettings()
  const [activating, setActivating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isAdmin = agent?.role === 'admin'

  const handleActivate = async () => {
    if (!orgSettings?.id) return
    setActivating(true)
    setError(null)
    try {
      await toggle(orgSettings.id, 'active')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setActivating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Status Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-900/40 border border-amber-700 flex items-center justify-center">
          <span className="material-symbols-outlined text-amber-400 text-3xl">pause_circle</span>
        </div>

        {/* Heading */}
        <div>
          <h1 className="text-2xl font-bold text-white">Sistema en pausa</h1>
          <p className="text-gray-400 text-sm mt-2">
            El sistema CRM ha sido pausado por un administrador.
            No se están procesando mensajes nuevos de WhatsApp.
          </p>
        </div>

        {error && (
          <div className="bg-red-950 border border-red-800 text-red-300 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Admin action */}
        {isAdmin && (
          <button
            id="activate-system-btn"
            onClick={handleActivate}
            disabled={activating}
            className="w-full bg-green-700 hover:bg-green-600 disabled:bg-green-900 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-2.5 text-sm transition-colors"
          >
            {activating ? 'Activando...' : 'Reactivar sistema'}
          </button>
        )}

        {/* Sign out */}
        <button
          id="signout-paused-btn"
          onClick={signOut}
          className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
