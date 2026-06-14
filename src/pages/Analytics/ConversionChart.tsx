import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const data = [
  { name: 'WhatsApp', value: 45, color: '#16A34A' },
  { name: 'Facebook', value: 25, color: '#2563EB' },
  { name: 'Instagram', value: 20, color: '#C026D3' },
  { name: 'Teléfono', value: 10, color: '#D97706' },
]

export function ConversionChart() {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-headline-h3 text-on-surface">Conversión por Canal</h3>
        <p className="text-body-md text-on-surface-variant">Distribución de leads convertidos a reserva</p>
      </div>
      
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`${value}%`, 'Conversión']}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
