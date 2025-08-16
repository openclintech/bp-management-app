import fs from 'fs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function exportVitals() {
  const vitals = await prisma.vital.findMany({ orderBy: { timestamp: 'asc' } })

  const csv = [
    ['type', 'systolic', 'diastolic', 'value', 'timestamp'].join(','),
    ...vitals.map(v =>
      [
        v.type,
        v.systolic ?? '',
        v.diastolic ?? '',
        v.value ?? '',
        v.timestamp.toISOString(),
      ].join(',')
    ),
  ].join('\n')

  fs.writeFileSync('vitals_export.csv', csv, 'utf-8')
  console.log(`✅ Exported ${vitals.length} vitals to vitals_export.csv`)
}

exportVitals()
  .catch(e => console.error('❌ Export failed:', e))
  .finally(() => prisma.$disconnect())
