import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import ChatBubble from '../../components/shared/ChatBubble';

interface ChatAreaProps {
  conversationId: string;
}

const ChatArea: React.FC<ChatAreaProps> = ({ conversationId }) => {
  const { conversations, prospects, currentAgent, addMessageToConversation } = useAppStore();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversation = conversations.find((c) => c.id === conversationId);
  const prospect = conversation ? prospects.find((p) => p.id === conversation.prospect_id) : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.mensajes]);

  if (!conversation || !prospect) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 h-full">
        <div className="text-center text-gray-500">
          <span className="material-symbols-outlined text-4xl mb-2">chat</span>
          <p>Selecciona una conversación para comenzar</p>
        </div>
      </div>
    );
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    addMessageToConversation(conversationId, {
      id: `msg-${Date.now()}`,
      conversacion_id: conversationId,
      tipo: 'saliente',
      contenido: inputText.trim(),
      timestamp: new Date().toISOString(),
      leido: false,
      agente_id: currentAgent?.id,
    });
    
    setInputText('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#efeae2] bg-surface-alt relative">
      {/* Header */}
      <div className="h-[72px] bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
            {prospect.nombre.charAt(0)}{prospect.apellido.charAt(0)}
          </div>
          <div>
            <h2 className="font-semibold text-gray-800">{prospect.nombre} {prospect.apellido}</h2>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              En línea
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-gray-500">
          <button className="hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors">
            <span className="material-symbols-outlined">search</span>
          </button>
          <button className="hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {conversation.mensajes.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-[#f0f2f5] px-4 py-3 border-t border-gray-200">
        <form onSubmit={handleSend} className="flex items-end gap-2">
          <button type="button" className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-200 flex-shrink-0">
            <span className="material-symbols-outlined">mood</span>
          </button>
          <button type="button" className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-200 flex-shrink-0">
            <span className="material-symbols-outlined">attach_file</span>
          </button>
          
          <div className="flex-1 bg-white rounded-lg border border-gray-300 overflow-hidden shadow-sm">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="w-full max-h-32 min-h-[44px] py-2 px-4 focus:outline-none resize-none block"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
            />
          </div>

          {inputText.trim() ? (
            <button 
              type="submit" 
              className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-sm flex-shrink-0 flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
            </button>
          ) : (
            <button 
              type="button" 
              className="p-3 text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-200 flex-shrink-0 flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[20px]">mic</span>
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChatArea;
