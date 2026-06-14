import React from 'react';
import { useToast } from '../../hooks/useToast';

export const Toast: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => {
        const typeClasses = {
          success: 'bg-green-100 text-green-800 border-green-200',
          error: 'bg-red-100 text-red-800 border-red-200',
          info: 'bg-blue-100 text-blue-800 border-blue-200',
          warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        };

        const iconMap = {
          success: 'check_circle',
          error: 'error',
          info: 'info',
          warning: 'warning',
        };

        return (
          <div
            key={toast.id}
            className={`flex items-start p-4 border rounded-lg shadow-lg min-w-[300px] transform transition-all duration-300 ease-in-out translate-x-0 opacity-100 ${typeClasses[toast.type]}`}
            style={{ animation: 'slideIn 0.3s ease-out' }}
          >
            <span className="material-symbols-outlined mr-3">{iconMap[toast.type]}</span>
            <div className="flex-1">
              <h4 className="font-semibold text-sm">{toast.title}</h4>
              {toast.message && <p className="text-sm mt-1 opacity-90">{toast.message}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-4 opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Cerrar"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
