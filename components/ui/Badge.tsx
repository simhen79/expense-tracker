import { CATEGORY_STYLES } from '@/lib/categories'
import { cn } from '@/lib/cn'
import type { Category } from '@/lib/types'

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        CATEGORY_STYLES[category].badge
      )}
    >
      {category}
    </span>
  )
}

export function CategoryDot({ category }: { category: Category }) {
  return (
    <span
      className={cn('inline-block h-2.5 w-2.5 shrink-0 rounded-full', CATEGORY_STYLES[category].dot)}
      aria-hidden="true"
    />
  )
}
