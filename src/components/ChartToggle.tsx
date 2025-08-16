'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import VitalsChart from '@/components/VitalsChart'
import VitalsChartWithEvents from '@/components/VitalsChartWithEvents'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

/* --- reuse from VitalsChart -------------------------------------------- */
type ChartPoint = Parameters<typeof VitalsChart>[0]['data'][number]

type MedEvent = {
  timestamp: string
  displayDate: string
  description: string
  type: 'MED_ADDED' | 'ADMIN_LATE' | 'ADHOC_DOSE' | 'ADJUSTED' | 'REPLACED'
}

// ✅ Stronger typing
type TimeFilter = 'all' | 'morning' | 'evening'

export default function ChartToggle({
  vitals,
  events,
}: {
  vitals: ChartPoint[]
  events: MedEvent[]
}) {
  const [showEvents, setShowEvents] = useState(false)
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')

  return (
    <div className="flex flex-col gap-4">
      {/* Show Events Toggle */}
      <div className="flex items-center gap-2">
        <Switch checked={showEvents} onCheckedChange={setShowEvents} />
        <span className="text-sm select-none">Show medication events</span>
      </div>

      {/* Time Filter Tabs */}
      <div className="flex items-center gap-2">
        <span className="text-sm select-none">Time of day:</span>
        <Tabs defaultValue="all" onValueChange={(v: TimeFilter) => setTimeFilter(v)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="morning">Morning</TabsTrigger>
            <TabsTrigger value="evening">Evening</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Chart Display */}
      {showEvents ? (
        <VitalsChartWithEvents data={vitals} events={events} timeFilter={timeFilter} />
      ) : (
        <VitalsChart data={vitals} timeFilter={timeFilter} />
      )}
    </div>
  )
}
