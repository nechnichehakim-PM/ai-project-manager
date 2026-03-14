import React from 'react'
import GlassCard from '../ui/GlassCard'
import ProgressBar from '../ui/ProgressBar'

const WORKLOAD = [
  { name: 'AN', value: 78, color: 'primary' },
  { name: 'ML', value: 62, color: 'ai' },
  { name: 'KB', value: 95, color: 'warning' },
  { name: 'SC', value: 70, color: 'primary' },
]

export default function TeamWorkload() {
  return (
    <GlassCard>
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-white/10">
        <span className="font-heading font-semibold text-[#E6EDF5]">Team workload</span>
        <span className="font-mono text-[0.7rem] px-2.5 py-1 rounded-full bg-primary/15 text-primary tracking-wide">
          This week
        </span>
      </div>
      <div className="flex flex-col gap-3.5">
        {WORKLOAD.map(({ name, value, color }) => (
          <div key={name}>
            <div className="flex justify-between mb-1.5 text-[0.85rem]">
              <span>{name}</span>
              <span>{value}%</span>
            </div>
            <ProgressBar value={value} color={color} />
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
