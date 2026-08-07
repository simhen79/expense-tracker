import { parseAmountToCents } from './format'
import type { ExpenseDraft, ExpenseErrors } from './types'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/**
 * Validate a draft expense from the form.
 *
 * Returns a map of field name -> message. An empty object means valid; the
 * form component treats `Object.keys(errors).length === 0` as "safe to save"
 * and renders each message under its matching input.
 *
 * Structural checks (below) are non-negotiable: without them the app would
 * store NaN or an unparseable date. Policy checks are a product decision —
 * see the TODO.
 */
export function validateExpense(draft: ExpenseDraft): ExpenseErrors {
  const errors: ExpenseErrors = {}

  // --- Structural: the data must be storable at all. ---
  if (draft.amount.trim() === '') {
    errors.amount = 'Amount is required'
  } else {
    const cents = parseAmountToCents(draft.amount)
    if (cents === null) {
      errors.amount = 'Enter a valid number'
    } else if (cents <= 0) {
      errors.amount = 'Amount must be greater than zero'
    }
  }

  if (draft.date.trim() === '') {
    errors.date = 'Date is required'
  } else if (!ISO_DATE.test(draft.date)) {
    errors.date = 'Enter a valid date'
  }

  // --- Policy: your call. ---
  // TODO(you): add the rules that define how this app behaves for real input.
  // Three decisions, roughly 8 lines total:
  //
  //   1. Future dates — reject them as typos, or allow them so a booked
  //      flight can be logged before the trip? If rejecting, compare against
  //      todayISO() from './format' (already safe for local timezones).
  //   2. Description — required, or optional so a quick $3 coffee can be
  //      logged in two taps? If required, also consider a max length so the
  //      table layout doesn't break.
  //   3. Upper bound on a single amount — a sanity ceiling catches a mistyped
  //      "500000" meant as "5000.00", but a hard cap frustrates anyone
  //      logging rent or a car payment.
  //
  // Write to `errors.date`, `errors.description`, `errors.amount`. Message
  // strings are shown verbatim to the user.

  return errors
}
