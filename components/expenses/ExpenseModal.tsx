'use client'

import { useExpenses } from '@/components/providers/ExpenseProvider'
import { Modal } from '@/components/ui/Modal'
import type { ExpenseDraft } from '@/lib/types'
import { ExpenseForm } from './ExpenseForm'

/**
 * Single instance mounted in the layout. Both "+ Add Expense" in the header and
 * the edit action on a row drive it through the provider, so add and edit share
 * one form and one set of validation rules.
 */
export function ExpenseModal() {
  const { modalOpen, editing, closeModal, addExpense, updateExpense } = useExpenses()

  function handleSubmit(draft: ExpenseDraft) {
    if (editing) {
      updateExpense(editing.id, draft)
    } else {
      addExpense(draft)
    }
    closeModal()
  }

  return (
    <Modal open={modalOpen} title={editing ? 'Edit expense' : 'Add expense'} onClose={closeModal}>
      {/* Remounting on target change resets useState in the form, so opening
          edit after add doesn't show the previous row's values. */}
      <ExpenseForm
        key={editing?.id ?? 'new'}
        initial={editing}
        onSubmit={handleSubmit}
        onCancel={closeModal}
      />
    </Modal>
  )
}
