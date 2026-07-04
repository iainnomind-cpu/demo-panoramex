import { FunnelData, STATUS_CONFIG } from '../../types'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'

interface Props {
  data: FunnelData[]
}

export function FunnelChart({ data }: Props) {
  // Define the logical order of the funnel
  const funnelOrder = ['nuevo', 'en_proceso', 'calificado', 'reservado', 'convertido']
  
  // Sort and map the data
  const chartData = funnelOrder.map(status => {
    const item = data.find(d => d.status === status)
    return {
      name: STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label || status,
      value: item ? item.count : 0,
      color: STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.color || '#9CA3AF'
    }
  }).filter(d => d.value > 0)

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
      <h3 className="text-headline-h3 text-on-surface mb-6">Embudo de Ventas Activo</h3>
      <div className="h-72 w-full">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-on-surface-variant text-body-lg">
            No hay datos suficientes
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#4B5563', fontSize: 12, fontWeight: 500 }}
                width={120}
              />
              <Tooltip 
                cursor={{ fill: '#F3F4F6' }}
                contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
