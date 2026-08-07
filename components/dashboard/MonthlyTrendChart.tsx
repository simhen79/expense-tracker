'use client'

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { MonthTotal } from '@/lib/analytics'
import { formatMoney, formatMoneyCompact, formatMonth, formatMonthShort } from '@/lib/format'

function MoneyTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload as MonthTotal
  return (
    <div className="rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-lg">
      <p className="font-medium">{formatMonth(row.month)}</p>
      <p className="tabular text-slate-300">{formatMoney(row.cents)}</p>
    </div>
  )
}

export function MonthlyTrendChart({ data }: { data: MonthTotal[] }) {
  // Highlight the current month (always the last bucket) so "where am I now"
  // reads at a glance without a legend.
  const lastIndex = data.length - 1

  return (
    // Definite height by default; h-full only from lg, where the grid row is
    // stretched by the taller category card beside it. Using h-full at every
    // width makes the height indefinite in the single-column layout, and
    // Recharts measures 0 before falling back to the min-height.
    <div className="h-[220px] w-full lg:h-full lg:min-h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
          <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tickFormatter={formatMonthShort}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <YAxis
            tickFormatter={(cents: number) => formatMoneyCompact(cents)}
            tickLine={false}
            axisLine={false}
            width={56}
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <Tooltip content={<MoneyTooltip />} cursor={{ fill: '#f1f5f9' }} />
          <Bar dataKey="cents" radius={[6, 6, 0, 0]} isAnimationActive={false}>
            {data.map((row, index) => (
              <Cell key={row.month} fill={index === lastIndex ? '#4f46e5' : '#c7d2fe'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
