'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { sortByDateDesc } from '@/lib/analytics'
import { parseAmountToCents } from '@/lib/format'
import { loadExpenses, saveExpenses } from '@/lib/storage'
import type { Expense, ExpenseDraft } from '@/lib/types'
import { useToast } from './ToastProvider'

interface ExpenseContextValue {
  /** Newest first. */
  expenses: Expense[]
  /** False until localStorage has been read on the client. */
  loaded: boolean
  addExpense: (draft: ExpenseDraft) => void
  updateExpense: (id: string, draft: ExpenseDraft) => void
  deleteExpense: (id: string) => void
  /** null when adding, the target expense when editing. */
  editing: Expense | null
  modalOpen: boolean
  openAdd: () => void
  openEdit: (expense: Expense) => void
  closeModal: () => void
}

const ExpenseContext = createContext<ExpenseContextValue | null>(null)

export function useExpenses(): ExpenseContextValue {
  const ctx = useContext(ExpenseContext)
  if (!ctx) throw new Error('useExpenses must be used inside <ExpenseProvider>')
  return ctx
}

function draftToFields(draft: ExpenseDraft) {
  return {
    // Validation runs before this, so the parse cannot fail here.
    amountCents: parseAmountToCents(draft.amount) ?? 0,
    date: draft.date,
    category: draft.category,
    description: draft.description.trim(),
  }
}

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const { notify } = useToast()

  // Starts empty on both server and client so the first client render matches
  // the server HTML exactly. Real data arrives in the effect below, after
  // hydration has already succeeded.
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loaded, setLoaded] = useState(false)
  const [editing, setEditing] = useState<Expense | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    const result = loadExpenses()
    setExpenses(result.expenses)
    setLoaded(true)
    if (!result.ok) notify(result.error, 'error')
  }, [notify])

  // Skip the very first write: the load effect above sets state, and persisting
  // that same value back would be a pointless round-trip (and would overwrite
  // good data with an empty array if the load ever failed).
  const skipNextSave = useRef(true)

  useEffect(() => {
    if (!loaded) return
    if (skipNextSave.current) {
      skipNextSave.current = false
      return
    }
    const error = saveExpenses(expenses)
    if (error) notify(error, 'error')
  }, [expenses, loaded, notify])

  const addExpense = useCallback(
    (draft: ExpenseDraft) => {
      const expense: Expense = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        ...draftToFields(draft),
      }
      setExpenses((current) => [expense, ...current])
      notify('Expense added')
    },
    [notify]
  )

  const updateExpense = useCallback(
    (id: string, draft: ExpenseDraft) => {
      setExpenses((current) =>
        current.map((e) => (e.id === id ? { ...e, ...draftToFields(draft) } : e))
      )
      notify('Expense updated')
    },
    [notify]
  )

  const deleteExpense = useCallback(
    (id: string) => {
      setExpenses((current) => current.filter((e) => e.id !== id))
      notify('Expense deleted')
    },
    [notify]
  )

  const openAdd = useCallback(() => {
    setEditing(null)
    setModalOpen(true)
  }, [])

  const openEdit = useCallback((expense: Expense) => {
    setEditing(expense)
    setModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setModalOpen(false)
    setEditing(null)
  }, [])

  const sorted = useMemo(() => sortByDateDesc(expenses), [expenses])

  const value = useMemo(
    () => ({
      expenses: sorted,
      loaded,
      addExpense,
      updateExpense,
      deleteExpense,
      editing,
      modalOpen,
      openAdd,
      openEdit,
      closeModal,
    }),
    [
      sorted,
      loaded,
      addExpense,
      updateExpense,
      deleteExpense,
      editing,
      modalOpen,
      openAdd,
      openEdit,
      closeModal,
    ]
  )

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
}
