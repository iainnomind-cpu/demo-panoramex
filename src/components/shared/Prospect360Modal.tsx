import React from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { useAppStore } from '../../store/useAppStore'
import { CHANNEL_CONFIG, Channel, ProspectStatus } from '../../types'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Prospect360ModalProps {
  isOpen: boolean
  onClose: () => void
  prospectId: string | null
}

export const Prospect360Modal: React.FC<Prospect360ModalProps> = ({ isOpen, onClose, prospectId }) => {
  const { prospects, conversations, tours, agents } = useAppStore()
  const navigate = useNavigate()

  if (!prospectId) return null

  const prospect = prospects.find(p => p.id === prospectId)
  if (!prospect) return null

  const channelConfig = CHANNEL_CONFIG[(prospect.origin_channel || 'whatsapp') as Channel]
  const tour = tours.find(t => t.id === prospect.tour_of_interest)
  const agent = agents.find(a => a.id === prospect.assigned_to)

  // Find latest messages or activity
  const conversation = conversations.find(c => c.prospect_id === prospectId)

  const handleOpenChat = () => {
    onClose()
    navigate(`/conversaciones?id=${prospect.id}`)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Vista 360 del Prospecto">
      <div className="flex flex-col md:flex-row gap-6 p-2">
        {/* Left Col: Info */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">
          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-navy text-white flex items-center justify-center text-2xl font-bold mb-3 shadow-md">
              {prospect.name[0]}
            </div>
            <h3 className="text-xl font-bold text-on-surface">{prospect.name}</h3>
            <p className="font-mono text-sm text-on-surface-variant mt-1">{prospect.phone}</p>
            <div className="mt-4 flex justify-center">
              <Badge status={prospect.status as ProspectStatus} />
            </div>
          </div>

          <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm">
            <h4 className="text-sm font-semibold text-on-surface uppercase tracking-wider mb-4 border-b border-outline-variant pb-2">Detalles Adicionales</h4>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-on-surface-variant mb-1">Tour de Interés</p>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline text-lg" aria-hidden="true">map</span>
                  <span className="text-sm font-medium">{tour?.name || 'General'}</span>
                </div>
              </div>
              
              <div>
                <p className="text-xs text-on-surface-variant mb-1">Pasajeros</p>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-gray-400 text-lg">group</span>
                  <span className="text-sm">{prospect.num_people || 1} Personas</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-on-surface-variant mb-1">Canal de Adquisición</p>
                <div className="flex items-center gap-2" style={{ color: channelConfig.color }}>
                  <span className="material-symbols-outlined text-lg">{channelConfig.icon}</span>
                  <span className="text-sm capitalize font-medium">{prospect.origin_channel}</span>
                </div>
              </div>

              <div>
                <p className="text-xs text-on-surface-variant mb-1">Asignado a</p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full text-white flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: agent?.color || '#ccc' }}>
                    {agent?.full_name?.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm">{agent?.full_name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Timeline & Actions */}
        <div className="w-full md:w-2/3 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 mb-2">
            <Button variant="primary" leftIcon="chat" onClick={handleOpenChat}>
              Abrir Chat
            </Button>
            <Button variant="secondary" leftIcon="event_available">
              Reservar
            </Button>
            <Button variant="outline" leftIcon="call">Llamar</Button>
            <Button variant="outline" leftIcon="mail">Enviar Email</Button>
          </div>

          <div className="flex-1 bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
            <h4 className="text-sm font-semibold text-on-surface uppercase tracking-wider mb-4 border-b border-outline-variant pb-2">Línea de Tiempo</h4>
            
            <div className="flex-1 overflow-auto pr-2 space-y-4">
              {/* Event derived from created_at date */}
              <div className="relative pl-6 border-l-2 border-surface-variant">
                <div className="absolute w-3 h-3 bg-surface-container-lowest border-2 border-primary rounded-full -left-[7px] top-1"></div>
                <p className="text-xs text-on-surface-variant mb-1">{format(new Date(prospect.created_at), 'd MMM yyyy, HH:mm', { locale: es })}</p>
                <p className="text-sm text-on-surface font-medium">Registro inicial en CRM</p>
                <p className="text-xs text-on-surface-variant mt-1">Origen: {prospect.origin_channel}</p>
              </div>

              {conversation?.mensajes.map((msg, idx) => (
                <div key={idx} className="relative pl-6 border-l-2 border-surface-variant">
                  <div className={`absolute w-3 h-3 bg-white border-2 rounded-full -left-[7px] top-1 ${msg.tipo === 'entrante' ? 'border-coral' : msg.tipo === 'evento' ? 'border-gray-400' : 'border-green-500'}`}></div>
                  <p className="text-xs text-on-surface-variant mb-1">{format(new Date(msg.timestamp), 'd MMM yyyy, HH:mm', { locale: es })}</p>
                  <p className="text-sm text-on-surface">
                    {msg.tipo === 'entrante' && <span className="font-semibold">Mensaje Entrante: </span>}
                    {msg.tipo === 'saliente' && <span className="font-semibold text-green-600">Respuesta: </span>}
                    {msg.tipo === 'evento' && <span className="italic text-gray-500">Evento: </span>}
                    {msg.contenido}
                  </p>
                </div>
              ))}
              
              {(!conversation || conversation.mensajes.length === 0) && (
                <div className="text-sm text-gray-400 italic py-4">No hay historial de conversación registrado.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
