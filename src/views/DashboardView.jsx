import React from 'react'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/dashboard/StatCard'
import HealthGauge from '../components/dashboard/HealthGauge'
import HealthScores from '../components/dashboard/HealthScores'
import AIRecommendations from '../components/dashboard/AIRecommendations'
import TeamWorkload from '../components/dashboard/TeamWorkload'
import TaskCompletionByPhase from '../components/dashboard/TaskCompletionByPhase'

export default function DashboardView() {
  return (
    <section className="animate-fade-in">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your project health and key metrics"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-7">
        <StatCard value="78%" label="Project progress" trend="↑ 12% this sprint" progress={78} progressColor="primary" />
        <StatCard value="62%" label="Budget consumed" trend="On track" progress={62} progressColor="ai" />
        <StatCard value="5" label="Open risks" trend="2 high impact" progressColor="warning" />
        <StatCard value="94%" label="Tasks completed" progress={94} progressColor="ai" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-7 mb-7">
        <HealthGauge />
        <HealthScores />
      </div>
      <AIRecommendations />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <TeamWorkload />
        <TaskCompletionByPhase />
      </div>
    </section>
  )
}
