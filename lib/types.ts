export const CATEGORIES = [
  'Food',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Bills',
  'Other',
] as const

export type Category = (typeof CATEGORIES)[number]

export interface Expense {
  id: string
  /** Integer cents. Never a float — summing floats drifts. */
  amountCents: number
  /** 'YYYY-MM-DD' in the user's local calendar. */
  date: string
  category: Category
  description: string
  /** Epoch ms. Tiebreaker when two expenses share a date. */
  createdAt: number
}

/** The shape the form works with: raw strings straight from the inputs. */
export interface ExpenseDraft {
  amount: string
  date: string
  category: Category
  description: string
}

export type ExpenseErrors = Partial<Record<keyof ExpenseDraft, string>>
