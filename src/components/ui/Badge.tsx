import React from 'react';
import { type ProspectStatus, STATUS_CONFIG } from '../../types';

interface BadgeProps {
  status: ProspectStatus;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${className}`}
      style={{
        backgroundColor: config.bg,
        color: config.color,
        border: `1px solid ${config.border}`,
      }}
    >
      <span className="material-symbols-outlined text-[14px]" style={{ color: config.color }}>
        {config.icon}
      </span>
      {config.label}
    </span>
  );
};
