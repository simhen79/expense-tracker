import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ExpenseModal } from '@/components/expenses/ExpenseModal'
import { Header } from '@/components/layout/Header'
import { ExpenseProvider } from '@/components/providers/ExpenseProvider'
import { ToastProvider } from '@/components/providers/ToastProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Expensa — Expense Tracker',
  description: 'Track spending, spot patterns, and stay on top of your money.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        {/* ToastProvider wraps ExpenseProvider because the expense store
            reports storage failures through notify(). */}
        <ToastProvider>
          <ExpenseProvider>
            <Header />
            <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
            <ExpenseModal />
          </ExpenseProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
