import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useAppStore } from '../../store/useAppStore'

export function TourRankingChart() {
  const { tours } = useAppStore()

  // Mock data based on tours
  const data = tours.slice(0, 5).map((tour, index) => ({
    name: tour.name.substring(0, 15) + (tour.name.length > 15 ? '...' : ''),
    ventas: Math.floor(100 / (index + 1)) + Math.floor(Math.random() * 20),
    color: index === 0 ? '#E8483A' : '#1C2E5E' // Coral for top 1, Navy for others
  }))

  return (
    <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-headline-h3 text-on-surface">Top 5 Tours</h3>
        <p className="text-body-md text-on-surface-variant">Volumen de reservas (mes actual)</p>
      </div>

      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e4e2e6" />
            <XAxis type="number" stroke="#757680" fontSize={12} />
            <YAxis 
              type="category" 
              dataKey="name" 
              stroke="#45464f" 
              fontSize={12} 
              width={100}
              tick={{ fill: '#45464f', fontWeight: 500 }}
            />
            <Tooltip
              cursor={{ fill: '#f5f3f8' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="ventas" radius={[0, 4, 4, 0]} barSize={24}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
