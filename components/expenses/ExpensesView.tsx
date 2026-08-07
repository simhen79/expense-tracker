'use client'

import { useMemo, useState } from 'react'
import { useExpenses } from '@/components/providers/ExpenseProvider'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/States'
import { useToast } from '@/components/providers/ToastProvider'
import { applyFilters, EMPTY_FILTERS, hasActiveFilters, totalCents, type Filters } from '@/lib/analytics'
import { downloadCSV } from '@/lib/csv'
import { formatMoney, todayISO } from '@/lib/format'
import { ExpenseList } from './ExpenseList'
import { FilterBar } from './FilterBar'

export function ExpensesView() {
  const { expenses, loaded, openAdd } = useExpenses()
  const { notify } = useToast()
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)

  const filtered = useMemo(() => applyFilters(expenses, filters), [expenses, filters])
  const filteredTotal = useMemo(() => totalCents(filtered), [filtered])
  const filtering = hasActiveFilters(filters)

  function handleExport() {
    if (filtered.length === 0) {
      notify('Nothing to export', 'error')
      return
    }
    // Export what's on screen, not the whole store — if someone has filtered to
    // "Bills in July", that's the report they're asking for.
    downloadCSV(filtered, `expenses-${todayISO()}.csv`)
    notify(`Exported ${filtered.length} ${filtered.length === 1 ? 'expense' : 'expenses'}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Expenses</h1>
          <p className="mt-1 text-sm text-slate-500">
            {!loaded ? (
              'Loading…'
            ) : (
              <>
                {filtered.length} {filtered.length === 1 ? 'expense' : 'expenses'}
                {filtering ? ` of ${expenses.length}` : ''} ·{' '}
                <span className="tabular font-medium text-slate-700">
                  {formatMoney(filteredTotal)}
                </span>
              </>
            )}
          </p>
        </div>
        <Button variant="secondary" onClick={handleExport} disabled={!loaded}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path
              d="M10 3v9m0 0l-3.25-3.25M10 12l3.25-3.25M4 15.5h12"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Export CSV
        </Button>
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      <Card>
        {loaded && filtered.length === 0 ? (
          filtering ? (
            <EmptyState
              title="No matching expenses"
              description="Try widening the date range or clearing the category filter."
              action={
                <Button variant="secondary" onClick={() => setFilters(EMPTY_FILTERS)}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              title="No expenses yet"
              description="Add your first expense to start tracking where your money goes."
              action={<Button onClick={openAdd}>Add your first expense</Button>}
            />
          )
        ) : (
          <ExpenseList expenses={filtered} />
        )}
      </Card>
    </div>
  )
}
