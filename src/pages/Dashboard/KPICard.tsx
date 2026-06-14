import React from 'react'

interface KPICardProps {
  title: string
  value: string | number
  subtitle: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  icon: string
  colorClass: string
}

export function KPICard({ title, value, subtitle, trend, trendValue, icon, colorClass }: KPICardProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        {trend && trendValue && (
          <div className={`flex items-center gap-0.5 text-xs font-medium ${
            trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-gray-400'
          }`}>
            <span className="material-symbols-outlined text-base">
              {trend === 'up' ? 'trending_up' : trend === 'down' ? 'trending_down' : 'trending_flat'}
            </span>
            {trendValue}
          </div>
        )}
      </div>
      
      <p className="text-xs text-gray-500 font-medium mb-1">{title}</p>
      <div className="text-3xl font-bold text-gray-900 tracking-tight">{value}</div>
      <p className="text-[11px] text-gray-400 mt-1">{subtitle}</p>
    </div>
  )
}
