import React from 'react'
import GlassCard from '../ui/GlassCard'

const GRID = [
  [null, 'Low', 'Med', 'High', 'Crit'],
  ['High', '1', '1', '1', '1'],
  ['Med', '2', '', '', ''],
  ['Low', '', '', '', ''],
  ['Prob', '', '', '', 'Impact'],
]
const TYPES = [
  [null, null, null, null, null],
  [null, 'low', 'med', 'high', 'high'],
  [null, 'low', 'med', 'med', 'high'],
  [null, 'low', 'low', 'med', 'med'],
  [null, null, null, null, null],
]

export default function RiskMatrix() {
  return (
    <GlassCard>
      <div className="grid gap-px rounded overflow-hidden" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {GRID.flat().map((value, i) => {
          const row = Math.floor(i / 5)
          const col = i % 5
          const type = TYPES[row][col]
          const isAxis = type == null
          const bg = type === 'low' ? 'bg-emerald-900/30' : type === 'med' ? 'bg-amber-900/40' : type === 'high' ? 'bg-red-900/50' : 'bg-transparent'
          return (
            <div
              key={i}
              className={`min-h-[48px] flex items-center justify-center text-xs font-mono ${isAxis ? 'text-text-soft bg-transparent' : `text-[#E6EDF5] ${bg}`}`}
            >
              {value}
            </div>
          )
        })}
      </div>
    </GlassCard>
  )
}
