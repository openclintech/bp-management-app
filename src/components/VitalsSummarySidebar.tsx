'use client'

import {
  GOAL_SYSTOLIC,
  GOAL_DIASTOLIC,
  isAbnormal,
} from '@/config/bpGoals'

import { AlertCircle } from 'lucide-react'
import { GoalSummary } from '@/components/vitals/GoalSummary'

type ChartPoint = {
  timestamp: string
  displayDate: string
  systolic: number | null
  diastolic: number | null
}

type TimeFilter = 'all' | 'morning' | 'evening'

const filterVitals = (vitals: ChartPoint[], timeFilter: TimeFilter) =>
  vitals.filter((v) => {
    const hour = new Date(v.timestamp).getHours()
    if (v.systolic == null || v.diastolic == null) return false
    if (timeFilter === 'morning') return hour < 12
    if (timeFilter === 'evening') return hour >= 12
    return true
  })

const summarizeVitals = (vitals: ChartPoint[]) => {
  const systolics = vitals.map(v => v.systolic!).filter(n => !isNaN(n))
  const diastolics = vitals.map(v => v.diastolic!).filter(n => !isNaN(n))

  const avgSystolic = systolics.length ? Math.round(systolics.reduce((a, b) => a + b) / systolics.length) : null
  const avgDiastolic = diastolics.length ? Math.round(diastolics.reduce((a, b) => a + b) / diastolics.length) : null

  const highestSystolic = vitals.reduce<ChartPoint | null>((max, v) => {
    if (!v.systolic || !v.diastolic) return max
    if (!max || v.systolic > max.systolic!) return v
    return max
  }, null)

  const highestDiastolic = vitals.reduce<ChartPoint | null>((max, v) => {
    if (!v.systolic || !v.diastolic) return max
    if (!max || v.diastolic > max.diastolic!) return v
    return max
  }, null)

  const lowestSystolic = vitals.reduce<ChartPoint | null>((min, v) => {
    if (!v.systolic || !v.diastolic) return min
    if (!min || v.systolic < min.systolic!) return v
    return min
  }, null)

  const lowestDiastolic = vitals.reduce<ChartPoint | null>((min, v) => {
    if (!v.systolic || !v.diastolic) return min
    if (!min || v.diastolic < min.diastolic!) return v
    return min
  }, null)

  return {
    avgSystolic,
    avgDiastolic,
    highestSystolic,
    highestDiastolic,
    lowestSystolic,
    lowestDiastolic,
  }
}

export default function VitalsSummarySidebar({ vitals }: { vitals: ChartPoint[] }) {
  const all = summarizeVitals(filterVitals(vitals, 'all'))
  const morning = summarizeVitals(filterVitals(vitals, 'morning'))
  const evening = summarizeVitals(filterVitals(vitals, 'evening'))

  const systolicDiff = morning.avgSystolic != null && evening.avgSystolic != null
    ? morning.avgSystolic - evening.avgSystolic
    : null

  const diastolicDiff = morning.avgDiastolic != null && evening.avgDiastolic != null
    ? morning.avgDiastolic - evening.avgDiastolic
    : null

  const renderValue = (systolic: number | null, diastolic: number | null) => {
    if (systolic == null || diastolic == null) return '—'
    const abnormal = isAbnormal(systolic, diastolic)
    return (
      <span>
        {systolic} / {diastolic}
        {abnormal && (
          <AlertCircle className="inline h-4 w-4 text-red-500 ml-1" />
        )}
      </span>
    )
  }

  return (
    <div className="w-72 p-4 border rounded-md bg-muted text-sm shrink-0 space-y-6">
      <h2 className="font-semibold text-base">Key Insights</h2>

      <GoalSummary vitals={vitals} />

      <hr className="border-muted-foreground/20" />

      <div>
        <h3 className="font-medium text-sm mb-2 text-muted-foreground">Averages</h3>
        <table className="w-full border-separate border-spacing-y-1 text-left text-sm">
          <thead>
            <tr className="text-muted-foreground">
              <th></th>
              <th>Systolic</th>
              <th>Diastolic</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>All</td>
              <td>{all.avgSystolic}</td>
              <td>{all.avgDiastolic}</td>
            </tr>
            <tr>
              <td>Morning</td>
              <td>{morning.avgSystolic}</td>
              <td>{morning.avgDiastolic}</td>
            </tr>
            <tr>
              <td>Evening</td>
              <td>{evening.avgSystolic}</td>
              <td>{evening.avgDiastolic}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <hr className="border-muted-foreground/20" />

      <div>
        <h3 className="font-medium text-sm mb-2 text-muted-foreground">Highest BP</h3>
        <table className="w-full border-separate border-spacing-y-1 text-left text-sm">
          <tbody>
            <tr>
              <td>Systolic</td>
              <td>
                {all.highestSystolic
                  ? <>{renderValue(all.highestSystolic.systolic, all.highestSystolic.diastolic)} on {all.highestSystolic.displayDate}</>
                  : '—'}
              </td>
            </tr>
            <tr>
              <td>Diastolic</td>
              <td>
                {all.highestDiastolic
                  ? <>{renderValue(all.highestDiastolic.systolic, all.highestDiastolic.diastolic)} on {all.highestDiastolic.displayDate}</>
                  : '—'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <hr className="border-muted-foreground/20" />

      <div>
        <h3 className="font-medium text-sm mb-2 text-muted-foreground">Lowest BP</h3>
        <table className="w-full border-separate border-spacing-y-1 text-left text-sm">
          <tbody>
            <tr>
              <td>Systolic</td>
              <td>
                {all.lowestSystolic
                  ? <>{renderValue(all.lowestSystolic.systolic, all.lowestSystolic.diastolic)} on {all.lowestSystolic.displayDate}</>
                  : '—'}
              </td>
            </tr>
            <tr>
              <td>Diastolic</td>
              <td>
                {all.lowestDiastolic
                  ? <>{renderValue(all.lowestDiastolic.systolic, all.lowestDiastolic.diastolic)} on {all.lowestDiastolic.displayDate}</>
                  : '—'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <hr className="border-muted-foreground/20" />

      <div>
        <h3 className="font-medium text-sm mb-2 text-muted-foreground">Morning vs. Evening</h3>
        <table className="w-full border-separate border-spacing-y-1 text-left text-sm">
          <thead>
            <tr className="text-muted-foreground">
              <th></th>
              <th>Trend</th>
              <th>Δ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Systolic</td>
              <td>{systolicDiff == null ? '—' : systolicDiff > 0 ? '⬆️ Morning' : systolicDiff < 0 ? '⬇️ Morning' : '⟷ Same'}</td>
              <td>{systolicDiff != null ? Math.abs(systolicDiff) : '—'}</td>
            </tr>
            <tr>
              <td>Diastolic</td>
              <td>{diastolicDiff == null ? '—' : diastolicDiff > 0 ? '⬆️ Morning' : diastolicDiff < 0 ? '⬇️ Morning' : '⟷ Same'}</td>
              <td>{diastolicDiff != null ? Math.abs(diastolicDiff) : '—'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
