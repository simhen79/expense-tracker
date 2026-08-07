import { CATEGORIES, type Category, type Expense } from './types'

export interface CategoryTotal {
  category: Category
  cents: number
  /** 0-100. Share of the total the breakdown was computed over. */
  percent: number
}

export interface MonthTotal {
  /** 'YYYY-MM' */
  month: string
  cents: number
}

export interface Filters {
  search: string
  category: Category | 'All'
  /** 'YYYY-MM-DD' or '' for unbounded. */
  from: string
  to: string
}

export const EMPTY_FILTERS: Filters = {
  search: '',
  category: 'All',
  from: '',
  to: '',
}

/** 'YYYY-MM-DD' -> 'YYYY-MM'. Safe because the date format is fixed-width. */
export function monthOf(isoDate: string): string {
  return isoDate.slice(0, 7)
}

export function totalCents(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amountCents, 0)
}

export function totalForMonth(expenses: Expense[], month: string): number {
  return totalCents(expenses.filter((e) => monthOf(e.date) === month))
}

/**
 * Spend per category, descending, zero-value categories dropped.
 * Percentages are of the passed-in set, so this works on filtered data too.
 */
export function categoryBreakdown(expenses: Expense[]): CategoryTotal[] {
  const total = totalCents(expenses)
  const sums = new Map<Category, number>(CATEGORIES.map((c) => [c, 0]))

  for (const e of expenses) {
    sums.set(e.category, (sums.get(e.category) ?? 0) + e.amountCents)
  }

  return CATEGORIES.map((category) => {
    const cents = sums.get(category) ?? 0
    return {
      category,
      cents,
      percent: total === 0 ? 0 : (cents / total) * 100,
    }
  })
    .filter((row) => row.cents > 0)
    .sort((a, b) => b.cents - a.cents)
}

/**
 * The last `count` months ending at `reference`, oldest first.
 * Months with no spend are included as zeroes so the trend line doesn't lie by
 * skipping the gap.
 */
export function monthlySeries(
  expenses: Expense[],
  reference: Date,
  count = 6
): MonthTotal[] {
  const months: MonthTotal[] = []

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(reference.getFullYear(), reference.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    months.push({ month: key, cents: totalForMonth(expenses, key) })
  }

  return months
}

/** Newest first; createdAt breaks ties within a day. */
export function sortByDateDesc(expenses: Expense[]): Expense[] {
  return [...expenses].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1
    return b.createdAt - a.createdAt
  })
}

/**
 * All filters are ANDed. Date bounds are inclusive and compare as strings,
 * which is valid for zero-padded 'YYYY-MM-DD'.
 */
export function applyFilters(expenses: Expense[], filters: Filters): Expense[] {
  const needle = filters.search.trim().toLowerCase()

  return expenses.filter((e) => {
    if (filters.category !== 'All' && e.category !== filters.category) return false
    if (filters.from && e.date < filters.from) return false
    if (filters.to && e.date > filters.to) return false
    if (needle) {
      const haystack = `${e.description} ${e.category}`.toLowerCase()
      if (!haystack.includes(needle)) return false
    }
    return true
  })
}

export function hasActiveFilters(filters: Filters): boolean {
  return (
    filters.search.trim() !== '' ||
    filters.category !== 'All' ||
    filters.from !== '' ||
    filters.to !== ''
  )
}
