import React, { useState } from 'react'
import { useOrgSettings, useToggleSystemStatus } from '../../hooks/useOrgSettings'
import { exportAllData, downloadJsonData } from '../../lib/exportData'

export const SettingsPage: React.FC = () => {
  const { data: organizationSettings, isLoading: isSettingsLoading } = useOrgSettings()
  const { toggle } = useToggleSystemStatus()
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)

  const handleToggleStatus = async () => {
    if (!organizationSettings) return
    setLoading(true)
    const newStatus = organizationSettings.system_status === 'active' ? 'paused' : 'active'
    try {
      await toggle(organizationSettings.id, newStatus)
    } catch (err) {
      console.error('Failed to toggle status', err)
    }
    setLoading(false)
  }

  const handleExportData = async () => {
    setExporting(true)
    try {
      const data = await exportAllData()
      const dateStr = new Date().toISOString().split('T')[0]
      downloadJsonData(data, `panoramex_export_${dateStr}.json`)
    } catch (err) {
      console.error('Failed to export data', err)
      alert('Error al exportar datos. Verifica la consola para más detalles.')
    }
    setExporting(false)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-on-surface">Ajustes de Organización</h1>
        <p className="text-on-surface-variant mt-2">Configuración global del sistema CRM Panoramex</p>
      </div>

      <div className="bg-surface border border-outline-variant rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <span className="material-symbols-outlined mr-2">build_circle</span>
          Estado del Sistema
        </h2>
        
        <div className="flex items-center justify-between py-4 border-b border-outline-variant last:border-0">
          <div>
            <h3 className="font-semibold text-lg">Pausar Consumo de Meta</h3>
            <p className="text-sm text-on-surface-variant mt-1">
              Desactiva temporalmente el procesamiento de webhooks y campañas para detener el consumo de la API de WhatsApp.
            </p>
          </div>
          <button
            onClick={handleToggleStatus}
            disabled={loading || isSettingsLoading || !organizationSettings}
            className={`px-6 py-2 rounded-full font-medium shadow transition-colors flex items-center gap-2 ${
              organizationSettings?.system_status === 'paused'
                ? 'bg-red-100 text-red-800 hover:bg-red-200'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            } disabled:opacity-50`}
          >
            {loading || isSettingsLoading ? (
              <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
            ) : (
              <span className="material-symbols-outlined text-[20px]">
                {organizationSettings?.system_status === 'paused' ? 'pause_circle' : 'play_circle'}
              </span>
            )}
            {organizationSettings?.system_status === 'paused' ? 'Pausado' : 'Activo'}
          </button>
        </div>

        <div className="flex items-center justify-between py-4 border-b border-outline-variant last:border-0 mt-4">
          <div>
            <h3 className="font-semibold text-lg">Exportar Datos</h3>
            <p className="text-sm text-on-surface-variant mt-1">
              Descarga una copia completa de toda la información (prospectos, mensajes, reservaciones) en formato JSON.
            </p>
          </div>
          <button
            onClick={handleExportData}
            disabled={exporting}
            className="px-6 py-2 rounded-full font-medium shadow bg-primary text-on-primary hover:bg-primary-dark transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {exporting ? (
              <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
            ) : (
              <span className="material-symbols-outlined text-[20px]">download</span>
            )}
            {exporting ? 'Exportando...' : 'Exportar JSON'}
          </button>
        </div>
      </div>
    </div>
  )
}
