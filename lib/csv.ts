import { centsToInput } from './format'
import type { Expense } from './types'

const HEADERS = ['Date', 'Category', 'Description', 'Amount'] as const

/**
 * RFC 4180: wrap a field in quotes when it contains a comma, quote or newline,
 * and escape inner quotes by doubling them. Without this, a description like
 * `Lunch, "the good place"` silently shifts every later column.
 */
function escapeField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function toCSV(expenses: Expense[]): string {
  const rows = expenses.map((e) =>
    [e.date, e.category, e.description, centsToInput(e.amountCents)]
      .map(escapeField)
      .join(',')
  )
  return [HEADERS.join(','), ...rows].join('\r\n')
}

/** Triggers a browser download. No-op outside the browser. */
export function downloadCSV(expenses: Expense[], filename: string): void {
  const blob = new Blob([toCSV(expenses)], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
