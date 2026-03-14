import React from 'react'
import PageHeader from '../components/ui/PageHeader'
import GlassCard from '../components/ui/GlassCard'

export default function SettingsView() {
  return (
    <section className="animate-fade-in">
      <PageHeader title="Settings" subtitle="Preferences & API" />
      <GlassCard>
        <p className="text-text-muted">Settings — coming soon.</p>
      </GlassCard>
    </section>
  )
}
