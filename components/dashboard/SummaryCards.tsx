'use client'

import { useMemo } from 'react'
import { useExpenses } from '@/components/providers/ExpenseProvider'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/States'
import { categoryBreakdown, monthOf, totalCents, totalForMonth } from '@/lib/analytics'
import { cn } from '@/lib/cn'
import { formatMoney, percentChange, toISODate } from '@/lib/format'

interface Metric {
  label: string
  value: string
  caption: string
  /** Signed percent vs the previous period; null hides the pill. */
  delta?: number | null
}

function DeltaPill({ delta }: { delta: number }) {
  // For spending, up is bad — the colours are inverted relative to a revenue
  // dashboard on purpose.
  const up = delta > 0
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium',
        up ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
      )}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path
          d={up ? 'M6 9.5V2.5M6 2.5L3 5.5M6 2.5l3 3' : 'M6 2.5v7M6 9.5l3-3M6 9.5l-3-3'}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {Math.abs(delta).toFixed(0)}%
    </span>
  )
}

export function SummaryCards() {
  const { expenses, loaded } = useExpenses()

  const metrics = useMemo<Metric[]>(() => {
    const now = new Date()
    const thisMonth = monthOf(toISODate(now))
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonth = monthOf(toISODate(prev))

    const total = totalCents(expenses)
    const monthTotal = totalForMonth(expenses, thisMonth)
    const lastMonthTotal = totalForMonth(expenses, lastMonth)
    const top = categoryBreakdown(expenses)[0]

    // Average over days elapsed, not days in the month — dividing August's
    // spend by 31 on the 3rd understates the run rate by an order of magnitude.
    const daysElapsed = now.getDate()

    return [
      {
        label: 'Total spent',
        value: formatMoney(total),
        caption: `${expenses.length} ${expenses.length === 1 ? 'expense' : 'expenses'}`,
      },
      {
        label: 'This month',
        value: formatMoney(monthTotal),
        caption: `vs ${formatMoney(lastMonthTotal)} last month`,
        delta: percentChange(monthTotal, lastMonthTotal),
      },
      {
        label: 'Top category',
        value: top ? top.category : '—',
        caption: top ? `${formatMoney(top.cents)} · ${top.percent.toFixed(0)}% of total` : 'No data yet',
      },
      {
        label: 'Daily average',
        value: formatMoney(Math.round(monthTotal / daysElapsed)),
        caption: `over ${daysElapsed} ${daysElapsed === 1 ? 'day' : 'days'} this month`,
      },
    ]
  }, [expenses])

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.label} className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {metric.label}
          </p>
          {!loaded ? (
            <>
              <Skeleton className="mt-2.5 h-7 w-28" />
              <Skeleton className="mt-2 h-3.5 w-36" />
            </>
          ) : (
            <>
              <div className="mt-2 flex items-center gap-2">
                <p className="tabular text-2xl font-semibold tracking-tight text-slate-900">
                  {metric.value}
                </p>
                {metric.delta != null ? <DeltaPill delta={metric.delta} /> : null}
              </div>
              <p className="mt-1 text-xs text-slate-500">{metric.caption}</p>
            </>
          )}
        </Card>
      ))}
    </div>
  )
}
