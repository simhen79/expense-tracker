// en-ZA renders ZAR as "R", groups with non-breaking spaces and uses a comma
// for the decimal separator. en-US would render the code "ZAR 1,234.56".
const currency = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
})

const compactCurrency = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  notation: 'compact',
  maximumFractionDigits: 1,
})

/** 123456 -> "R 1 234,56" (the spaces are U+00A0) */
export function formatMoney(cents: number): string {
  return currency.format(cents / 100)
}

/** 123456 -> "R 1,2K". For axis ticks, where full precision is noise. */
export function formatMoneyCompact(cents: number): string {
  return compactCurrency.format(cents / 100)
}

/**
 * Parse a user-typed amount into integer cents.
 * Returns null if it isn't a usable number. Tolerates "R", grouping
 * separators, and either a comma or a period as the decimal separator.
 */
export function parseAmountToCents(input: string): number | null {
  // \s already covers the U+00A0 that Intl uses as a thousands separator.
  let cleaned = input.replace(/[R\s]/gi, '')

  // A trailing comma group is a decimal separator here, not grouping: "42,50"
  // means R42,50. Stripping it as grouping would silently read that as
  // R4 250,00 — a 100x error on a money field.
  if (!cleaned.includes('.') && /,\d{1,2}$/.test(cleaned)) {
    const last = cleaned.lastIndexOf(',')
    cleaned = `${cleaned.slice(0, last).replace(/,/g, '')}.${cleaned.slice(last + 1)}`
  } else {
    cleaned = cleaned.replace(/,/g, '')
  }

  if (cleaned === '') return null
  if (!/^\d*\.?\d*$/.test(cleaned)) return null
  const value = Number(cleaned)
  if (!Number.isFinite(value)) return null
  // Round rather than truncate: 19.999 -> 2000 cents, not 1999.
  return Math.round(value * 100)
}

/** 123456 -> "1234.56", for pre-filling the edit form. */
export function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2)
}

/**
 * 'YYYY-MM-DD' -> "Aug 7, 2026".
 * Split manually: `new Date('2026-08-07')` parses as UTC midnight and renders
 * as the previous day for anyone in a negative-offset timezone.
 */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/** '2026-08' -> "Aug 2026" */
export function formatMonth(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

/** '2026-08' -> "Aug" */
export function formatMonthShort(monthKey: string): string {
  const [y, m] = monthKey.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short' })
}

/** Today as 'YYYY-MM-DD' in local time. */
export function todayISO(): string {
  return toISODate(new Date())
}

export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Signed percentage change, or null when there's no baseline to compare to. */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null
  return ((current - previous) / previous) * 100
}
