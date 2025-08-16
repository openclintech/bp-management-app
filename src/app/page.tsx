import { PrismaClient } from '@prisma/client'
import { format } from 'date-fns'
import ChartToggle from '@/components/ChartToggle'
import VitalsSummarySidebar from '@/components/VitalsSummarySidebar'

const prisma = new PrismaClient()

export default async function HomePage() {
  /* ───── blood-pressure points ───── */
  const vitals = await prisma.vital.findMany({
    orderBy: { timestamp: 'asc' },
    where: { type: 'blood_pressure' },
  })

  const chartData = vitals.map((v) => {
    const d = new Date(v.timestamp)
    const hour = d.getUTCHours() // Use getUTCHours if your data is in UTC

    return {
      timestamp: d.toISOString(),
      displayDate: format(d, 'MMM d'),
      timeOfDay: hour < 12 ? 'morning' : 'evening',
      systolic: v.systolic,
      diastolic: v.diastolic,
    }
  })

  /* ───── medication events only ───── */
  const medicationEvents = await prisma.medicationEvent.findMany({
    orderBy: { timestamp: 'asc' },
  })

  const events = medicationEvents.map((e) => {
    const d = new Date(e.timestamp)
    return {
      timestamp: d.toISOString(),
      displayDate: format(d, 'MMM d'),
      description: e.description,
      type: e.type, // <-- add this
    }
  })

  return (
    <main className="p-6 min-h-screen bg-background text-foreground">
      <div className="flex gap-6">
        <VitalsSummarySidebar vitals={chartData} />
        <div className="flex-1">
          <ChartToggle vitals={chartData} events={events} />
        </div>
      </div>
    </main>
  )
}
