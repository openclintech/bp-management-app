// components/vitals/GoalSummary.tsx
'use client'

import {
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  PauseCircle,
  AlertTriangle,
  XCircle,
} from 'lucide-react'
import {
  GOAL_SYSTOLIC,
  GOAL_DIASTOLIC,
  isAbnormal,
} from '@/config/bpGoals'

type ChartPoint = {
  timestamp: string
  displayDate: string
  systolic: number | null
  diastolic: number | null
}

function getGoalRangeStatus(percent: number) {
  if (percent >= 75) return { label: 'Ideal', color: 'text-green-600', Icon: CheckCircle2 }
  if (percent >= 50) return { label: 'Needs Improvement', color: 'text-yellow-600', Icon: AlertTriangle }
  return { label: 'Poor Control', color: 'text-red-600', Icon: XCircle }
}

export function GoalSummary({ vitals }: { vitals: ChartPoint[] }) {
  const validReadings = vitals.filter(
    v => v.systolic !== null && v.diastolic !== null
  )

  const inRangeReadings = validReadings.filter(
    v => !isAbnormal(v.systolic!, v.diastolic!)
  )

  const percentInRange = validReadings.length
    ? Math.round((inRangeReadings.length / validReadings.length) * 100)
    : 0

  const midpoint = Math.floor(validReadings.length / 2)
  const firstHalf = validReadings.slice(0, midpoint)
  const secondHalf = validReadings.slice(midpoint)

  const getInRangePercentage = (points: ChartPoint[]) => {
    const total = points.length
    const inRange = points.filter(
      v => !isAbnormal(v.systolic!, v.diastolic!)
    ).length
    return total ? Math.round((inRange / total) * 100) : 0
  }

  const firstPercent = getInRangePercentage(firstHalf)
  const secondPercent = getInRangePercentage(secondHalf)

  let trendLabel = 'Stable'
  let TrendIcon = PauseCircle
  if (secondPercent > firstPercent) {
    trendLabel = 'Improving'
    TrendIcon = TrendingUp
  } else if (secondPercent < firstPercent) {
    trendLabel = 'Worsening'
    TrendIcon = TrendingDown
  }

  const { label: rangeLabel, color, Icon } = getGoalRangeStatus(percentInRange)

  return (
    <div className="space-y-4">
      {/* Assessment */}
      <div className="space-y-1">
        <h3 className="font-medium text-sm text-muted-foreground">Assessment</h3>
        <div className="flex items-center space-x-2">
          <Icon className={`h-4 w-4 ${color}`} />
          <span className={`font-semibold text-sm ${color}`}>
            {percentInRange}% in goal
          </span>
        </div>
        <p className="text-muted-foreground text-xs leading-tight">
          ({inRangeReadings.length} of {validReadings.length} readings) — <span className="italic">{rangeLabel}</span>
        </p>
      </div>

      {/* Trend */}
      <div className="space-y-1">
        <h3 className="font-medium text-sm text-muted-foreground">Trend</h3>
        <div className="flex items-center space-x-2">
          <TrendIcon className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">{trendLabel}</span>
          <span className="text-muted-foreground text-xs">
            ({firstPercent}% → {secondPercent}%)
          </span>
        </div>
      </div>

      {/* Goal */}
      <div className="space-y-1">
        <h3 className="font-medium text-sm text-muted-foreground">Goal</h3>
        <p className="text-muted-foreground text-xs leading-tight">
          Systolic: {GOAL_SYSTOLIC.min}–{GOAL_SYSTOLIC.max} mmHg<br />
          Diastolic: {GOAL_DIASTOLIC.min}–{GOAL_DIASTOLIC.max} mmHg
        </p>
      </div>
    </div>
  )
}
