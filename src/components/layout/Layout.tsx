import React, { type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { Toast } from '../ui/Toast';

interface LayoutProps {
  children?: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen w-full bg-background font-body-md overflow-hidden text-on-surface">
      <Sidebar />
      
      <div className="flex-1 flex flex-col ml-[240px] transition-all min-w-0">
        <TopBar />
        
        <main className="flex-1 overflow-auto p-8 bg-gray-50/50 relative">
          <div className="max-w-[1400px] mx-auto w-full h-full">
            {children || <Outlet />}
          </div>
        </main>
      </div>

      {/* Global Components */}
      <Toast />
    </div>
  );
};
