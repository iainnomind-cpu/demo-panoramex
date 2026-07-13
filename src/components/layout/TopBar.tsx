import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

const getPageTitle = (pathname: string) => {
  if (pathname === '/') return 'Dashboard';
  const path = pathname.split('/')[1];
  return path.charAt(0).toUpperCase() + path.slice(1);
};

export const TopBar: React.FC = () => {
  const location = useLocation();
  const { agent } = useAuthStore();
  const title = getPageTitle(location.pathname);
  
  const initials = agent?.full_name ? agent.full_name.substring(0, 2).toUpperCase() : 'AG';

  return (
    <header className="h-[64px] bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center">
        <h2 className="text-xl font-semibold text-on-surface">{title}</h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
            <span className="material-symbols-outlined text-[20px]">search</span>
          </div>
          <input
            type="text"
            placeholder="Buscar..."
            disabled
            title="Búsqueda global próximamente"
            className="block w-64 rounded-full border border-outline-variant bg-surface py-2 pl-10 pr-4 text-sm placeholder:text-outline focus:outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-surface-container"
          />
        </div>

        {/* Notification bell — disabled until notification panel is implemented */}
        <button
          aria-label="Notificaciones"
          title="Notificaciones próximamente"
          disabled
          className="relative text-on-surface-variant transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
        >
          <span className="material-symbols-outlined">notifications</span>
        </button>

        <div className="flex items-center gap-3 border-l border-outline-variant pl-6">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-semibold text-on-surface">{agent?.full_name || 'Agente'}</span>
            <span className="text-xs text-on-surface-variant capitalize">{agent?.role || 'user'}</span>
          </div>
          <div className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm" style={{ backgroundColor: agent?.color || '#3b82f6' }}>
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
};
