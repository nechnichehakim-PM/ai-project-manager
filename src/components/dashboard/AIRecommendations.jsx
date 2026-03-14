import React from 'react'

const RECOMMENDATIONS = [
  {
    text: 'Consider adding a buffer to Phase 3 — historical variance suggests +2 weeks.',
    meta: 'Planning · High confidence',
  },
  {
    text: 'Risk R-002 (scope creep) probability increased. Recommend convening change board.',
    meta: 'Risks · Medium confidence',
  },
  {
    text: 'Team workload imbalance: KB at 95%. Suggest redistributing 2 tasks from Infrastructure lot.',
    meta: 'Resources · High confidence',
  },
]

export default function AIRecommendations() {
  return (
    <div className="bg-gradient-to-br from-ai/10 to-primary/5 border border-ai/20 rounded-card p-6 mb-7 shadow-[0_0_40px_rgba(0,229,168,0.06)]">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-[10px] bg-ai/15 flex items-center justify-center text-xl shadow-[0_0_20px_rgba(0,229,168,0.35)]">
          ◆
        </div>
        <span className="font-heading font-semibold text-[#E6EDF5]">AI recommendations</span>
      </div>
      <div className="flex flex-col gap-4">
        {RECOMMENDATIONS.map((rec, i) => (
          <div key={i} className="flex gap-3">
            <span className="w-2 h-2 rounded-full bg-ai/80 mt-1.5 flex-shrink-0" />
            <div>
              <div className="text-sm text-[#E6EDF5]">{rec.text}</div>
              <div className="text-xs text-text-muted mt-0.5">{rec.meta}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
