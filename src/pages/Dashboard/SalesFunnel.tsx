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
    <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-on-surface">Embudo de Ventas</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">Prospectos por etapa</p>
        </div>
        {/* Filter button removed — feature not yet implemented; dead controls destroy trust */}
      </div>

      <div className="flex-1 min-h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
          >
            {/* Stroke values reference DESIGN.md outline-variant (#c5c6d0) and surface-container (#efedf2) */}
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#efedf2" />
            <XAxis type="number" stroke="#c5c6d0" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#c5c6d0"
              fontSize={12}
              width={110}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#45464f', fontWeight: 500 }}
            />
            <Tooltip
              cursor={{ fill: '#f5f3f8' }}
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #c5c6d0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontSize: '13px',
                background: '#ffffff',
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
