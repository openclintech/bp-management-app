import fs from 'fs'
import path from 'path'
import { parse as parseCsv } from 'csv-parse/sync'
import { parse as parseDate } from 'date-fns'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedVitalsFromCSV() {
  const csvPath = path.join(process.cwd(), 'prisma', 'data', 'blood_pressure.csv')
  const csvText = fs.readFileSync(csvPath, 'utf-8')
  const rows = parseCsv(csvText, { columns: true, skip_empty_lines: true })

  const vitals = rows
    .map((row: any) => {
      const raw = row.timestamp.trim()
      const local = parseDate(raw, 'yyyy-MM-dd hh:mm a', new Date())

      if (isNaN(local.getTime())) {
        console.warn(`⚠️  Skipping invalid date → ${raw}`)
        return null
      }

      const utc = new Date(Date.UTC(
        local.getFullYear(),
        local.getMonth(),
        local.getDate(),
        local.getHours(),
        local.getMinutes(),
        0, 0
      ))

      return {
        type: row.type,
        systolic: Number(row.systolic),
        diastolic: Number(row.diastolic),
        value: null,
        timestamp: utc,
      }
    })
    .filter(Boolean)

  await prisma.vital.createMany({ data: vitals })
  console.log(`✅  Seeded ${vitals.length} blood-pressure rows`)
}

async function seedSampleVitals() {
  await prisma.vital.createMany({
    data: [
      { type: 'heart_rate', value: 72, timestamp: new Date(Date.UTC(2025, 4, 1, 8)) },
      { type: 'heart_rate', value: 85, timestamp: new Date(Date.UTC(2025, 4, 1, 12)) },
    ],
  })
  console.log('✅  Seeded sample heart-rate vitals')
}

async function seedMedicationEvents() {
  await prisma.medicationEvent.createMany({
    data: [
      { // actual data
        timestamp: new Date('2025-05-17T09:00:00Z'),
        description: 'PRN Clonidine 0.1 mg given after RN Cortez measured BP of >160+ systolic',
        type: 'ADHOC_DOSE',
      },
      { // actual data
        timestamp: new Date('2025-05-18T06:40:00Z'),
        description: 'PRN Clonidine 0.1 mg given after RN measured BP of 200+ systolic',
        type: 'ADHOC_DOSE',
      },
      { // actual data
        timestamp: new Date('2025-05-19T09:00:00Z'),
        description: 'Clonidine 0.1 mg patch added',
        type: 'MED_ADDED',
      },
      { // ordered on 5/22 and placed on 5/23
        timestamp: new Date('2025-05-23T09:00:00Z'),
        description: 'Clonidine 0.1 mg patch increased to 0.2 mg patch',
        type: 'ADJUSTED',
      },
      { // replaced on 5/26 as it's replaced every monday.
        timestamp: new Date('2025-05-26T09:00:00Z'),
        description: 'Clonidine 0.2 mg patch replaced',
        type: 'REPLACED',
      },
      { // actual data
        timestamp: new Date('2025-05-27T09:00:00Z'),
        description: 'Morning dose was given between 11 AM and 12 PM',
        type: 'ADMIN_LATE',
      },
      { // actual data
        timestamp: new Date('2025-05-28T15:50:00Z'),
        description: 'PRN Clonidine 0.1 mg given after RN measured BP of 191 systolic',
        type: 'ADHOC_DOSE',
      },
      { // actual data
        timestamp: new Date('2025-05-29T10:05:00Z'),
        description: 'PRN Clonidine 0.1 mg given after RN measured BP of 230/114 using withings bp cuff',
        type: 'ADHOC_DOSE',
      },
      { // actual data
        timestamp: new Date('2025-05-30T09:11:00Z'),
        description: 'PRN Clonidine 0.1 mg given after RN measured BP of 203/110 using their own wrist bp cuff from amazon',
        type: 'ADHOC_DOSE',
      },
      { // actual data
        timestamp: new Date('2025-05-31T06:30:00Z'),
        description: 'PRN Clonidine 0.1 mg given after RN (Rosie) measured BP of 191+ using bp cuff from nursing home',
        type: 'ADHOC_DOSE',
      },
      { // actual data
        timestamp: new Date('2025-05-31T17:55:00Z'),
        description: 'PRN Clonidine 0.1 mg given after Agency RN measured BP of 172/88 using bp cuff (likely his own)',
        type: 'ADHOC_DOSE',
      },
      { // actual data
        timestamp: new Date('2025-06-01T18:41:00Z'),
        description: 'PRN Clonidine 0.1 mg given after RN measured BP of 262/108 using bp cuff (pole)',
        type: 'ADHOC_DOSE',
      },
      { // actual data
        timestamp: new Date('2025-06-02T08:00:00Z'),
        description: 'Morning dose was given around 12 PM',
        type: 'ADMIN_LATE',
      },
      { // actual data
        timestamp: new Date('2025-06-02T12:10:00Z'),
        description: 'PRN Clonidine 0.1 mg given after Cortez RN measured BP of 240 systolic using bp cuff',
        type: 'ADHOC_DOSE',
      },
      { // actual data
        timestamp: new Date('2025-06-08T06:00:00Z'),
        description: 'PRN Clonidine 0.1 mg given after Rosie RN measured BP of 180/74 using bp cuff',
        type: 'ADHOC_DOSE',
      },
    ],
  })
  console.log('✅  Seeded medication events')
}

async function main() {
  await seedVitalsFromCSV()
  await seedSampleVitals()
  await seedMedicationEvents()
  console.log('🌱  Seeding complete')
}

main()
  .catch(e => { console.error('❌  Seed failed', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
