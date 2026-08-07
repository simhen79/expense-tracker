'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Field, SelectInput, TextInput } from '@/components/ui/Field'
import { centsToInput, todayISO } from '@/lib/format'
import { CATEGORIES, type Category, type Expense, type ExpenseDraft, type ExpenseErrors } from '@/lib/types'
import { validateExpense } from '@/lib/validation'

interface ExpenseFormProps {
  /** Pre-fills the form for editing; omit to add a new expense. */
  initial?: Expense | null
  onSubmit: (draft: ExpenseDraft) => void
  onCancel: () => void
}

function initialDraft(expense: Expense | null | undefined): ExpenseDraft {
  if (!expense) {
    return { amount: '', date: todayISO(), category: 'Food', description: '' }
  }
  return {
    amount: centsToInput(expense.amountCents),
    date: expense.date,
    category: expense.category,
    description: expense.description,
  }
}

export function ExpenseForm({ initial, onSubmit, onCancel }: ExpenseFormProps) {
  const [draft, setDraft] = useState<ExpenseDraft>(() => initialDraft(initial))
  const [errors, setErrors] = useState<ExpenseErrors>({})
  // Validate on every keystroke only after the first failed submit. Showing
  // "Amount is required" while someone is still typing the first digit is
  // hostile; showing it after they've submitted is helpful.
  const [submitted, setSubmitted] = useState(false)

  function update<K extends keyof ExpenseDraft>(key: K, value: ExpenseDraft[K]) {
    const next = { ...draft, [key]: value }
    setDraft(next)
    if (submitted) setErrors(validateExpense(next))
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)

    const found = validateExpense(draft)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    onSubmit(draft)
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-4 px-5 py-5">
        <Field id="amount" label="Amount" error={errors.amount}>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
              R
            </span>
            <TextInput
              id="amount"
              data-autofocus
              // inputMode numeric brings up the number pad on mobile without
              // type="number", which rejects pasted "R12,34" and shows spinners.
              inputMode="decimal"
              autoComplete="off"
              placeholder="0.00"
              className="pl-7 tabular"
              value={draft.amount}
              invalid={Boolean(errors.amount)}
              onChange={(e) => update('amount', e.target.value)}
            />
          </div>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field id="date" label="Date" error={errors.date}>
            <TextInput
              id="date"
              type="date"
              value={draft.date}
              invalid={Boolean(errors.date)}
              onChange={(e) => update('date', e.target.value)}
            />
          </Field>

          <Field id="category" label="Category" error={errors.category}>
            <SelectInput
              id="category"
              value={draft.category}
              onChange={(e) => update('category', e.target.value as Category)}
            >
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>

        <Field id="description" label="Description" error={errors.description}>
          <TextInput
            id="description"
            autoComplete="off"
            placeholder="What was it for?"
            value={draft.description}
            invalid={Boolean(errors.description)}
            onChange={(e) => update('description', e.target.value)}
          />
        </Field>
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initial ? 'Save changes' : 'Add expense'}</Button>
      </div>
    </form>
  )
}
