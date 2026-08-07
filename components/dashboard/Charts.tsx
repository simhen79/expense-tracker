'use client'

import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import { useExpenses } from '@/components/providers/ExpenseProvider'
import { CategoryDot } from '@/components/ui/Badge'
import { Card, CardHeader } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/States'
import { categoryBreakdown, monthlySeries, totalCents } from '@/lib/analytics'
import { formatMoney } from '@/lib/format'

const ChartFallback = () => <Skeleton className="h-[220px] w-full" />

// ssr: false because Recharts' ResponsiveContainer measures the DOM on mount.
// Server-rendered it produces a 0x0 chart that then snaps to full size — a
// visible flash plus a hydration warning. Declared here, in a client component,
// because `ssr: false` is not permitted in a Server Component.
const CategoryDonutChart = dynamic(
  () => import('./CategoryDonutChart').then((m) => m.CategoryDonutChart),
  { ssr: false, loading: ChartFallback }
)

const MonthlyTrendChart = dynamic(
  () => import('./MonthlyTrendChart').then((m) => m.MonthlyTrendChart),
  { ssr: false, loading: ChartFallback }
)

export function Charts() {
  const { expenses, loaded } = useExpenses()

  const breakdown = useMemo(() => categoryBreakdown(expenses), [expenses])
  const total = useMemo(() => totalCents(expenses), [expenses])
  const series = useMemo(() => monthlySeries(expenses, new Date(), 6), [expenses])

  const hasData = expenses.length > 0

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <CardHeader title="Spending by category" subtitle="All time" />
        <div className="p-5">
          {!loaded ? (
            <ChartFallback />
          ) : !hasData ? (
            <div className="flex h-[220px] items-center justify-center text-sm text-slate-500">
              No spending yet
            </div>
          ) : (
            <>
              <CategoryDonutChart data={breakdown} totalCents={total} />
              <ul className="mt-4 space-y-2">
                {breakdown.map((row) => (
                  <li key={row.category} className="flex items-center gap-2.5 text-sm">
                    <CategoryDot category={row.category} />
                    <span className="text-slate-700">{row.category}</span>
                    <span className="ml-auto tabular font-medium text-slate-900">
                      {formatMoney(row.cents)}
                    </span>
                    <span className="tabular w-12 text-right text-xs text-slate-500">
                      {row.percent.toFixed(0)}%
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </Card>

      <Card className="flex flex-col lg:col-span-3">
        <CardHeader title="Monthly trend" subtitle="Last 6 months" />
        <div className="flex-1 p-5">
          {!loaded ? <ChartFallback /> : <MonthlyTrendChart data={series} />}
        </div>
      </Card>
    </div>
  )
}
