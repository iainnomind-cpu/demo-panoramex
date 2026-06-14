import React from 'react';
import type { Message } from '../../types';

interface ChatBubbleProps {
  message: Message;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const { tipo, contenido, timestamp } = message;
  const timeString = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (tipo === 'evento' || tipo === 'nota') {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-sm border border-gray-200">
          {tipo === 'nota' && <span className="material-symbols-outlined text-[14px]">edit_note</span>}
          {tipo === 'evento' && <span className="material-symbols-outlined text-[14px]">event</span>}
          {contenido}
        </div>
      </div>
    );
  }

  const isOutgoing = tipo === 'saliente';

  return (
    <div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'} my-2 px-4`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2 relative shadow-sm text-sm ${
          isOutgoing
            ? 'bg-[#E7FFDB] rounded-tr-none text-gray-800'
            : 'bg-white rounded-tl-none text-gray-800'
        }`}
      >
        <div className="whitespace-pre-wrap break-words text-[15px]">{contenido}</div>
        <div className="text-[11px] text-gray-500 text-right mt-1 flex justify-end items-center gap-1">
          {timeString}
          {isOutgoing && (
            <span className={`material-symbols-outlined text-[14px] ${message.leido ? 'text-blue-500' : 'text-gray-400'}`}>
              done_all
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
