import { Charts } from '@/components/dashboard/Charts'
import { RecentExpenses } from '@/components/dashboard/RecentExpenses'
import { SummaryCards } from '@/components/dashboard/SummaryCards'

export default function DashboardPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">An overview of where your money is going.</p>
      </div>

      <SummaryCards />
      <Charts />
      <RecentExpenses />
    </div>
  )
}
