'use client'

import { format, parseISO } from 'date-fns'
import {
  GOAL_SYSTOLIC,
  GOAL_DIASTOLIC,
  isAbnormal,
} from '@/config/bpGoals'
import { AlertCircle } from 'lucide-react'

type ChartPoint = {
  timestamp: string
  systolic: number
  diastolic: number
}

const filterVitals = (vitals: ChartPoint[], timeFilter: 'all' | 'morning' | 'evening') =>
  vitals.filter((v) => {
    const hour = parseISO(v.timestamp).getHours()
    if (timeFilter === 'morning') return hour < 12
    if (timeFilter === 'evening') return hour >= 12
    return true
  })

const summarizeVitals = (vitals: ChartPoint[]) => {
  const systolics = vitals.map(v => v.systolic)
  const diastolics = vitals.map(v => v.diastolic)

  const avg = (arr: number[]) =>
    arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null

  const highest = vitals.reduce<ChartPoint | null>((best, v) =>
    !best || v.systolic > best.systolic ? v : best
  , null)

  const lowest = vitals.reduce<ChartPoint | null>((worst, v) =>
    !worst || v.systolic < worst.systolic ? v : worst
  , null)

  return {
    avgSystolic:  avg(systolics),
    avgDiastolic: avg(diastolics),
    highest,
    lowest,
  }
}

const renderValue = (sys: number | null, dia: number | null) => {
  if (sys == null || dia == null) return '—'
  const abnormal = isAbnormal(sys, dia)
  return (
    <span>
      {sys} / {dia}
      {abnormal && <AlertCircle className="inline h-4 w-4 text-red-500 ml-1" />}
    </span>
  )
}

export default function VitalsSummarySidebar({ vitals }: { vitals: ChartPoint[] }) {
  const all     = summarizeVitals(filterVitals(vitals, 'all'))
  const morning = summarizeVitals(filterVitals(vitals, 'morning'))
  const evening = summarizeVitals(filterVitals(vitals, 'evening'))

  return (
    <div className="w-72 p-4 border rounded-md bg-muted text-sm shrink-0 space-y-6">
      {/* Key Insights */}
      <h2 className="font-semibold text-base">Key Insights</h2>
      {/* here you could render your GoalSummary if you want */}

      <hr className="border-muted-foreground/20" />

      {/* Averages */}
      <div>
        <h3 className="font-medium text-sm mb-2 text-muted-foreground">Averages</h3>
        <table className="w-full border-separate border-spacing-y-1 text-left text-sm">
          <thead className="text-muted-foreground">
            <tr>
              <th></th><th>Systolic</th><th>Diastolic</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>All</td>
              <td>{renderValue(all.avgSystolic,  all.avgDiastolic)}</td>
            </tr>
            <tr>
              <td>Morning</td>
              <td>{renderValue(morning.avgSystolic, morning.avgDiastolic)}</td>
            </tr>
            <tr>
              <td>Evening</td>
              <td>{renderValue(evening.avgSystolic, evening.avgDiastolic)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
