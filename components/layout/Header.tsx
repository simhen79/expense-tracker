'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useExpenses } from '@/components/providers/ExpenseProvider'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

const NAV = [
  { href: '/', label: 'Dashboard' },
  { href: '/expenses', label: 'Expenses' },
]

export function Header() {
  const pathname = usePathname()
  const { openAdd } = useExpenses()

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 rounded-lg">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M3 7.5A2.5 2.5 0 015.5 5h13A2.5 2.5 0 0121 7.5v9a2.5 2.5 0 01-2.5 2.5h-13A2.5 2.5 0 013 16.5v-9z"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path d="M16.5 12h1.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </span>
          {/* The wordmark is the first thing to go on narrow screens — the
              logo, both nav links and the add button together overflow 390px
              and push the page into horizontal scroll. */}
          <span className="hidden text-base font-semibold tracking-tight text-slate-900 sm:inline">
            Expensa
          </span>
        </Link>

        <nav className="ml-2 flex items-center gap-1 sm:ml-6">
          {NAV.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto">
          <Button onClick={openAdd}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="hidden sm:inline">Add Expense</span>
            <span className="sr-only sm:hidden">Add expense</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
