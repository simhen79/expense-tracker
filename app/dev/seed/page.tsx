import { notFound } from 'next/navigation'
import { SeedControls } from '@/components/dev/SeedControls'

/**
 * A development-only utility for filling the store with realistic data. Testing
 * an export dialog needs volume, several months and awkward characters — typing
 * that by hand every time is not a reasonable ask.
 *
 * The 404 in production is deliberate: nothing here should ship to a real user,
 * and a route that silently wipes localStorage is not something to leave lying
 * around behind a hidden URL.
 */
export default function SeedPage() {
  if (process.env.NODE_ENV === 'production') notFound()

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">Sample data</h1>
        <p className="mt-1 text-sm text-slate-500">
          Development only. Replaces everything currently in local storage.
        </p>
      </div>
      <SeedControls />
    </div>
  )
}
