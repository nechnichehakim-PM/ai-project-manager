import React from 'react'
import PageHeader from '../components/ui/PageHeader'
import GlassCard from '../components/ui/GlassCard'

export default function AIAssistantView({ onOpenAIPanel }) {
  return (
    <section className="animate-fade-in">
      <PageHeader
        title="AI Assistant"
        subtitle="Generate WBS, analyze risks, suggest planning"
      />
      <div className="bg-gradient-to-br from-ai/10 to-primary/5 border border-ai/20 rounded-card p-6 shadow-[0_0_40px_rgba(0,229,168,0.06)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-[10px] bg-ai/15 flex items-center justify-center text-xl shadow-[0_0_20px_rgba(0,229,168,0.35)]">
            ◆
          </div>
          <span className="font-heading font-semibold text-[#E6EDF5]">Capabilities</span>
        </div>
        <p className="text-text-muted mb-4">
          Open the floating panel (◆ in top bar) to generate WBS, analyze risks, suggest planning
          adjustments, generate meeting summaries and reports.
        </p>
        <button
          type="button"
          onClick={onOpenAIPanel}
          className="px-5 py-2.5 rounded-card-sm font-medium bg-gradient-to-r from-ai/20 to-primary/10 text-ai border border-ai/30 shadow-[0_0_20px_rgba(0,229,168,0.2)] hover:shadow-glow-ai transition-all"
        >
          Open AI panel
        </button>
      </div>
    </section>
  )
}
