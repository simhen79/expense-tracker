import { describe, expect, it } from 'vitest'
import {
  applyFilters,
  categoryBreakdown,
  EMPTY_FILTERS,
  monthlySeries,
  monthOf,
  sortByDateDesc,
  totalCents,
  totalForMonth,
} from './analytics'
import type { Expense } from './types'

function expense(partial: Partial<Expense> & { amountCents: number; date: string }): Expense {
  return {
    id: Math.random().toString(36).slice(2),
    category: 'Food',
    description: '',
    createdAt: 0,
    ...partial,
  }
}

const sample: Expense[] = [
  expense({ amountCents: 1000, date: '2026-08-05', category: 'Food', description: 'Lunch' }),
  expense({ amountCents: 2500, date: '2026-08-01', category: 'Bills', description: 'Internet' }),
  expense({ amountCents: 500, date: '2026-07-20', category: 'Food', description: 'Coffee' }),
]

describe('totalCents', () => {
  it('sums to exact cents with no float drift', () => {
    // 0.1 + 0.2 in floats is 0.30000000000000004; in cents it is exactly 30.
    const drifty = [expense({ amountCents: 10, date: '2026-08-01' }), expense({ amountCents: 20, date: '2026-08-01' })]
    expect(totalCents(drifty)).toBe(30)
  })

  it('returns 0 for an empty list', () => {
    expect(totalCents([])).toBe(0)
  })
})

describe('monthOf / totalForMonth', () => {
  it('extracts the month key', () => {
    expect(monthOf('2026-08-05')).toBe('2026-08')
  })

  it('counts only the requested month', () => {
    expect(totalForMonth(sample, '2026-08')).toBe(3500)
    expect(totalForMonth(sample, '2026-07')).toBe(500)
    expect(totalForMonth(sample, '2026-06')).toBe(0)
  })
})

describe('categoryBreakdown', () => {
  it('sorts descending and computes percentages of the given set', () => {
    const rows = categoryBreakdown(sample)
    expect(rows.map((r) => r.category)).toEqual(['Bills', 'Food'])
    expect(rows[0].cents).toBe(2500)
    expect(rows[1].cents).toBe(1500)
    expect(rows[0].percent).toBeCloseTo(62.5)
  })

  it('omits categories with no spend', () => {
    expect(categoryBreakdown(sample).some((r) => r.category === 'Shopping')).toBe(false)
  })

  it('does not divide by zero on an empty set', () => {
    expect(categoryBreakdown([])).toEqual([])
  })
})

describe('monthlySeries', () => {
  it('returns `count` months, oldest first, including empty months', () => {
    const series = monthlySeries(sample, new Date(2026, 7, 15), 3)
    expect(series).toEqual([
      { month: '2026-06', cents: 0 },
      { month: '2026-07', cents: 500 },
      { month: '2026-08', cents: 3500 },
    ])
  })

  it('walks back across a year boundary', () => {
    const series = monthlySeries([], new Date(2026, 1, 10), 3)
    expect(series.map((s) => s.month)).toEqual(['2025-12', '2026-01', '2026-02'])
  })
})

describe('sortByDateDesc', () => {
  it('puts newest first and breaks same-day ties by createdAt', () => {
    const rows = sortByDateDesc([
      expense({ amountCents: 1, date: '2026-08-01', createdAt: 100, description: 'first' }),
      expense({ amountCents: 2, date: '2026-08-01', createdAt: 200, description: 'second' }),
      expense({ amountCents: 3, date: '2026-08-02', createdAt: 50, description: 'later day' }),
    ])
    expect(rows.map((r) => r.description)).toEqual(['later day', 'second', 'first'])
  })

  it('does not mutate the input', () => {
    const input = [...sample]
    sortByDateDesc(input)
    expect(input).toEqual(sample)
  })
})

describe('applyFilters', () => {
  it('returns everything when no filters are set', () => {
    expect(applyFilters(sample, EMPTY_FILTERS)).toHaveLength(3)
  })

  it('filters by category', () => {
    expect(applyFilters(sample, { ...EMPTY_FILTERS, category: 'Food' })).toHaveLength(2)
  })

  it('treats date bounds as inclusive', () => {
    const rows = applyFilters(sample, { ...EMPTY_FILTERS, from: '2026-08-01', to: '2026-08-05' })
    expect(rows).toHaveLength(2)
  })

  it('searches description and category, case-insensitively', () => {
    expect(applyFilters(sample, { ...EMPTY_FILTERS, search: 'LUNCH' })).toHaveLength(1)
    expect(applyFilters(sample, { ...EMPTY_FILTERS, search: 'bills' })).toHaveLength(1)
  })

  it('ANDs multiple filters', () => {
    const rows = applyFilters(sample, {
      ...EMPTY_FILTERS,
      category: 'Food',
      from: '2026-08-01',
      to: '',
    })
    expect(rows).toHaveLength(1)
    expect(rows[0].description).toBe('Lunch')
  })
})
