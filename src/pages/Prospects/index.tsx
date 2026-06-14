import React, { useState } from 'react'
import { KanbanBoard } from './KanbanBoard'
import { ProspectList } from './ProspectList'
import { Prospect360Modal } from '../../components/shared/Prospect360Modal'

export const Prospects: React.FC = () => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(null)

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Top Bar */}
      <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-white z-10 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-navy">Prospectos (CRM)</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona y da seguimiento a tus prospectos en el embudo de ventas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md flex items-center justify-center transition-colors ${viewMode === 'kanban' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              title="Vista Kanban"
            >
              <span className="material-symbols-outlined text-[20px]">view_kanban</span>
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md flex items-center justify-center transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              title="Vista Lista"
            >
              <span className="material-symbols-outlined text-[20px]">view_list</span>
            </button>
          </div>

          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
              search
            </span>
            <input 
              type="text" 
              placeholder="Buscar prospecto..." 
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64 transition-shadow bg-gray-50 focus:bg-white"
            />
          </div>

          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors bg-white">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
            Filtros
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm ml-2">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Nuevo Prospecto
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 overflow-hidden bg-[#F8F9FA]">
        {viewMode === 'kanban' ? (
          <KanbanBoard onProspectClick={setSelectedProspectId} />
        ) : (
          <div className="h-full overflow-auto pb-6">
            <ProspectList onProspectClick={setSelectedProspectId} />
          </div>
        )}
      </div>

      <Prospect360Modal 
        isOpen={!!selectedProspectId} 
        onClose={() => setSelectedProspectId(null)} 
        prospectId={selectedProspectId} 
      />
    </div>
  )
}

export default Prospects
