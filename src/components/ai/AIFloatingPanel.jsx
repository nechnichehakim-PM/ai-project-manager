import React from 'react'

const CAPABILITIES = [
  { icon: '▦', label: 'Generate WBS' },
  { icon: '⚠', label: 'Analyze project risks' },
  { icon: '▧', label: 'Suggest planning adjustments' },
  { icon: '▥', label: 'Generate meeting summaries' },
  { icon: '◈', label: 'Generate project reports' },
]

export default function AIFloatingPanel({ isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div
      className="fixed right-6 top-20 bottom-20 w-[320px] z-[200] rounded-card border border-ai/20 bg-card/95 backdrop-blur-xl shadow-[0_0_40px_rgba(0,229,168,0.12)] flex flex-col animate-fade-in"
      role="dialog"
      aria-label="AI Assistant"
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2 font-heading font-semibold text-[#E6EDF5]">
          <div className="w-9 h-9 rounded-lg bg-ai/15 flex items-center justify-center text-ai shadow-[0_0_20px_rgba(0,229,168,0.35)]">
            ◆
          </div>
          AI Assistant
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-card-sm flex items-center justify-center text-text-muted hover:text-[#E6EDF5] hover:bg-white/5 transition-all"
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <div className="p-4 flex flex-col gap-2 overflow-y-auto">
        {CAPABILITIES.map((cap) => (
          <button
            key={cap.label}
            type="button"
            className="flex items-center gap-3 p-3 rounded-card-sm text-left text-sm text-[#E6EDF5] hover:bg-ai/10 border border-transparent hover:border-ai/20 transition-all"
          >
            <span className="text-ai">{cap.icon}</span>
            <span>{cap.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
