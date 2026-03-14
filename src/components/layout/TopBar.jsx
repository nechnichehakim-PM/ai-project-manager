import React from 'react'

const PROJECTS = ['Smart Data Center 2026', 'Orange PMPR — BLIM', 'Power BI R&D']

export default function TopBar({ onOpenAIPanel }) {
  return (
    <header className="h-14 px-6 flex items-center gap-5 bg-glass-bg backdrop-blur-[20px] border-b border-glass-border sticky top-0 z-50">
      <div className="flex-shrink-0 min-w-[220px]">
        <select className="w-full bg-card border border-white/10 rounded-card-sm py-2.5 px-3.5 text-[#E6EDF5] font-body text-sm cursor-pointer transition-all hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
          {PROJECTS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>
      <div className="flex-1 max-w-[400px] relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-soft text-sm">⌕</span>
        <input
          type="text"
          placeholder="Search projects, tasks, risks..."
          className="w-full bg-card border border-white/10 rounded-card-sm py-2.5 pl-10 pr-3.5 text-[#E6EDF5] text-sm placeholder-text-soft transition-all focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <button
          type="button"
          className="w-10 h-10 rounded-card-sm border border-white/10 bg-card text-text-muted flex items-center justify-center transition-all hover:text-[#E6EDF5] hover:bg-elevated"
          title="Notifications"
        >
          🔔
        </button>
        <button
          type="button"
          onClick={onOpenAIPanel}
          className="w-10 h-10 rounded-card-sm flex items-center justify-center bg-gradient-to-br from-ai/15 to-primary/10 border border-ai/30 text-ai shadow-[0_0_24px_rgba(0,229,168,0.15)] transition-all hover:shadow-glow-ai hover:-translate-y-px"
          title="AI Assistant"
        >
          ◆
        </button>
      </div>
    </header>
  )
}
