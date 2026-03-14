import React from 'react'

export default function ProgressBar({ value, color = 'primary', className = '' }) {
  const colorClass = {
    primary: 'bg-primary',
    ai: 'bg-ai',
    warning: 'bg-warning',
    danger: 'bg-danger',
    muted: 'bg-text-soft',
  }[color] || 'bg-primary'

  return (
    <div className={`h-2 rounded-full bg-white/5 overflow-hidden ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
