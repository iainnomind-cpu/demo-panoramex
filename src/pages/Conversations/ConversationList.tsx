import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { Conversation, Prospect } from '../../types';

interface ConversationListProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ selectedId, onSelect }) => {
  const { conversations, prospects } = useAppStore();

  return (
    <div className="w-[320px] bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Mensajes</h2>
        <button className="text-gray-500 hover:text-gray-700">
          <span className="material-symbols-outlined">filter_list</span>
        </button>
      </div>

      <div className="p-2">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar conversación..."
            className="w-full bg-gray-100 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => {
          const prospect = prospects.find((p) => p.id === conv.prospect_id);
          if (!prospect) return null;

          const lastMessage = conv.mensajes[conv.mensajes.length - 1];
          const isSelected = selectedId === conv.id;
          
          const timeString = lastMessage
            ? new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '';

          return (
            <div
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`flex items-start gap-3 p-3 cursor-pointer transition-colors border-b border-gray-100 last:border-0 ${
                isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-600 font-bold text-lg">
                {prospect.nombre.charAt(0)}{prospect.apellido.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {prospect.nombre} {prospect.apellido}
                  </h3>
                  <span className={`text-xs ${conv.no_leidos > 0 && !isSelected ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                    {timeString}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500 truncate pr-2">
                    {lastMessage?.contenido || 'Sin mensajes'}
                  </p>
                  {conv.no_leidos > 0 && !isSelected && (
                    <span className="bg-green-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0">
                      {conv.no_leidos}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConversationList;
