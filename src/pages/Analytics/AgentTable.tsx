import { useAppStore } from '../../store/useAppStore'

export function AgentTable() {
  const { agents } = useAppStore()

  // Mock data for analytics
  const agentStats = agents.map(agent => ({
    ...agent,
    asignados: 10,
    convertidos: 2,
    tiempoRespuesta: `${Math.floor(Math.random() * 10 + 2)}m`,
  }))

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-6 border-b border-outline-variant">
        <h3 className="text-headline-h3 text-on-surface">Rendimiento por Agente</h3>
        <p className="text-body-md text-on-surface-variant">Métricas de conversión y atención</p>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low text-label-caps text-on-surface-variant">
              <th className="p-4 font-semibold">Agente</th>
              <th className="p-4 font-semibold">Asignados</th>
              <th className="p-4 font-semibold">Convertidos</th>
              <th className="p-4 font-semibold">Tasa Conv.</th>
              <th className="p-4 font-semibold">Tiempo Resp.</th>
            </tr>
          </thead>
          <tbody className="text-body-md text-on-surface">
            {agentStats.slice(0, 5).map((agent) => {
              const tasa = Math.round((agent.convertidos / agent.asignados) * 100)
              return (
                <tr key={agent.id} className="border-b border-outline-variant last:border-0 hover:bg-surface-bright">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{ backgroundColor: agent.color }}>
                        {agent.full_name?.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium">{agent.full_name}</span>
                    </div>
                  </td>
                  <td className="p-4">{agent.asignados}</td>
                  <td className="p-4 font-medium text-status-green">{agent.convertidos}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-surface-container-high rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${tasa}%` }}></div>
                      </div>
                      <span className="text-xs font-mono">{tasa}%</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-xs">{agent.tiempoRespuesta}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
