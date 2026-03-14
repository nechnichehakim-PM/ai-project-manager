import React from 'react'

export default function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-7">
      <h1 className="font-heading text-[1.75rem] font-bold tracking-tight text-[#E6EDF5] mb-1.5">
        {title}
      </h1>
      <p className="text-sm text-text-muted">{subtitle}</p>
    </div>
  )
}
