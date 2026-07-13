import React, { memo } from 'react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { CHANNEL_CONFIG, ProspectStatus, Channel } from '../../types'
import type { ProspectRow } from '../../hooks/useProspects'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ProspectListProps {
  prospects: ProspectRow[]
  onProspectClick?: (prospectId: string) => void
}

interface ProspectRowItemProps {
  prospect: ProspectRow
  onClick?: (prospectId: string) => void
}

/**
 * Memoized row component to prevent full list re-renders on minor state changes.
 * This is a critical performance hardening step for large data sets in React.
 */
const ProspectRowItem = memo(
  function ProspectRowItem({ prospect, onClick }: ProspectRowItemProps) {
    const channelConfig = CHANNEL_CONFIG[(prospect.origin_channel as Channel) || 'whatsapp']
    const tourName = prospect.tour_of_interest || 'General'
    const nameParts = prospect.name.split(' ')
    const initials = nameParts.length > 1 
      ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
      : prospect.name.substring(0, 2).toUpperCase()
    
    return (
      <tr className="hover:bg-surface-container-low/60 transition-colors">
        <td className="px-6 py-4">
          <button 
            onClick={() => onClick && onClick(prospect.id)}
            className="flex items-center gap-3 text-left hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm p-1 -ml-1 w-full"
            title={`Ver detalles de ${prospect.name}`}
          >
            <div className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-on-surface truncate font-sans">{prospect.name}</div>
              {(prospect.tags && prospect.tags.length > 0) && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {prospect.tags.map((e: string) => (
                    <span key={e} className="text-[10px] bg-surface-container-high text-on-surface-variant px-1.5 py-0.5 rounded truncate max-w-[100px]">{e}</span>
                  ))}
                </div>
              )}
            </div>
          </button>
        </td>
        <td className="px-6 py-4">
          <div className="text-sm font-mono text-on-surface-variant whitespace-nowrap">{prospect.phone}</div>
        </td>
        <td className="px-6 py-4">
          <div className="text-sm text-on-surface max-w-[200px] truncate" title={tourName}>
            {tourName}
          </div>
          <div className="text-xs text-on-surface-variant mt-0.5 whitespace-nowrap">{prospect.num_people || 1} pax</div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-1.5 text-sm whitespace-nowrap" style={{ color: channelConfig?.color || 'inherit' }}>
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">{channelConfig?.icon || 'help'}</span>
            <span className="capitalize">{prospect.origin_channel || 'Desconocido'}</span>
          </div>
        </td>
        <td className="px-6 py-4">
          <Badge status={prospect.status as ProspectStatus} />
        </td>
        <td className="px-6 py-4">
          <div className="text-sm text-on-surface-variant whitespace-nowrap">
            {format(new Date(prospect.created_at), 'd MMM yyyy', { locale: es })}
          </div>
        </td>
        <td className="px-6 py-4 text-right">
          <Button variant="ghost" onClick={() => onClick && onClick(prospect.id)}>
            Ver 360
          </Button>
        </td>
      </tr>
    )
  },
  // Custom comparator to aggressively prevent re-renders when structural sharing breaks
  (prevProps, nextProps) => {
    return (
      prevProps.prospect.id === nextProps.prospect.id &&
      prevProps.prospect.status === nextProps.prospect.status &&
      prevProps.prospect.last_activity_at === nextProps.prospect.last_activity_at &&
      prevProps.prospect.assigned_to === nextProps.prospect.assigned_to &&
      prevProps.prospect.name === nextProps.prospect.name &&
      prevProps.prospect.phone === nextProps.prospect.phone
    )
  }
)

export function ProspectList({ prospects, onProspectClick }: ProspectListProps) {


  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden mx-6 my-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container border-b border-outline-variant">
            <tr className="text-sm font-medium text-on-surface-variant">
              <th className="px-6 py-4">Prospecto</th>
              <th className="px-6 py-4">Contacto</th>
              <th className="px-6 py-4">Interés</th>
              <th className="px-6 py-4">Origen</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4">Registro</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30">
            {prospects.map((prospect) => (
              <ProspectRowItem 
                key={prospect.id} 
                prospect={prospect} 
                onClick={onProspectClick} 
              />
            ))}
            
            {prospects.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[40px] opacity-40">search_off</span>
                    <p className="text-sm font-medium">Sin resultados</p>
                    <p className="text-xs">Ajusta la búsqueda o los filtros.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
