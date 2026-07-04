import { useAnalyticsStore } from '../../store/useAnalyticsStore'

export function BotPerformance() {
  const { botPerformance, surveyAggregates } = useAnalyticsStore()

  if (!botPerformance || !surveyAggregates) return null

  const handoffRate = botPerformance.total_leads > 0
    ? Math.round((botPerformance.human_handoff / botPerformance.total_leads) * 100)
    : 0

  const botQualifiedRate = botPerformance.total_leads > 0
    ? Math.round((botPerformance.bot_qualified / botPerformance.total_leads) * 100)
    : 0

  const totalSurveys = surveyAggregates.rating_1_count + surveyAggregates.rating_3_count + surveyAggregates.rating_5_count

  const getPercent = (count: number) => totalSurveys > 0 ? Math.round((count / totalSurveys) * 100) : 0

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col gap-6">
      
      {/* Bot vs Human */}
      <div>
        <h3 className="text-headline-h3 text-on-surface mb-4">Resolución por Bot vs Humano</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <div className="text-body-sm text-on-surface-variant uppercase tracking-wide">Solo Bot</div>
              <div className="text-headline-h2 text-status-teal">{botPerformance.bot_qualified}</div>
            </div>
            <div className="text-right">
              <div className="text-body-sm text-on-surface-variant uppercase tracking-wide">Pase a Humano</div>
              <div className="text-headline-h2 text-primary">{botPerformance.human_handoff}</div>
            </div>
          </div>
          
          <div className="h-4 bg-surface-container-low rounded-full overflow-hidden flex">
            <div className="bg-status-teal h-full transition-all" style={{ width: `${botQualifiedRate}%` }} />
            <div className="bg-primary h-full transition-all" style={{ width: `${handoffRate}%` }} />
          </div>
          <div className="flex justify-between text-label-sm font-medium">
            <span className="text-status-teal">{botQualifiedRate}%</span>
            <span className="text-primary">{handoffRate}%</span>
          </div>
        </div>
      </div>

      {/* Survey Results */}
      <div className="border-t border-outline-variant pt-6">
        <h3 className="text-headline-h3 text-on-surface mb-4">Encuesta Post-Tour</h3>
        
        <div className="flex items-center gap-6 mb-4">
          <div className="text-[48px] font-bold text-on-surface leading-none">
            {Number(surveyAggregates.average_rating).toFixed(1)}
          </div>
          <div className="flex flex-col">
            <div className="flex text-status-orange text-[24px]">
              {'★'.repeat(Math.round(surveyAggregates.average_rating))}{'☆'.repeat(5 - Math.round(surveyAggregates.average_rating))}
            </div>
            <div className="text-body-sm text-on-surface-variant">{totalSurveys} valoraciones</div>
          </div>
        </div>

        <div className="space-y-2">
          {[
            { label: 'Excelente (5)', count: surveyAggregates.rating_5_count, color: 'bg-status-green' },
            { label: 'Regular (3)', count: surveyAggregates.rating_3_count, color: 'bg-status-orange' },
            { label: 'Mala (1)', count: surveyAggregates.rating_1_count, color: 'bg-error' },
          ].map(r => (
            <div key={r.label} className="flex items-center gap-3">
              <div className="w-24 text-label-sm text-on-surface-variant">{r.label}</div>
              <div className="flex-1 h-2 bg-surface-container-low rounded-full overflow-hidden">
                <div className={`h-full ${r.color} transition-all`} style={{ width: `${getPercent(r.count)}%` }} />
              </div>
              <div className="w-8 text-right text-label-sm font-medium text-on-surface">{getPercent(r.count)}%</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
