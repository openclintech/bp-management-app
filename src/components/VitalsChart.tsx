'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { format, startOfWeek, endOfWeek, parseISO } from 'date-fns'

type ChartPoint = {
  timestamp: string
  displayDate: string
  systolic: number | null
  diastolic: number | null
}

type AggPoint = {
  timestamp: string
  count: number
  systolic: number;  sysMin: number; sysMax: number
  diastolic: number; diaMin: number; diaMax: number
}

function summarise(points: ChartPoint[]): AggPoint {
  const systArr = points.map(p => p.systolic ?? 0)
  const diastArr = points.map(p => p.diastolic ?? 0)
  const avg = (arr: number[]) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length)

  return {
    timestamp: '',
    count: points.length,
    systolic: avg(systArr),
    sysMin: Math.min(...systArr),
    sysMax: Math.max(...systArr),
    diastolic: avg(diastArr),
    diaMin: Math.min(...diastArr),
    diaMax: Math.max(...diastArr),
  }
}

function aggregateWeekly(data: ChartPoint[]): AggPoint[] {
  const weeks = new Map<string, ChartPoint[]>()

  for (const p of data) {
    const d = parseISO(p.timestamp)
    const beg = startOfWeek(d, { weekStartsOn: 1 })
    const end = endOfWeek(d, { weekStartsOn: 1 })
    const key = `${format(beg, 'MMM d')}–${format(end, 'd')}`

    if (!weeks.has(key)) weeks.set(key, [])
    weeks.get(key)!.push(p)
  }

  return Array.from(weeks.entries()).map(([label, pts]) => ({
    ...summarise(pts),
    timestamp: label,
  }))
}

function aggregateMonthly(data: ChartPoint[]): AggPoint[] {
  const summary = summarise(data)
  summary.timestamp = 'Monthly Avg'
  return [summary]
}

export default function VitalsChart({
  data,
  timeFilter = 'all',
}: {
  data: ChartPoint[]
  timeFilter?: 'all' | 'morning' | 'evening'
}) {
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('daily')

  const filteredData = data.filter(point => {
    if (timeFilter === 'all') return true
    const hour = new Date(point.timestamp).getHours()
    if (timeFilter === 'morning') return hour < 12
    if (timeFilter === 'evening') return hour >= 12
    return true
  })

  let displayed: AggPoint[]
  if (view === 'daily') {
    displayed = filteredData.map(d => ({
      timestamp: d.displayDate,
      count: 1,
      systolic: d.systolic ?? 0,
      sysMin: d.systolic ?? 0,
      sysMax: d.systolic ?? 0,
      diastolic: d.diastolic ?? 0,
      diaMin: d.diastolic ?? 0,
      diaMax: d.diastolic ?? 0,
    }))
  } else if (view === 'weekly') {
    displayed = aggregateWeekly(filteredData)
  } else {
    displayed = aggregateMonthly(filteredData)
  }

  const total = displayed.reduce((sum, p) => sum + p.count, 0)

  return (
    <Card className="max-w-5xl mx-auto shadow-md">
      <CardHeader>
        <CardTitle>Blood Pressure Trend</CardTitle>
        <CardDescription>
          Morning + Evening readings, last 30 days
        </CardDescription>
        <Tabs defaultValue="daily" className="mt-2" onValueChange={v => setView(v as any)}>
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent>
        <LineChart data={displayed} width={800} height={400} margin={{ top: 20, left: 12, right: 12 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="timestamp" axisLine={false} tickLine={false} tickMargin={8} />
          <YAxis />
          <Tooltip
            cursor={false}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const p = payload[0].payload as AggPoint

              return (
                <div className="rounded-md border bg-background p-3 shadow-sm text-sm">
                  <p className="font-medium mb-2">{p.timestamp}</p>
                  <div className="grid grid-cols-[80px_1fr_1fr] gap-x-3 gap-y-1">
                    <span></span> <span className="font-medium">Sys</span> <span className="font-medium">Dia</span>
                    <span className="text-muted-foreground">Avg</span> <span>{p.systolic}</span> <span>{p.diastolic}</span>
                    <span className="text-muted-foreground">Min</span> <span>{p.sysMin}</span> <span>{p.diaMin}</span>
                    <span className="text-muted-foreground">Max</span> <span>{p.sysMax}</span> <span>{p.diaMax}</span>
                  </div>
                  <p className="mt-2 text-muted-foreground">
                    {p.count} reading{p.count !== 1 && 's'}
                  </p>
                </div>
              )
            }}
          />
          <Line dataKey="systolic" stroke="#64748b" strokeWidth={2} type="monotone" dot={false} />
          <Line dataKey="diastolic" stroke="#334155" strokeWidth={2} type="monotone" dot={false} />
        </LineChart>
      </CardContent>

      <CardFooter>
        <div className="text-sm text-muted-foreground">
          Showing averages (tooltip includes min/max). {total} total reading{total !== 1 && 's'}.
        </div>
      </CardFooter>
    </Card>
  )
}
