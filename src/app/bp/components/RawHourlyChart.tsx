'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { ChartPoint } from '../utils/chartUtils'

interface RawHourlyChartProps {
  data: ChartPoint[]
}

export default function RawHourlyChart({ data }: RawHourlyChartProps) {
  return (
    <LineChart
      data={data}
      width={800}
      height={400}
      margin={{ top: 20, left: 12, right: 12 }}
    >
      <CartesianGrid vertical={false} />
      <XAxis
        dataKey="timestamp"
        axisLine={false}
        tickLine={false}
        tickFormatter={(ts) => {
          const d = new Date(ts)
          return d.getHours().toString().padStart(2, '0') + ':00'
        }}
      />
      <YAxis />
      <Tooltip
        labelFormatter={(label) => {
          const d = new Date(label)
          return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }}
        formatter={(value: number, name: string) => [value, name === 'systolic' ? 'Sys' : 'Dia']}
      />
      <Line dataKey="systolic" stroke="#64748b" strokeWidth={2} type="monotone" dot />
      <Line dataKey="diastolic" stroke="#334155" strokeWidth={2} type="monotone" dot />
    </LineChart>
  )
}
