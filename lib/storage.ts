import { CATEGORIES, type Expense } from './types'

const STORAGE_KEY = 'expensa.expenses.v1'

export type LoadResult =
  | { ok: true; expenses: Expense[] }
  | { ok: false; expenses: Expense[]; error: string }

/**
 * Anything can be in localStorage — a half-written value, data from an older
 * version of this app, or something another tab wrote. Validate every record
 * and drop the ones that don't fit rather than letting a bad row crash a
 * render deep inside a chart.
 */
function isExpense(value: unknown): value is Expense {
  if (typeof value !== 'object' || value === null) return false
  const e = value as Record<string, unknown>
  return (
    typeof e.id === 'string' &&
    typeof e.amountCents === 'number' &&
    Number.isFinite(e.amountCents) &&
    typeof e.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(e.date) &&
    typeof e.category === 'string' &&
    (CATEGORIES as readonly string[]).includes(e.category) &&
    typeof e.description === 'string' &&
    typeof e.createdAt === 'number'
  )
}

export function loadExpenses(): LoadResult {
  if (typeof window === 'undefined') return { ok: true, expenses: [] }

  let raw: string | null
  try {
    raw = window.localStorage.getItem(STORAGE_KEY)
  } catch {
    // Safari in private mode throws on access, not just on write.
    return { ok: false, expenses: [], error: 'Storage is unavailable in this browser.' }
  }

  if (raw === null) return { ok: true, expenses: [] }

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      discard()
      return { ok: false, expenses: [], error: 'Saved data was malformed and has been reset.' }
    }

    const expenses = parsed.filter(isExpense)
    if (expenses.length !== parsed.length) {
      return {
        ok: false,
        expenses,
        error: `Skipped ${parsed.length - expenses.length} unreadable record(s).`,
      }
    }

    return { ok: true, expenses }
  } catch {
    discard()
    return { ok: false, expenses: [], error: 'Saved data was corrupt and has been reset.' }
  }
}

/**
 * Drop unreadable data so the "has been reset" message is actually true. The
 * provider skips its first save (it would just echo back what it loaded), so
 * without this the bad value survives every reload.
 *
 * Only used when the whole payload is unparseable — there is nothing to
 * recover. When individual records are invalid the survivors are kept and get
 * written back on the next change.
 */
function discard(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing more we can do; the in-memory state is still correct.
  }
}

/** Returns an error message on failure, or null on success. */
export function saveExpenses(expenses: Expense[]): string | null {
  if (typeof window === 'undefined') return null

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses))
    return null
  } catch (err) {
    const quotaExceeded =
      err instanceof DOMException &&
      (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    return quotaExceeded
      ? 'Storage is full — this change was not saved.'
      : 'Could not save your changes.'
  }
}
