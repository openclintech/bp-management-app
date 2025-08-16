// src/app/bp/utils/chartUtils.ts
import {
  parseISO,
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  endOfWeek,
  subWeeks,
  startOfMonth,
  endOfMonth,
  subMonths,
  subYears,
  format,
} from 'date-fns'

export interface ChartPoint {
  timestamp: string
  systolic: number
  diastolic: number
}

export interface AggPoint {
  label: string
  avgSystolic: number
  minSystolic: number
  maxSystolic: number
  avgDiastolic: number
  minDiastolic: number
  maxDiastolic: number
}

/** Simple average helper */
function average(arr: number[]): number {
  return Math.round(arr.reduce((sum, v) => sum + v, 0) / arr.length)
}

/** 1. Raw readings for “today” */
export function getHourly(data: ChartPoint[]): ChartPoint[] {
  const now = new Date()
  const start = startOfDay(now)
  const end = endOfDay(now)
  return data.filter(p => {
    const d = parseISO(p.timestamp)
    return d >= start && d <= end
  })
}

/** 2. Aggregate by calendar day over last 30 days */
export function getDaily(data: ChartPoint[]): AggPoint[] {
  const cutoff = subDays(new Date(), 30)
  const groups = new Map<string, ChartPoint[]>()

  data.forEach(p => {
    const d = parseISO(p.timestamp)
    if (d < cutoff) return
    const day = format(d, 'yyyy-MM-dd')          // grouping key
    if (!groups.has(day)) groups.set(day, [])
    groups.get(day)!.push(p)
  })

  return Array.from(groups.entries()).map(([day, pts]) => {
    const sys = pts.map(p => p.systolic)
    const dia = pts.map(p => p.diastolic)
    return {
      label: format(parseISO(day), 'MMM d'),
      avgSystolic:  average(sys),
      minSystolic:  Math.min(...sys),
      maxSystolic:  Math.max(...sys),
      avgDiastolic: average(dia),
      minDiastolic: Math.min(...dia),
      maxDiastolic: Math.max(...dia),
    }
  })
}

/** 3. Aggregate by ISO week over last 12 weeks */
export function getWeekly(data: ChartPoint[]): AggPoint[] {
  const cutoff = subWeeks(new Date(), 12)
  const groups = new Map<string, ChartPoint[]>()

  data.forEach(p => {
    const d = parseISO(p.timestamp)
    if (d < cutoff) return
    const wkStart = startOfWeek(d, { weekStartsOn: 1 })
    const wkEnd   = endOfWeek(d, { weekStartsOn: 1 })
    const key = `${format(wkStart, 'MMM d')}–${format(wkEnd, 'd')}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(p)
  })

  return Array.from(groups.entries()).map(([label, pts]) => {
    const sys = pts.map(p => p.systolic)
    const dia = pts.map(p => p.diastolic)
    return {
      label,
      avgSystolic:  average(sys),
      minSystolic:  Math.min(...sys),
      maxSystolic:  Math.max(...sys),
      avgDiastolic: average(dia),
      minDiastolic: Math.min(...dia),
      maxDiastolic: Math.max(...dia),
    }
  })
}

/** 4. Aggregate by calendar month over last 12 months */
export function getMonthly(data: ChartPoint[]): AggPoint[] {
  const cutoff = subYears(new Date(), 1)
  const groups = new Map<string, ChartPoint[]>()

  data.forEach(p => {
    const d = parseISO(p.timestamp)
    if (d < cutoff) return
    const monthKey = format(d, 'yyyy-MM')
    if (!groups.has(monthKey)) groups.set(monthKey, [])
    groups.get(monthKey)!.push(p)
  })

  return Array.from(groups.entries()).map(([month, pts]) => {
    const sys = pts.map(p => p.systolic)
    const dia = pts.map(p => p.diastolic)
    const [year, mon] = month.split('-')
    const label = format(new Date(Number(year), Number(mon) - 1), 'MMM yyyy')
    return {
      label,
      avgSystolic:  average(sys),
      minSystolic:  Math.min(...sys),
      maxSystolic:  Math.max(...sys),
      avgDiastolic: average(dia),
      minDiastolic: Math.min(...dia),
      maxDiastolic: Math.max(...dia),
    }
  })
}
