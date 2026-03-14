import React from 'react'

export default function GlassCard({ children, className = '', ...props }) {
  return (
    <div
      className={`
        bg-glass-bg backdrop-blur-[16px] border border-glass-border rounded-card p-6
        shadow-card transition-all duration-200 hover:border-white/10
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
