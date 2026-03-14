import React from 'react'
import PageHeader from '../components/ui/PageHeader'
import GanttPreview from '../components/planning/GanttPreview'

export default function PlanningView() {
  return (
    <section className="animate-fade-in">
      <PageHeader
        title="Planning"
        subtitle="Gantt timeline — dependencies & critical path"
      />
      <GanttPreview />
    </section>
  )
}
