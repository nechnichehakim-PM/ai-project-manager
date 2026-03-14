import React from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function AppLayout({ currentView, onNavigate, onOpenAIPanel, children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar currentView={currentView} onNavigate={onNavigate} />
      <div className="flex-1 min-w-0 ml-[260px] min-h-screen flex flex-col">
        <TopBar onOpenAIPanel={onOpenAIPanel} />
        <main className="flex-1 p-7 pt-7 pb-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
