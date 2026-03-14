import React from 'react'
import PageHeader from '../components/ui/PageHeader'
import GlassCard from '../components/ui/GlassCard'

export default function ResourcesView() {
  return (
    <section className="animate-fade-in">
      <PageHeader title="Resources" subtitle="Team allocation & workload" />
      <GlassCard>
        <p className="text-text-muted">Resource allocation view — coming soon.</p>
      </GlassCard>
    </section>
  )
}
