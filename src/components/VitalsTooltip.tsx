'use client'

import { type TooltipProps } from 'recharts'
import { type AggPoint } from './types'

export default function VitalsTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload as AggPoint

  return (
    <div className="rounded-md border bg-background p-3 shadow-sm text-sm">
      <p className="font-medium mb-2">{label}</p>
      <div className="grid grid-cols-[80px_1fr_1fr] gap-x-3 gap-y-1">
        <span></span><span className="font-medium">Sys</span><span className="font-medium">Dia</span>
        <span className="text-muted-foreground">Avg</span><span>{p.systolic}</span><span>{p.diastolic}</span>
        <span className="text-muted-foreground">Min</span><span>{p.sysMin}</span><span>{p.diaMin}</span>
        <span className="text-muted-foreground">Max</span><span>{p.sysMax}</span><span>{p.diaMax}</span>
      </div>
      {p.event && (
        <div className="mt-3 pt-2 border-t text-muted-foreground">
          <p>{p.event.description}</p>
        </div>
      )}
      <p className="mt-2 text-muted-foreground">
        {p.count} reading{p.count !== 1 && 's'}
      </p>
    </div>
  )
}
