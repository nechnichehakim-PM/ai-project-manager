import React, { useState } from 'react'
import GlassCard from '../ui/GlassCard'

const WBS_DATA = [
  { section: '1. Initialization', nodes: [
    { id: '1.0', label: 'Project kick-off', expanded: true, children: [
      { id: '1.1', label: 'Charter & stakeholders' },
      { id: '1.2', label: 'Kick-off meeting' },
    ]},
  ]},
  { section: '2. Planning', nodes: [
    { id: '2.0', label: 'Planning phase', expanded: true, children: [
      { id: '2.1', label: 'WBS & schedule' },
      { id: '2.2', label: 'Risk plan' },
      { id: '2.3', label: 'Resource allocation' },
    ]},
  ]},
  { section: '3. Execution', nodes: [
    { id: '3.0', label: 'Delivery & build', children: [] },
  ]},
  { section: '4. Monitoring', nodes: [
    { id: '4.0', label: 'Control & reporting', children: [] },
  ]},
  { section: '5. Closure', nodes: [
    { id: '5.0', label: 'Handover & lessons learned', children: [] },
  ]},
]

function WBSNode({ node, level = 0 }) {
  const [expanded, setExpanded] = useState(node.expanded ?? false)
  const hasChildren = node.children?.length > 0

  return (
    <>
      <div
        className={`
          flex items-center gap-2 py-2 px-3 rounded-card-sm text-sm
          ${level > 0 ? 'ml-6' : ''}
          hover:bg-white/5 border border-transparent hover:border-white/5
        `}
      >
        <span
          className={`w-5 text-center text-text-muted cursor-pointer select-none ${hasChildren ? '' : 'invisible'}`}
          onClick={() => hasChildren && setExpanded((e) => !e)}
          aria-expanded={hasChildren ? expanded : undefined}
        >
          {hasChildren ? (expanded ? '▼' : '▶') : ''}
        </span>
        <span className="font-mono text-xs text-text-soft w-8">{node.id}</span>
        <span className="text-[#E6EDF5]">{node.label}</span>
      </div>
      {hasChildren && expanded && (
        <div className="ml-2 border-l border-white/10 pl-2">
          {node.children.map((child) => (
            <WBSNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </>
  )
}

export default function WBSTree() {
  return (
    <GlassCard className="overflow-hidden">
      {WBS_DATA.map(({ section, nodes }) => (
        <div key={section}>
          <div className="font-heading font-semibold text-primary py-2 px-0 text-sm border-b border-white/10 mb-1">
            {section}
          </div>
          {nodes.map((node) => (
            <WBSNode key={node.id} node={node} />
          ))}
        </div>
      ))}
    </GlassCard>
  )
}
