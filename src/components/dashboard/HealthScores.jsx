import React from 'react'
import GlassCard from '../ui/GlassCard'

const SCORES = [
  { label: 'Planning', width: 88, color: 'bg-primary' },
  { label: 'Budget', width: 85, color: 'bg-ai' },
  { label: 'Risk', width: 72, color: 'bg-warning' },
  { label: 'Resource', width: 90, color: 'bg-[#A78BFA]' },
]

export default function HealthScores() {
  return (
    <GlassCard className="flex flex-col justify-center">
      <div className="grid grid-cols-2 gap-3.5">
        {SCORES.map(({ label, width, color }) => (
          <div
            key={label}
            className="flex items-center justify-between py-3.5 px-4 bg-card border border-white/10 rounded-card-sm transition-all hover:border-white/5 hover:bg-elevated"
          >
            <span className="text-sm text-text-muted">{label}</span>
            <div className="w-20 h-1.5 bg-elevated rounded overflow-hidden">
              <div
                className={`h-full rounded ${color} transition-all duration-500`}
                style={{ width: `${width}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
