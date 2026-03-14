import React from 'react'

const NAV_ITEMS = [
  { section: 'Main', items: [
    { id: 'dashboard', icon: '▣', label: 'Dashboard' },
    { id: 'projects', icon: '▤', label: 'Projects' },
  ]},
  { section: 'Planning', items: [
    { id: 'wbs', icon: '▦', label: 'WBS Builder' },
    { id: 'planning', icon: '▧', label: 'Planning' },
  ]},
  { section: 'Monitor', items: [
    { id: 'risks', icon: '⚠', label: 'Risks' },
    { id: 'budget', icon: '◈', label: 'Budget' },
    { id: 'resources', icon: '◉', label: 'Resources' },
  ]},
  { section: 'Insights', items: [
    { id: 'reports', icon: '▥', label: 'Reports' },
    { id: 'ai-assistant', icon: '◆', label: 'AI Assistant', ai: true },
  ]},
  { section: 'Config', items: [
    { id: 'settings', icon: '⚙', label: 'Settings' },
  ]},
]

export default function Sidebar({ currentView, onNavigate }) {
  return (
    <aside className="w-[260px] min-w-[260px] h-screen fixed left-0 top-0 bg-surface border-r border-white/10 flex flex-col z-[100]">
      <div className="p-5 pt-6 pb-5 border-b border-white/10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-primary to-ai flex items-center justify-center text-lg shadow-glow">
          ◇
        </div>
        <span className="font-heading font-bold text-[1.05rem] tracking-tight text-[#E6EDF5]">
          AI Project Manager
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {NAV_ITEMS.map(({ section, items }) => (
          <div key={section} className="mb-6">
            <div className="font-mono text-[0.7rem] tracking-widest uppercase text-text-soft px-3 pb-2">
              {section}
            </div>
            {items.map(({ id, icon, label, ai }) => {
              const isActive = currentView === id
              const isAi = !!ai
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onNavigate(id)}
                  className={`
                    w-full flex items-center gap-3 py-2.5 px-3 rounded-card-sm text-left text-sm font-medium
                    transition-all duration-200 border mb-0.5
                    ${isActive && !isAi
                      ? 'text-primary bg-primary/10 border-primary/20 shadow-[0_0_20px_rgba(79,140,255,0.08)]'
                      : isActive && isAi
                      ? 'text-ai bg-ai/10 border-ai/20 shadow-[0_0_24px_rgba(0,229,168,0.35)]'
                      : 'text-text-muted border-transparent hover:text-[#E6EDF5] hover:bg-white/5'
                    }
                  `}
                >
                  <span className="w-[22px] text-center text-[1.1rem] opacity-90">{icon}</span>
                  {label}
                </button>
              )
            })}
          </div>
        ))}
      </nav>
    </aside>
  )
}
