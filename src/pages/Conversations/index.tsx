import React, { useState } from 'react';
import ConversationList from './ConversationList';
import ChatArea from './ChatArea';
import ProspectProfile from './ProspectProfile';

const ConversationsPage: React.FC = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-white">
      <ConversationList 
        selectedId={selectedConversationId} 
        onSelect={setSelectedConversationId} 
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        {selectedConversationId ? (
          <ChatArea conversationId={selectedConversationId} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#efeae2] h-full">
            <div className="text-center text-gray-500 bg-white/80 p-8 rounded-2xl shadow-sm border border-gray-100 max-w-sm">
              <span className="material-symbols-outlined text-6xl mb-4 text-gray-300">forum</span>
              <h2 className="text-xl font-medium text-gray-800 mb-2">Panoramex CRM Chat</h2>
              <p className="text-sm">Selecciona una conversación del panel izquierdo para comenzar a mensajear.</p>
            </div>
          </div>
        )}
      </div>

      <ProspectProfile conversationId={selectedConversationId} />
    </div>
  );
};

export default ConversationsPage;
