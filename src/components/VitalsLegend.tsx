'use client'

export const dotColor = (type?: string) => {
  switch (type) {
    case 'MED_ADDED':
      return '#3b82f6' // blue
    case 'ADHOC_DOSE':
      return '#10b981' // green
    case 'ADMIN_LATE':
      return '#ef4444' // red
    case 'REPLACED':
    case 'ADJUSTED':
      return '#facc15' // yellow
    default:
      return '#9333ea' // fallback
  }
}

const legendItems = [
  { label: 'Medication Added', color: dotColor('MED_ADDED') },
  { label: 'Adhoc Dose', color: dotColor('ADHOC_DOSE') },
  { label: 'Medication Replaced', color: dotColor('REPLACED') },
  { label: 'Late Dose', color: dotColor('ADMIN_LATE') },
]

export default function VitalsLegend() {
  return (
    <div className="flex flex-wrap gap-4 mt-4 px-4">
      {legendItems.map((item) => (
        <div key={item.label} className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  )
}
