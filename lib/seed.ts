import type { Category, Expense } from './types'
import { toISODate } from './format'

interface Template {
  category: Category
  description: string
  /** Inclusive rand range, in cents. */
  min: number
  max: number
  /** Rough occurrences per month. */
  frequency: number
}

/**
 * Deliberately includes descriptions with a comma, a double quote, an em dash
 * and a non-ASCII word. Those are the four things that break a naive CSV
 * writer or a PDF text encoder, so the sample data exercises them by default
 * rather than waiting for a real user to find them.
 */
const TEMPLATES: Template[] = [
  { category: 'Food', description: 'Woolworths groceries', min: 24000, max: 96000, frequency: 4 },
  { category: 'Food', description: 'Lunch, then coffee', min: 4500, max: 18000, frequency: 6 },
  { category: 'Food', description: 'Dinner at "The Test Kitchen"', min: 45000, max: 120000, frequency: 1 },
  { category: 'Food', description: 'Sushi — Yamato', min: 18000, max: 42000, frequency: 1 },
  { category: 'Transportation', description: 'Uber to the office', min: 6500, max: 21000, frequency: 5 },
  { category: 'Transportation', description: 'Petrol', min: 65000, max: 125000, frequency: 2 },
  { category: 'Transportation', description: 'Gautrain top-up', min: 15000, max: 30000, frequency: 1 },
  { category: 'Entertainment', description: 'Netflix', min: 19900, max: 19900, frequency: 1 },
  { category: 'Entertainment', description: 'Cinema tickets', min: 12000, max: 28000, frequency: 1 },
  { category: 'Entertainment', description: 'Concert — Kirstenbosch', min: 35000, max: 75000, frequency: 1 },
  { category: 'Shopping', description: 'Takealot order', min: 15000, max: 180000, frequency: 2 },
  { category: 'Shopping', description: 'Running shoes', min: 120000, max: 260000, frequency: 1 },
  { category: 'Bills', description: 'Rent', min: 1200000, max: 1200000, frequency: 1 },
  { category: 'Bills', description: 'Electricity prepaid', min: 45000, max: 140000, frequency: 1 },
  { category: 'Bills', description: 'Fibre — 100Mbps uncapped', min: 89900, max: 89900, frequency: 1 },
  { category: 'Bills', description: 'Medical aid', min: 210000, max: 210000, frequency: 1 },
  { category: 'Other', description: 'Gift for Thandi', min: 20000, max: 90000, frequency: 1 },
  { category: 'Other', description: 'Vet visit', min: 55000, max: 190000, frequency: 1 },
]

/**
 * mulberry32 — a tiny deterministic PRNG. Math.random() would make every seed
 * produce different data, which turns "does the export look right?" into a
 * moving target and makes snapshot-style assertions impossible.
 */
function rng(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface SeedOptions {
  /** Newest month in the data. Defaults to the month of `today`. */
  today?: Date
  /** How many months back to generate, including the current one. */
  months?: number
  seed?: number
}

/**
 * Realistic-looking expenses spread over the last few months, newest first.
 * Same inputs always produce the same output, ids included.
 */
export function generateSampleExpenses(options: SeedOptions = {}): Expense[] {
  const { today = new Date(), months = 6, seed = 20260808 } = options
  const random = rng(seed)
  const expenses: Expense[] = []

  for (let back = months - 1; back >= 0; back--) {
    const anchor = new Date(today.getFullYear(), today.getMonth() - back, 1)
    const daysInMonth = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate()
    // The current month is only partly elapsed — generating spend on future
    // dates would make the dashboard's trend line dip for no reason.
    const lastDay = back === 0 ? today.getDate() : daysInMonth

    for (const template of TEMPLATES) {
      const occurrences = Math.max(1, Math.round(template.frequency * (0.6 + random() * 0.8)))

      for (let i = 0; i < occurrences; i++) {
        const day = 1 + Math.floor(random() * lastDay)
        const spread = template.max - template.min
        const cents = template.min + Math.round(random() * spread)

        expenses.push({
          id: `seed-${expenses.length.toString().padStart(4, '0')}`,
          amountCents: Math.round(cents / 100) * 100,
          date: toISODate(new Date(anchor.getFullYear(), anchor.getMonth(), day)),
          category: template.category,
          description: template.description,
          createdAt: anchor.getTime() + expenses.length,
        })
      }
    }
  }

  return expenses.sort((a, b) => (a.date === b.date ? b.createdAt - a.createdAt : a.date < b.date ? 1 : -1))
}
