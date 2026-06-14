import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { CHANNEL_CONFIG, STATUS_CONFIG, TOUR_CATEGORY_CONFIG } from '../../types';

interface ProspectProfileProps {
  conversationId: string | null;
}

const ProspectProfile: React.FC<ProspectProfileProps> = ({ conversationId }) => {
  const { conversations, prospects, tours } = useAppStore();

  if (!conversationId) {
    return (
      <div className="w-[300px] bg-white border-l border-gray-200 h-full flex flex-col items-center justify-center p-6 text-center text-gray-500">
        <span className="material-symbols-outlined text-4xl mb-2">person_search</span>
        <p>Selecciona una conversación para ver los detalles del prospecto</p>
      </div>
    );
  }

  const conversation = conversations.find((c) => c.id === conversationId);
  const prospect = conversation ? prospects.find((p) => p.id === conversation.prospect_id) : null;

  if (!prospect) return null;

  const channelConfig = CHANNEL_CONFIG[prospect.canal];
  const statusConfig = STATUS_CONFIG[prospect.estado];
  const tour = tours.find(t => t.id === prospect.tour_interes_id);

  return (
    <div className="w-[300px] bg-white border-l border-gray-200 h-full flex flex-col overflow-y-auto">
      {/* Profile Header */}
      <div className="p-6 flex flex-col items-center border-b border-gray-100 text-center">
        <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-3xl mb-4 shadow-sm border-2 border-white ring-2 ring-gray-100">
          {prospect.nombre.charAt(0)}{prospect.apellido.charAt(0)}
        </div>
        <h2 className="text-xl font-bold text-gray-800">{prospect.nombre} {prospect.apellido}</h2>
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: statusConfig.bg, color: statusConfig.color, border: `1px solid ${statusConfig.border}` }}>
          <span className="material-symbols-outlined text-[14px]">{statusConfig.icon}</span>
          {statusConfig.label}
        </div>
      </div>

      {/* Details */}
      <div className="p-5 flex-1 space-y-6">
        
        {/* Contact Info */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Información de Contacto</h3>
          
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-gray-400 text-[20px] mt-0.5">phone</span>
            <div>
              <p className="text-sm font-medium text-gray-900">{prospect.telefono}</p>
              <p className="text-xs text-gray-500">Móvil</p>
            </div>
          </div>
          
          {prospect.email && (
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-gray-400 text-[20px] mt-0.5">mail</span>
              <div>
                <p className="text-sm font-medium text-gray-900 break-all">{prospect.email}</p>
                <p className="text-xs text-gray-500">Trabajo</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[20px] mt-0.5" style={{ color: channelConfig.color }}>
              {channelConfig.icon}
            </span>
            <div>
              <p className="text-sm font-medium text-gray-900">{channelConfig.label}</p>
              <p className="text-xs text-gray-500">Canal de origen</p>
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Tour Interest */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Interés de Tour</h3>
          
          {tour ? (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">
                  {TOUR_CATEGORY_CONFIG[tour.categoria]?.icon || 'tour'}
                </span>
                <p className="text-sm font-semibold text-gray-800 line-clamp-1">{tour.nombre}</p>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">group</span>
                  {prospect.num_personas} pax
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">calendar_month</span>
                  {prospect.fecha_deseada ? new Date(prospect.fecha_deseada).toLocaleDateString() : 'Por definir'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No hay tour especificado</p>
          )}
        </div>

        <hr className="border-gray-100" />

        {/* Labels */}
        {prospect.etiquetas && prospect.etiquetas.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Etiquetas</h3>
            <div className="flex flex-wrap gap-2">
              {prospect.etiquetas.map(etiqueta => (
                <span key={etiqueta} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium border border-gray-200">
                  {etiqueta}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-5 border-t border-gray-200 space-y-3 bg-gray-50">
        <button className="w-full bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
          <span className="material-symbols-outlined text-[20px]">add_task</span>
          Convertir a Reserva
        </button>
        <button className="w-full bg-white text-gray-700 font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-300 flex items-center justify-center gap-2 shadow-sm">
          <span className="material-symbols-outlined text-[20px]">person</span>
          Ver Perfil Completo
        </button>
      </div>
    </div>
  );
};

export default ProspectProfile;
