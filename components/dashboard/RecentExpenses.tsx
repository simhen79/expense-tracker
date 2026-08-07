'use client'

import Link from 'next/link'
import { useExpenses } from '@/components/providers/ExpenseProvider'
import { ExpenseList } from '@/components/expenses/ExpenseList'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/States'

const RECENT_COUNT = 5

export function RecentExpenses() {
  const { expenses, loaded, openAdd } = useExpenses()
  const recent = expenses.slice(0, RECENT_COUNT)

  return (
    <Card>
      <CardHeader
        title="Recent activity"
        subtitle={`Your ${RECENT_COUNT} most recent expenses`}
        action={
          <Link
            href="/expenses"
            className="rounded-md px-2 py-1 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50"
          >
            View all
          </Link>
        }
      />
      {loaded && recent.length === 0 ? (
        <EmptyState
          title="No expenses yet"
          description="Add your first expense to start seeing your spending patterns."
          action={<Button onClick={openAdd}>Add your first expense</Button>}
        />
      ) : (
        <ExpenseList expenses={recent} />
      )}
    </Card>
  )
}
