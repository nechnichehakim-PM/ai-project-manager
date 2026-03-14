import React from 'react'
import GlassCard from '../ui/GlassCard'

const CIRCUMFERENCE = 2 * Math.PI * 42
const SCORE = 82
const OFFSET = CIRCUMFERENCE - (SCORE / 100) * CIRCUMFERENCE

export default function HealthGauge() {
  return (
    <GlassCard className="flex flex-col items-center justify-center py-7">
      <div className="relative w-[180px] h-[180px] mb-5">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <defs>
            <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF4D6D" />
              <stop offset="50%" stopColor="#FFB020" />
              <stop offset="100%" stopColor="#00E5A8" />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="#232D42"
            strokeWidth={10}
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="url(#healthGradient)"
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={OFFSET}
            className="transition-[stroke-dashoffset] duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-heading text-4xl font-bold text-[#E6EDF5]">
          {SCORE}
        </div>
      </div>
      <div className="text-sm text-text-muted">Project health score</div>
    </GlassCard>
  )
}
