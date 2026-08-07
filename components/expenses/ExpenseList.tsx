'use client'

import { useState } from 'react'
import { useExpenses } from '@/components/providers/ExpenseProvider'
import { CategoryBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/States'
import { formatDate, formatMoney } from '@/lib/format'
import type { Expense } from '@/lib/types'

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M13.5 3.5l3 3L7 16H4v-3l9.5-9.5z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4 6h12M8.5 6V4.5h3V6M6 6l.6 9.5h6.8L14 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function RowActions({ expense, onDelete }: { expense: Expense; onDelete: () => void }) {
  const { openEdit } = useExpenses()
  return (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        onClick={() => openEdit(expense)}
        aria-label={`Edit ${expense.description || expense.category}`}
        className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
      >
        <EditIcon />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={`Delete ${expense.description || expense.category}`}
        className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
      >
        <TrashIcon />
      </button>
    </div>
  )
}

export function ExpenseList({ expenses }: { expenses: Expense[] }) {
  const { loaded, deleteExpense } = useExpenses()
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null)

  if (!loaded) {
    return (
      <div className="space-y-3 p-5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-24 rounded-md" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    )
  }

  function confirmDelete() {
    if (!pendingDelete) return
    deleteExpense(pendingDelete.id)
    setPendingDelete(null)
  }

  return (
    <>
      {/* Desktop: a real table. Below sm it becomes stacked cards — six columns
          on a phone forces horizontal scrolling and unreadable truncation. */}
      <div className="hidden sm:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 text-left">
              <th scope="col" className="px-5 py-2.5 text-xs font-medium text-slate-500">Date</th>
              <th scope="col" className="px-5 py-2.5 text-xs font-medium text-slate-500">Category</th>
              <th scope="col" className="px-5 py-2.5 text-xs font-medium text-slate-500">Description</th>
              <th scope="col" className="px-5 py-2.5 text-right text-xs font-medium text-slate-500">Amount</th>
              <th scope="col" className="px-5 py-2.5">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.map((expense) => (
              <tr key={expense.id} className="group transition-colors hover:bg-slate-50/70">
                <td className="tabular whitespace-nowrap px-5 py-3 text-sm text-slate-600">
                  {formatDate(expense.date)}
                </td>
                <td className="px-5 py-3">
                  <CategoryBadge category={expense.category} />
                </td>
                <td className="max-w-0 truncate px-5 py-3 text-sm text-slate-900">
                  {expense.description || <span className="text-slate-400">—</span>}
                </td>
                <td className="tabular whitespace-nowrap px-5 py-3 text-right text-sm font-medium text-slate-900">
                  {formatMoney(expense.amountCents)}
                </td>
                <td className="w-px px-5 py-3">
                  {/* Actions stay hidden until hover/focus so the table reads
                      calmly, but focus-within keeps them keyboard-reachable. */}
                  <div className="opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    <RowActions expense={expense} onDelete={() => setPendingDelete(expense)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-slate-100 sm:hidden">
        {expenses.map((expense) => (
          <li key={expense.id} className="flex items-start gap-3 px-4 py-3.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">
                {expense.description || expense.category}
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <CategoryBadge category={expense.category} />
                <span className="tabular text-xs text-slate-500">{formatDate(expense.date)}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="tabular text-sm font-semibold text-slate-900">
                {formatMoney(expense.amountCents)}
              </span>
              <RowActions expense={expense} onDelete={() => setPendingDelete(expense)} />
            </div>
          </li>
        ))}
      </ul>

      <Modal
        open={pendingDelete !== null}
        title="Delete expense?"
        onClose={() => setPendingDelete(null)}
      >
        <div className="px-5 py-5">
          <p className="text-sm text-slate-600">
            {pendingDelete ? (
              <>
                <span className="font-medium text-slate-900">
                  {formatMoney(pendingDelete.amountCents)}
                </span>{' '}
                {pendingDelete.description ? `for “${pendingDelete.description}” ` : ''}
                on {formatDate(pendingDelete.date)} will be removed. This can’t be undone.
              </>
            ) : null}
          </p>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4">
          <Button variant="secondary" onClick={() => setPendingDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </>
  )
}
