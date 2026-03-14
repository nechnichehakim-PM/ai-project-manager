import React from 'react'
import GlassCard from '../ui/GlassCard'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
const ROWS = [
  { label: '1.0 Kick-off', bars: [{ left: 0, width: 8, type: 'normal' }] },
  { label: '2.0 Planning', bars: [{ left: 8, width: 15, type: 'normal' }] },
  { label: '3.0 Execution', bars: [{ left: 23, width: 45, type: 'critical' }] },
  { label: 'MVP Milestone', bars: [{ left: 55, width: 2, type: 'milestone' }] },
]

export default function GanttPreview() {
  return (
    <GlassCard>
      <div className="grid gap-0 overflow-x-auto" style={{ gridTemplateColumns: '140px repeat(6, 1fr)' }}>
        <div className="py-2 font-mono text-xs text-text-soft" />
        {MONTHS.map((m) => (
          <div key={m} className="py-2 text-center font-mono text-xs text-text-muted">
            {m}
          </div>
        ))}
      </div>
      <div className="space-y-1">
        {ROWS.map((row) => (
          <div key={row.label} className="grid gap-2 items-center" style={{ gridTemplateColumns: '140px 1fr' }}>
            <span className="text-sm text-text-muted truncate">{row.label}</span>
            <div className="relative h-7 bg-white/5 rounded overflow-hidden">
              {row.bars.map((bar, i) => (
                <div
                  key={i}
                  className={`
                    absolute h-full rounded top-0
                    ${bar.type === 'critical'
                      ? 'bg-danger/80'
                      : bar.type === 'milestone'
                      ? 'w-2 bg-ai border-2 border-ai rounded-full -translate-x-1/2'
                      : 'bg-primary/80'
                    }
                  `}
                  style={
                    bar.type === 'milestone'
                      ? { left: `${bar.left}%`, width: 8 }
                      : { left: `${bar.left}%`, width: `${bar.width}%` }
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
