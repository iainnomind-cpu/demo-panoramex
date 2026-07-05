import React from 'react'

interface KPICardProps {
  title: string
  value: string | number
  subtitle: string
  icon: string
  colorClass: string
}

export function KPICard({ title, value, subtitle, icon, colorClass }: KPICardProps) {
  return (
    <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
          <span className="material-symbols-outlined text-xl" aria-hidden="true">{icon}</span>
        </div>
      </div>

      <p className="text-xs text-on-surface-variant font-medium mb-1">{title}</p>
      <div className="text-3xl font-bold text-on-surface tracking-tight">{value}</div>
      {/* text-xs (12px) is the minimum per DESIGN.md label scale; text-outline passes WCAG AA on surface-container-lowest */}
      <p className="text-xs text-outline mt-1">{subtitle}</p>
    </div>
  )
}
