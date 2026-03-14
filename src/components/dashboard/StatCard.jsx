import React from 'react'
import GlassCard from '../ui/GlassCard'
import ProgressBar from '../ui/ProgressBar'

export default function StatCard({ value, label, trend, progress, progressColor = 'primary' }) {
  return (
    <GlassCard>
      <div className={`text-2xl font-heading font-bold ${
        progressColor === 'primary' ? 'text-primary' :
        progressColor === 'ai' ? 'text-ai' :
        progressColor === 'warning' ? 'text-warning' : 'text-[#E6EDF5]'
      }`}>
        {value}
      </div>
      <div className="text-sm text-text-muted mt-0.5">{label}</div>
      {progress != null && (
        <div className="mt-3">
          <ProgressBar value={progress} color={progressColor} />
        </div>
      )}
      {trend && (
        <div className="text-xs text-text-muted mt-2">{trend}</div>
      )}
    </GlassCard>
  )
}
