import type { Category } from './types'

interface CategoryStyle {
  /** Hex, for Recharts fills which can't read Tailwind classes. */
  hex: string
  /** Tailwind classes for badges. */
  badge: string
  /** Tailwind class for small solid swatches (legends, dots). */
  dot: string
}

/**
 * One colour per category, reused everywhere. A category's colour means the
 * same thing in a badge, a donut slice and a legend — that consistency is what
 * lets someone read the dashboard without checking the legend every time.
 */
export const CATEGORY_STYLES: Record<Category, CategoryStyle> = {
  Food: {
    hex: '#f59e0b',
    badge: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    dot: 'bg-amber-500',
  },
  Transportation: {
    hex: '#14b8a6',
    badge: 'bg-teal-50 text-teal-700 ring-teal-600/20',
    dot: 'bg-teal-500',
  },
  Entertainment: {
    hex: '#8b5cf6',
    badge: 'bg-violet-50 text-violet-700 ring-violet-600/20',
    dot: 'bg-violet-500',
  },
  Shopping: {
    hex: '#ec4899',
    badge: 'bg-pink-50 text-pink-700 ring-pink-600/20',
    dot: 'bg-pink-500',
  },
  Bills: {
    hex: '#3b82f6',
    badge: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    dot: 'bg-blue-500',
  },
  Other: {
    hex: '#64748b',
    badge: 'bg-slate-100 text-slate-700 ring-slate-500/20',
    dot: 'bg-slate-500',
  },
}
