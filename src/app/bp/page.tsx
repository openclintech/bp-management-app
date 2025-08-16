// src/app/bp/page.tsx
import { PrismaClient } from '@prisma/client'
import BpDashboard from './components/BpDashboard'

const prisma = new PrismaClient()

export default async function Page() {
  // load last 12 months of blood-pressure vitals
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  const vitals = await prisma.vital.findMany({
    where: {
      type: 'blood_pressure',
      timestamp: { gte: oneYearAgo },
    },
    orderBy: { timestamp: 'asc' },
  })

  // shape for the client
  const shaped = vitals.map(v => ({
    timestamp: v.timestamp.toISOString(),
    systolic:  v.systolic!,
    diastolic: v.diastolic!,
  }))

  return <BpDashboard vitals={shaped} />
}
