'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { CATEGORY_STYLES } from '@/lib/categories'
import { formatMoney } from '@/lib/format'
import type { CategoryTotal } from '@/lib/analytics'

interface Props {
  data: CategoryTotal[]
  totalCents: number
}

function MoneyTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload as CategoryTotal
  return (
    <div className="rounded-lg bg-slate-900 px-3 py-2 text-xs text-white shadow-lg">
      <p className="font-medium">{row.category}</p>
      <p className="tabular text-slate-300">
        {formatMoney(row.cents)} · {row.percent.toFixed(1)}%
      </p>
    </div>
  )
}

export function CategoryDonutChart({ data, totalCents }: Props) {
  return (
    <div className="relative h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="cents"
            nameKey="category"
            innerRadius={62}
            outerRadius={95}
            paddingAngle={2}
            strokeWidth={0}
            // Animation off: with a small dataset it reads as a flicker on
            // every filter change rather than as motion design.
            isAnimationActive={false}
          >
            {data.map((row) => (
              <Cell key={row.category} fill={CATEGORY_STYLES[row.category].hex} />
            ))}
          </Pie>
          <Tooltip content={<MoneyTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Centre label sits outside the SVG so it inherits page typography. */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs font-medium text-slate-500">Total</span>
        <span className="tabular text-xl font-semibold text-slate-900">
          {formatMoney(totalCents)}
        </span>
      </div>
    </div>
  )
}
