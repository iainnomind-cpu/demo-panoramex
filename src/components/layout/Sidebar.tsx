import React from 'react';
import { NavLink } from 'react-router-dom';

const MENU_ITEMS = [
  { path: '/', label: 'Dashboard', icon: 'dashboard' },
  { path: '/conversaciones', label: 'Conversaciones', icon: 'chat' },
  { path: '/prospectos', label: 'Prospectos', icon: 'view_kanban' },
  { path: '/tours', label: 'Tours', icon: 'map' },
  { path: '/reservaciones', label: 'Reservaciones', icon: 'event_available' },
  { path: '/campanas', label: 'Campañas', icon: 'campaign' },
  { path: '/analytics', label: 'Analytics', icon: 'bar_chart' },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-primary text-on-primary flex flex-col z-40 sidebar-transition shadow-xl">
      <div className="p-6 flex items-center justify-center border-b border-primary-container h-[64px]">
        {/* Logo Text */}
        <h1 className="text-2xl font-bold tracking-wider text-white">PANORAMEX</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        {MENU_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg transition-colors font-medium ${
                isActive
                  ? 'bg-primary-container text-coral shadow-sm'
                  : 'text-on-primary-container hover:bg-primary-container hover:text-white'
              }`
            }
          >
            <span className="material-symbols-outlined mr-3 text-[20px]">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      
      {/* Optional User / Bottom info */}
      <div className="p-4 border-t border-primary-container">
        <div className="flex items-center text-sm text-on-primary-container hover:text-white transition-colors cursor-pointer px-4 py-2">
          <span className="material-symbols-outlined mr-3 text-[20px]">help</span>
          Soporte y Ayuda
        </div>
      </div>
    </aside>
  );
};
