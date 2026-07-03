import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '../components/layout/Layout'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { SystemGuard } from '../components/SystemGuard'
import { Login } from '../pages/Login'
import { Dashboard } from '../pages/Dashboard'
import Conversations from '../pages/Conversations'
import Prospects from '../pages/Prospects'
import { Tours } from '../pages/Tours'
import { Reservations } from '../pages/Reservations'
import { Campaigns } from '../pages/Campaigns'
import { Analytics } from '../pages/Analytics'

export function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected routes — require valid Supabase Auth session */}
      <Route element={<ProtectedRoute />}>
        {/* System guard — shows SystemPaused when org_settings.system_status === 'paused' */}
        <Route element={<SystemGuard />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="conversaciones" element={<Conversations />} />
            <Route path="prospectos" element={<Prospects />} />
            <Route path="tours" element={<Tours />} />
            <Route path="reservaciones" element={<Reservations />} />
            <Route path="campanas" element={<Campaigns />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

