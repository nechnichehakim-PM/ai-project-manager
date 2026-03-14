import React from 'react'
import GlassCard from '../ui/GlassCard'
import ProgressBar from '../ui/ProgressBar'

const PHASES = [
  { name: 'Initialization', value: 100 },
  { name: 'Planning', value: 100 },
  { name: 'Execution', value: 68 },
  { name: 'Closure', value: 0 },
]

export default function TaskCompletionByPhase() {
  return (
    <GlassCard>
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-white/10">
        <span className="font-heading font-semibold text-[#E6EDF5]">Task completion by phase</span>
      </div>
      <div className="flex flex-col gap-3">
        {PHASES.map(({ name, value }) => (
          <div key={name}>
            <div className="flex justify-between mb-1.5 text-[0.8rem] text-text-muted">
              <span>{name}</span>
              <span>{value}%</span>
            </div>
            <ProgressBar
              value={value}
              color={value === 100 ? 'ai' : value > 0 ? 'primary' : 'muted'}
            />
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
