import React from 'react';
import { useLocation } from 'react-router-dom';

const getPageTitle = (pathname: string) => {
  if (pathname === '/') return 'Dashboard';
  const path = pathname.split('/')[1];
  return path.charAt(0).toUpperCase() + path.slice(1);
};

export const TopBar: React.FC = () => {
  const location = useLocation();
  const title = getPageTitle(location.pathname);

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
            className="block w-64 rounded-full border border-outline-variant bg-surface py-2 pl-10 pr-4 text-sm placeholder:text-outline focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        <button className="relative text-on-surface-variant hover:text-primary transition-colors focus:outline-none">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-coral ring-2 ring-surface-container-lowest"></span>
        </button>

        <div className="flex items-center gap-3 border-l border-outline-variant pl-6">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-semibold text-on-surface">Cianya López</span>
            <span className="text-xs text-on-surface-variant">Asesor</span>
          </div>
          <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-white font-bold shadow-sm">
            CL
          </div>
        </div>
      </div>
    </header>
  );
};
