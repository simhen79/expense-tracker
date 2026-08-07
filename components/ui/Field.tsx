'use client'

import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

const CONTROL =
  'w-full rounded-lg bg-white px-3 text-sm text-slate-900 shadow-sm ring-1 ring-inset ' +
  'placeholder:text-slate-400 transition-shadow focus:ring-2 focus:ring-inset'

const OK = 'ring-slate-300 focus:ring-brand-600'
const BAD = 'ring-red-400 focus:ring-red-600'

interface FieldWrapperProps {
  id: string
  label: string
  error?: string
  hint?: string
  children: React.ReactNode
}

export function Field({ id, label, error, hint, children }: FieldWrapperProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error ? (
        // role="alert" so screen readers announce the message when it appears.
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  )
}

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { invalid, className, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid && props.id ? `${props.id}-error` : undefined}
      className={cn(CONTROL, 'h-10', invalid ? BAD : OK, className)}
      {...props}
    />
  )
})

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean
}

export const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(function SelectInput(
  { invalid, className, children, ...props },
  ref
) {
  return (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(CONTROL, 'h-10 appearance-none pr-9', invalid ? BAD : OK, className)}
      style={{
        // Inline chevron as a data URI keeps the select styleable without an
        // extra wrapper element or an icon dependency.
        backgroundImage:
          "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
        backgroundPosition: 'right 0.5rem center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '1.25rem 1.25rem',
      }}
      {...props}
    >
      {children}
    </select>
  )
})
