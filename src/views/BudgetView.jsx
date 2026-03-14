import React from 'react'
import PageHeader from '../components/ui/PageHeader'
import BudgetCards from '../components/budget/BudgetCards'

export default function BudgetView() {
  return (
    <section className="animate-fade-in">
      <PageHeader
        title="Budget tracking"
        subtitle="Allocated, consumed & forecast"
      />
      <BudgetCards />
    </section>
  )
}
