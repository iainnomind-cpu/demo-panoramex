// ============================================================
// PANORAMEX CRM — Data Index
// Re-exports all mock data + dashboard stats
// ============================================================

export { agents } from './agents'
export { tours } from './tours'
export { prospects } from './prospects'
export { conversations } from './conversations'
export { reservations } from './reservations'
export { campaigns } from './campaigns'

// ── Dashboard Stats ─────────────────────────────────────────
export const dashboardStats = {
  leads_hoy: 47,
  calificados_hoy: 12,
  reservas_activas: 8,
  tasa_conversion: 26,
  embudo: {
    nuevo: 142,
    calificado: 85,
    reservado: 34,
    convertido: 28,
  },
}
