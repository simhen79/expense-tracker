import { describe, expect, it } from 'vitest'
import { toCSV } from './csv'
import type { Expense } from './types'

const base: Expense = {
  id: '1',
  amountCents: 1234,
  date: '2026-08-07',
  category: 'Food',
  description: 'Lunch',
  createdAt: 0,
}

describe('toCSV', () => {
  it('emits a header even with no rows', () => {
    expect(toCSV([])).toBe('Date,Category,Description,Amount')
  })

  it('writes amounts as decimals, not cents', () => {
    expect(toCSV([base])).toContain('2026-08-07,Food,Lunch,12.34')
  })

  it('quotes fields containing a comma', () => {
    const row = toCSV([{ ...base, description: 'Lunch, then coffee' }])
    expect(row).toContain('"Lunch, then coffee"')
  })

  it('doubles inner quotes', () => {
    const row = toCSV([{ ...base, description: 'The "good" place' }])
    expect(row).toContain('"The ""good"" place"')
  })

  it('quotes fields containing a newline', () => {
    const row = toCSV([{ ...base, description: 'line one\nline two' }])
    expect(row).toContain('"line one\nline two"')
  })

  it('separates records with CRLF', () => {
    const out = toCSV([base, { ...base, id: '2' }])
    expect(out.split('\r\n')).toHaveLength(3)
  })
})
