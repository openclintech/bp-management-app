'use client'

import { useState, useMemo } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import RawHourlyChart from './RawHourlyChart'
import AggregatedChart from './AggregatedChart'
import VitalsSummarySidebar from '@/app/bp/components/VitalsComponentSidebar'

import {
  ChartPoint,
  getHourly,
  getDaily,
  getWeekly,
  getMonthly,
} from '../utils/chartUtils'

interface BpDashboardProps {
  vitals: ChartPoint[]
}

export default function BpDashboard({ vitals }: BpDashboardProps) {
  const [view, setView] = useState<'hourly' | 'daily' | 'weekly' | 'monthly'>('hourly')

  const hourlyData = useMemo(() => getHourly(vitals), [vitals])
  const dailyData = useMemo(() => getDaily(vitals), [vitals])
  const weeklyData = useMemo(() => getWeekly(vitals), [vitals])
  const monthlyData = useMemo(() => getMonthly(vitals), [vitals])

  return (
    <div className="flex gap-6 p-6">
      {/* Sidebar on the left */}
      <VitalsSummarySidebar vitals={vitals} />

      {/* Main chart area */}
      <div className="flex-1">
        <Tabs defaultValue="hourly" onValueChange={(v) => setView(v as any)}>
          <TabsList className="mb-4">
            <TabsTrigger value="hourly">Hourly</TabsTrigger>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>

        {view === 'hourly'  && <RawHourlyChart    data={hourlyData} />}  
        {view === 'daily'   && <AggregatedChart   data={dailyData} />} 
        {view === 'weekly'  && <AggregatedChart   data={weeklyData} />} 
        {view === 'monthly' && <AggregatedChart   data={monthlyData} />}
      </div>
    </div>
  )
}
