import { useAnalyticsStore } from '../../store/useAnalyticsStore'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import { CHANNEL_CONFIG } from '../../types'

const COLORS = ['#2563EB', '#16A34A', '#D97706', '#DC2626', '#8B5CF6', '#0D9488']

export function ConversionCharts() {
  const { conversionByTour, conversionByChannel, agentPerformance } = useAnalyticsStore()

  const channelData = conversionByChannel.map(c => ({
    name: CHANNEL_CONFIG[c.channel]?.label || c.channel,
    conversions: c.conversion_count,
    leads: c.lead_count
  }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tour Conversions */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
          <h3 className="text-headline-h3 text-on-surface mb-6">Conversiones por Tour</h3>
          <div className="h-72 w-full">
            {conversionByTour.length === 0 ? (
              <div className="flex items-center justify-center h-full text-on-surface-variant">Sin datos</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={conversionByTour}
                    dataKey="conversion_count"
                    nameKey="tour_name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {conversionByTour.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Channel Conversions */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm">
          <h3 className="text-headline-h3 text-on-surface mb-6">Rendimiento por Canal</h3>
          <div className="h-72 w-full">
            {channelData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-on-surface-variant">Sin datos</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={channelData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip cursor={{ fill: '#F3F4F6' }} />
                  <Legend />
                  <Bar dataKey="leads" name="Leads" fill="#9CA3AF" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="conversions" name="Conversiones" fill="#16A34A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Agent Performance Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm overflow-x-auto">
        <h3 className="text-headline-h3 text-on-surface mb-6">Rendimiento de Agentes</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant text-label-sm text-on-surface-variant">
              <th className="py-3 px-4 font-medium">Agente</th>
              <th className="py-3 px-4 font-medium">Leads Asignados</th>
              <th className="py-3 px-4 font-medium">Leads Atendidos</th>
              <th className="py-3 px-4 font-medium">Conversiones</th>
              <th className="py-3 px-4 font-medium">Tasa de Cierre</th>
            </tr>
          </thead>
          <tbody>
            {agentPerformance.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-on-surface-variant">Sin datos en el periodo</td>
              </tr>
            ) : (
              agentPerformance.map(agent => {
                const closeRate = agent.leads_attended > 0 
                  ? Math.round((agent.conversions / agent.leads_attended) * 100) 
                  : 0
                return (
                  <tr key={agent.agent_id} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
                    <td className="py-3 px-4 text-body-md text-on-surface font-medium">{agent.agent_name}</td>
                    <td className="py-3 px-4 text-body-md text-on-surface-variant">{agent.leads_assigned}</td>
                    <td className="py-3 px-4 text-body-md text-on-surface-variant">{agent.leads_attended}</td>
                    <td className="py-3 px-4 text-body-md text-status-green font-semibold">{agent.conversions}</td>
                    <td className="py-3 px-4 text-body-md text-on-surface-variant">{closeRate}%</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
