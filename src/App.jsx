import React, { useState } from 'react'
import AppLayout from './components/layout/AppLayout'
import AIFloatingPanel from './components/ai/AIFloatingPanel'
import DashboardView from './views/DashboardView'
import ProjectsView from './views/ProjectsView'
import WBSView from './views/WBSView'
import PlanningView from './views/PlanningView'
import RisksView from './views/RisksView'
import BudgetView from './views/BudgetView'
import ResourcesView from './views/ResourcesView'
import ReportsView from './views/ReportsView'
import AIAssistantView from './views/AIAssistantView'
import SettingsView from './views/SettingsView'

const VIEWS = {
  dashboard: DashboardView,
  projects: ProjectsView,
  wbs: WBSView,
  planning: PlanningView,
  risks: RisksView,
  budget: BudgetView,
  resources: ResourcesView,
  reports: ReportsView,
  'ai-assistant': AIAssistantView,
  settings: SettingsView,
}

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [aiPanelOpen, setAIPanelOpen] = useState(false)

  const ViewComponent = VIEWS[currentView]

  return (
    <>
      <AppLayout
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenAIPanel={() => setAIPanelOpen(true)}
      >
        <ViewComponent onOpenAIPanel={() => setAIPanelOpen(true)} />
      </AppLayout>
      <AIFloatingPanel isOpen={aiPanelOpen} onClose={() => setAIPanelOpen(false)} />
    </>
  )
}
