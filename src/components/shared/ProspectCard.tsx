import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Prospect, STATUS_CONFIG, CHANNEL_CONFIG } from '../../types'
import { useAppStore } from '../../store/useAppStore'

interface ProspectCardProps {
  prospect: Prospect
  onProspectClick?: (id: string) => void
}

export const ProspectCard: React.FC<ProspectCardProps> = ({ prospect, onProspectClick }) => {
  const navigate = useNavigate()
  const { agents, tours } = useAppStore()

  const statusConfig = STATUS_CONFIG[prospect.estado]
  const channelConfig = CHANNEL_CONFIG[prospect.canal]
  const tour = tours.find((t) => t.id === prospect.tour_interes_id)
  const agent = agents.find((a) => a.id === prospect.agente_id)

  const dateStr = prospect.fecha_deseada
    ? new Date(prospect.fecha_deseada).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    : 'Sin fecha'

  const handleConvert = () => {
    // Simulated toast for now
    alert(`Convertir: ${prospect.nombre}`)
  }

  return (
    <div
      className="bg-white rounded-lg p-4 flex flex-col gap-3 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing border-y border-r border-gray-200"
      style={{ borderLeft: `4px solid ${statusConfig.border}` }}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <button 
            className="font-semibold text-gray-900 truncate hover:text-blue-600 transition-colors text-left"
            onClick={() => onProspectClick && onProspectClick(prospect.id)}
          >
            {prospect.nombre} {prospect.apellido}
          </button>
          <p className="text-sm text-gray-500 font-mono mt-0.5 flex items-center gap-1">
            <span
              className="material-symbols-outlined text-[16px]"
              style={{ color: channelConfig.color }}
            >
              {channelConfig.icon}
            </span>
            {prospect.telefono}
          </p>
        </div>
        {agent && (
          <div
            className="w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-medium text-white shadow-sm"
            style={{ backgroundColor: agent.color }}
            title={agent.nombre}
          >
            {agent.iniciales}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {tour && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 max-w-full">
            <span className="material-symbols-outlined text-[14px]">map</span>
            <span className="truncate">{tour.nombre}</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-600 mt-1">
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">calendar_today</span>
          {dateStr}
        </div>
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">group</span>
          {prospect.num_personas} pax
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 mt-2 pt-3 border-t border-gray-100">
        <button
          onClick={() => navigate(`/conversaciones?id=${prospect.id}`)}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 px-3 rounded-md text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">chat</span>
          Abrir Chat
        </button>
        <button
          onClick={handleConvert}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 px-3 rounded-md text-sm font-medium text-teal-600 bg-teal-50 hover:bg-teal-100 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          Convertir
        </button>
      </div>
    </div>
  )
}
