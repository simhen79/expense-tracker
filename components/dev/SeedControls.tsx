'use client'

import { useState } from 'react'
import { useToast } from '@/components/providers/ToastProvider'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { generateSampleExpenses } from '@/lib/seed'
import { saveExpenses } from '@/lib/storage'

const SIZES = [
  { months: 3, label: '3 months' },
  { months: 6, label: '6 months' },
  { months: 24, label: '2 years' },
]

export function SeedControls() {
  const { notify } = useToast()
  const [busy, setBusy] = useState(false)

  function seed(months: number) {
    setBusy(true)
    const expenses = generateSampleExpenses({ months })
    const error = saveExpenses(expenses)
    setBusy(false)

    if (error) {
      notify(error, 'error')
      return
    }
    // A full reload is the honest way to get the provider to re-read storage —
    // it holds the expense list in state and only loads it once, on mount.
    window.location.href = '/'
  }

  function clear() {
    const error = saveExpenses([])
    if (error) {
      notify(error, 'error')
      return
    }
    window.location.href = '/'
  }

  return (
    <Card className="p-5">
      <p className="text-sm text-slate-600">
        Generates deterministic expenses across every category, including
        descriptions with commas, quotes, em dashes and non-ASCII text.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {SIZES.map((size) => (
          <Button key={size.months} disabled={busy} onClick={() => seed(size.months)}>
            Load {size.label}
          </Button>
        ))}
        <Button variant="danger" disabled={busy} onClick={clear}>
          Clear all
        </Button>
      </div>
    </Card>
  )
}
