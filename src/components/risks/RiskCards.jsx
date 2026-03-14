import React from 'react'
import GlassCard from '../ui/GlassCard'

const RISKS = [
  {
    desc: 'Retard fournisseur infrastructure serveurs',
    prob: 'High',
    impact: 'High',
    owner: 'Owner: AN · Mitigation: Backup suppliers',
  },
  {
    desc: 'Scope creep in deployment phase',
    prob: 'Med',
    impact: 'Critical',
    owner: 'Owner: AN · Change board',
  },
]

export default function RiskCards() {
  return (
    <div className="space-y-3">
      {RISKS.map((r, i) => (
        <GlassCard key={i} className="p-4">
          <div className="font-medium text-[#E6EDF5] mb-2">{r.desc}</div>
          <div className="flex flex-wrap gap-2 mb-1.5">
            <span className="font-mono text-[0.7rem] px-2 py-0.5 rounded bg-amber-900/30 text-warning">
              Prob: {r.prob}
            </span>
            <span className="font-mono text-[0.7rem] px-2 py-0.5 rounded bg-red-900/30 text-danger">
              Impact: {r.impact}
            </span>
          </div>
          <div className="text-xs text-text-muted">{r.owner}</div>
        </GlassCard>
      ))}
    </div>
  )
}
