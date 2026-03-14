import React from 'react'
import PageHeader from '../components/ui/PageHeader'
import RiskMatrix from '../components/risks/RiskMatrix'
import RiskCards from '../components/risks/RiskCards'

export default function RisksView() {
  return (
    <section className="animate-fade-in">
      <PageHeader
        title="Risk register"
        subtitle="Probability vs impact matrix & mitigation"
      />
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
        <RiskMatrix />
        <RiskCards />
      </div>
    </section>
  )
}
