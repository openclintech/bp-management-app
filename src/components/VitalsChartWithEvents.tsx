'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Dot,
} from 'recharts'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useState, useMemo } from 'react'
import { format, startOfWeek, endOfWeek, parseISO } from 'date-fns'

import VitalsTooltip from '@/components/VitalsTooltip'
import VitalsLegend from '@/components/VitalsLegend'
import { dotColor } from '@/components/VitalsLegend'

type ChartPoint = {
  timestamp: string
  displayDate: string
  systolic: number | null
  diastolic: number | null
}

type MedEvent = {
  timestamp: string
  displayDate: string
  description: string
  type: 'MED_ADDED' | 'ADMIN_LATE' | 'ADHOC_DOSE' | 'ADJUSTED' | 'REPLACED'
}

type AggPoint = {
  timestamp: string
  count: number
  systolic: number; sysMin: number; sysMax: number
  diastolic: number; diaMin: number; diaMax: number
  event?: { description: string; type: MedEvent['type'] }
}

const avg = (a: number[]) => Math.round(a.reduce((s, v) => s + v, 0) / a.length)

const summarise = (pts: ChartPoint[]): Omit<AggPoint, 'timestamp'> => {
  const sArr = pts.map(p => p.systolic  ?? 0)
  const dArr = pts.map(p => p.diastolic ?? 0)
  return {
    count: pts.length,
    systolic:  avg(sArr),
    sysMin:    Math.min(...sArr),
    sysMax:    Math.max(...sArr),
    diastolic: avg(dArr),
    diaMin:    Math.min(...dArr),
    diaMax:    Math.max(...dArr),
  }
}

export default function VitalsChartWithEvents({
  data,
  events,
  timeFilter = 'all',
}: {
  data: ChartPoint[]
  events: MedEvent[]
  timeFilter?: 'all' | 'morning' | 'evening'
}) {
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('daily')

  // Filter by time of day
  const filteredData = useMemo(() => {
    if (timeFilter === 'all') return data
    return data.filter(d => {
      const hr = new Date(d.timestamp).getHours()
      return timeFilter === 'morning' ? hr < 12 : hr >= 12
    })
  }, [data, timeFilter])

  // Build daily or aggregated points
  const points = useMemo<AggPoint[]>(() => {
    if (view !== 'daily') {
      const groups = new Map<string, ChartPoint[]>()
      filteredData.forEach(d => {
        const dt = parseISO(d.timestamp)
        const key = view === 'weekly'
          ? `${format(startOfWeek(dt, { weekStartsOn: 1 }), 'MMM d')}–${format(endOfWeek(dt, { weekStartsOn: 1 }), 'd')}`
          : 'Monthly Avg'
        if (!groups.has(key)) groups.set(key, [])
        groups.get(key)!.push(d)
      })
      return Array.from(groups, ([k, pts]) => ({ timestamp: k, ...summarise(pts) }))
    }

    // “Enrich” each reading with at most one nearest event
    const enriched = filteredData.map(pt => ({ ...pt, event: undefined as MedEvent | undefined }))
    events.forEach(e => {
      if (!['ADHOC_DOSE','ADMIN_LATE','MED_ADDED','ADJUSTED','REPLACED'].includes(e.type)) return
      const eTs = new Date(e.timestamp).getTime()
      let closest: { idx: number; delta: number } | null = null
      enriched.forEach((pt, idx) => {
        const ptTs = new Date(pt.timestamp).getTime()
        const d = Math.abs(eTs - ptTs)
        if (!closest || d < closest.delta) closest = { idx, delta: d }
      })
      if (closest) enriched[closest.idx].event = e
    })

    // Turn back into AggPoint[]
    return enriched.map((d, i) => ({
      timestamp:  d.displayDate,
      count:      1,
      systolic:   d.systolic  ?? 0,
      sysMin:     d.systolic  ?? 0,
      sysMax:     d.systolic  ?? 0,
      diastolic:  d.diastolic ?? 0,
      diaMin:     d.diastolic ?? 0,
      diaMax:     d.diastolic ?? 0,
      event:      d.event ? { description: d.event.description, type: d.event.type } : undefined
    }))
  }, [filteredData, events, view])

  const total = points.reduce((sum, p) => sum + p.count, 0)

  return (
    <Card className="max-w-5xl mx-auto shadow-md">
      <CardHeader>
        <CardTitle>Blood Pressure + Medication Events</CardTitle>
        <Tabs defaultValue="daily" className="mt-2" onValueChange={v => setView(v as any)}>
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent>
        <LineChart
          data={points}
          width={800}
          height={400}
          margin={{ top: 20, left: 12, right: 12 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis    dataKey="timestamp" axisLine={false} tickLine={false} tickMargin={8} />
          <YAxis    domain={['dataMin - 5', 'dataMax + 10']} />
          <Tooltip content={<VitalsTooltip />} />

          {/* systolic with conditional dots */}
          <Line
            dataKey="systolic"
            stroke="#64748b"
            strokeWidth={2}
            type="monotone"
            dot={({ cx, cy, payload, index }: any) =>
              payload.event
                ? <Dot
                    key={`sys-${index}`}
                    cx={cx}
                    cy={cy}
                    r={5}
                    fill={dotColor(payload.event.type)}
                    stroke="#fff"
                    strokeWidth={1}
                  />
                : <g key={`sys-empty-${index}`} />
            }
          />

          {/* diastolic with conditional dots */}
          <Line
            dataKey="diastolic"
            stroke="#334155"
            strokeWidth={2}
            type="monotone"
            dot={({ cx, cy, payload, index }: any) =>
              payload.event
                ? <Dot
                    key={`dia-${index}`}
                    cx={cx}
                    cy={cy}
                    r={5}
                    fill={dotColor(payload.event.type)}
                    stroke="#fff"
                    strokeWidth={1}
                  />
                : <g key={`dia-empty-${index}`} />
            }
          />
        </LineChart>

        <VitalsLegend />
      </CardContent>

      <CardFooter>
        <div className="text-sm text-muted-foreground">
          Averages plotted. Colored dots indicate medication events. {total} reading{total !== 1 && 's'}.
        </div>
      </CardFooter>
    </Card>
  )
}
