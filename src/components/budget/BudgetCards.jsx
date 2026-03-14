import React from 'react'
import GlassCard from '../ui/GlassCard'

const BUDGETS = [
  { title: 'Allocated', value: '€ 450 000', width: 100, fill: 'allocated' },
  { title: 'Consumed', value: '€ 279 000', width: 62, fill: 'consumed' },
  { title: 'Forecast at completion', value: '€ 438 000', width: 97, fill: 'forecast' },
]

export default function BudgetCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {BUDGETS.map(({ title, value, width, fill }) => (
        <GlassCard key={title}>
          <div className="text-sm text-text-muted mb-1">{title}</div>
          <div className="text-2xl font-heading font-bold text-[#E6EDF5] mb-3">{value}</div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                fill === 'allocated' ? 'bg-primary' :
                fill === 'consumed' ? 'bg-ai' : 'bg-warning'
              }`}
              style={{ width: `${width}%` }}
            />
          </div>
        </GlassCard>
      ))}
    </div>
  )
}
