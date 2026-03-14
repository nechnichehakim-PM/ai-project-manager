import React from 'react'
import PageHeader from '../components/ui/PageHeader'
import GlassCard from '../components/ui/GlassCard'

export default function ReportsView() {
  return (
    <section className="animate-fade-in">
      <PageHeader title="Reports" subtitle="Analytics & exports" />
      <GlassCard>
        <p className="text-text-muted">Reports & analytics — coming soon.</p>
      </GlassCard>
    </section>
  )
}
