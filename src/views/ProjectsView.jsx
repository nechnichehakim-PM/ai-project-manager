import React from 'react'
import PageHeader from '../components/ui/PageHeader'
import GlassCard from '../components/ui/GlassCard'

export default function ProjectsView({ onOpenAIPanel }) {
  return (
    <section className="animate-fade-in">
      <PageHeader title="Projects" subtitle="Create and manage projects" />
      <GlassCard>
        <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-white/10">
          <span className="font-heading font-semibold text-[#E6EDF5]">Project creation wizard</span>
          <span className="font-mono text-[0.7rem] px-2.5 py-1 rounded-full bg-primary/15 text-primary tracking-wide">
            New
          </span>
        </div>
        <p className="text-text-muted mb-5">
          Start a new project with AI-assisted setup: structure, WBS, and initial risks.
        </p>
        <button
          type="button"
          onClick={onOpenAIPanel}
          className="px-5 py-2.5 rounded-card-sm font-medium bg-gradient-to-r from-primary to-primary/80 text-white border border-primary/30 shadow-[0_0_20px_rgba(79,140,255,0.25)] hover:shadow-glow transition-all hover:-translate-y-px"
        >
          ◆ Start with AI
        </button>
      </GlassCard>
    </section>
  )
}
