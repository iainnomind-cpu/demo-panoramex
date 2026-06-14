import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { STATUS_CONFIG, ProspectStatus } from '../../types'

interface SalesFunnelProps {
  data: {
    status: ProspectStatus
    count: number
  }[]
}

export function SalesFunnel({ data }: SalesFunnelProps) {
  const chartData = data.map(item => ({
    name: STATUS_CONFIG[item.status].label,
    value: item.count,
    fill: STATUS_CONFIG[item.status].color
  }))

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Embudo de Ventas</h3>
          <p className="text-xs text-gray-500 mt-0.5">Prospectos por etapa en tiempo real</p>
        </div>
        <button className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors">
          <span className="material-symbols-outlined text-gray-400 text-xl">filter_alt</span>
        </button>
      </div>

      <div className="flex-1 min-h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
            <XAxis type="number" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis 
              type="category" 
              dataKey="name" 
              stroke="#6b7280" 
              fontSize={12} 
              width={110}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#374151', fontWeight: 500 }}
            />
            <Tooltip
              cursor={{ fill: '#f9fafb' }}
              contentStyle={{ 
                borderRadius: '10px', 
                border: '1px solid #e5e7eb', 
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07)',
                fontSize: '13px'
              }}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
