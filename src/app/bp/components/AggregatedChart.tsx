'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { AggPoint } from '../utils/chartUtils'

interface AggregatedChartProps {
  data: AggPoint[]
}

export default function AggregatedChart({ data }: AggregatedChartProps) {
  return (
    <LineChart
      data={data}
      width={800}
      height={400}
      margin={{ top: 20, left: 12, right: 12 }}
    >
      <CartesianGrid vertical={false} />
      <XAxis dataKey="label" axisLine={false} tickLine={false} />
      <YAxis />
      <Tooltip
        content={({ active, payload }) => {
          if (!active || !payload?.length) return null
          const p = payload[0].payload as AggPoint
          return (
            <div className="rounded-md border bg-white p-3 shadow-sm text-sm">
              <p className="font-medium mb-2">{p.label}</p>
              <div>Sys Avg: {p.avgSystolic}, Min: {p.minSystolic}, Max: {p.maxSystolic}</div>
              <div>Dia Avg: {p.avgDiastolic}, Min: {p.minDiastolic}, Max: {p.maxDiastolic}</div>
            </div>
          )
        }}
      />
      <Line dataKey="avgSystolic" stroke="#64748b" strokeWidth={2} dot={false} />
      <Line dataKey="avgDiastolic" stroke="#334155" strokeWidth={2} dot={false} />
    </LineChart>
  )
}
