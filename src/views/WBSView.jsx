import React from 'react'
import PageHeader from '../components/ui/PageHeader'
import WBSTree from '../components/wbs/WBSTree'

export default function WBSView() {
  return (
    <section className="animate-fade-in">
      <PageHeader
        title="WBS Builder"
        subtitle="Hierarchical task structure — drag to reorder"
      />
      <WBSTree />
    </section>
  )
}
