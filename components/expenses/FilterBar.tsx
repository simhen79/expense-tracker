'use client'

import { Button } from '@/components/ui/Button'
import { Field, SelectInput, TextInput } from '@/components/ui/Field'
import { EMPTY_FILTERS, hasActiveFilters, type Filters } from '@/lib/analytics'
import { CATEGORIES } from '@/lib/types'

interface FilterBarProps {
  filters: Filters
  onChange: (filters: Filters) => void
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  function set<K extends keyof Filters>(key: K, value: Filters[K]) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-card ring-1 ring-slate-900/5 sm:p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field id="search" label="Search">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="9" cy="9" r="5.25" stroke="currentColor" strokeWidth="1.6" />
                <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
            <TextInput
              id="search"
              type="search"
              placeholder="Description or category"
              className="pl-9"
              value={filters.search}
              onChange={(e) => set('search', e.target.value)}
            />
          </div>
        </Field>

        <Field id="filter-category" label="Category">
          <SelectInput
            id="filter-category"
            value={filters.category}
            onChange={(e) => set('category', e.target.value as Filters['category'])}
          >
            <option value="All">All categories</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </SelectInput>
        </Field>

        <Field id="from" label="From">
          <TextInput
            id="from"
            type="date"
            // Bounding each input by the other makes an impossible range
            // unpickable rather than merely empty-resulting.
            max={filters.to || undefined}
            value={filters.from}
            onChange={(e) => set('from', e.target.value)}
          />
        </Field>

        <Field id="to" label="To">
          <TextInput
            id="to"
            type="date"
            min={filters.from || undefined}
            value={filters.to}
            onChange={(e) => set('to', e.target.value)}
          />
        </Field>
      </div>

      {hasActiveFilters(filters) ? (
        <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">
          <Button variant="ghost" size="sm" onClick={() => onChange(EMPTY_FILTERS)}>
            Clear filters
          </Button>
        </div>
      ) : null}
    </div>
  )
}
