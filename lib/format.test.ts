import { describe, expect, it } from 'vitest'
import {
  centsToInput,
  formatDate,
  formatMoney,
  parseAmountToCents,
  percentChange,
  toISODate,
} from './format'

// en-ZA groups with U+00A0, not a regular space.
const NBSP = ' '

describe('formatMoney', () => {
  it('formats cents as rands with separators', () => {
    expect(formatMoney(123456)).toBe(`R${NBSP}1${NBSP}234,56`)
    expect(formatMoney(0)).toBe(`R${NBSP}0,00`)
    expect(formatMoney(5)).toBe(`R${NBSP}0,05`)
  })
})

describe('parseAmountToCents', () => {
  it('parses plain and decimal input', () => {
    expect(parseAmountToCents('12')).toBe(1200)
    expect(parseAmountToCents('12.5')).toBe(1250)
    expect(parseAmountToCents('12.34')).toBe(1234)
  })

  it('reads a trailing comma group as the decimal separator', () => {
    // Stripping this as grouping would return 425000 — a 100x error.
    expect(parseAmountToCents('42,50')).toBe(4250)
    expect(parseAmountToCents('42,5')).toBe(4250)
    expect(parseAmountToCents('1 234,56')).toBe(123456)
  })

  it('still treats a comma before three digits as grouping', () => {
    expect(parseAmountToCents('1,234')).toBe(123400)
    expect(parseAmountToCents('1,234.56')).toBe(123456)
  })

  it('round-trips its own formatted output', () => {
    expect(parseAmountToCents(formatMoney(123456))).toBe(123456)
    expect(parseAmountToCents(formatMoney(5))).toBe(5)
  })

  it('tolerates the currency symbol and spaces', () => {
    expect(parseAmountToCents('R1 234,56')).toBe(123456)
    expect(parseAmountToCents(' 42 ')).toBe(4200)
  })

  it('rounds rather than truncating', () => {
    // Naive Math.floor(19.99 * 100) yields 1998 because of float representation.
    expect(parseAmountToCents('19.99')).toBe(1999)
    expect(parseAmountToCents('0.1')).toBe(10)
  })

  it('rejects non-numeric input', () => {
    expect(parseAmountToCents('')).toBeNull()
    expect(parseAmountToCents('abc')).toBeNull()
    expect(parseAmountToCents('1.2.3')).toBeNull()
    expect(parseAmountToCents('-5')).toBeNull()
  })
})

describe('centsToInput', () => {
  it('round-trips through parseAmountToCents', () => {
    expect(parseAmountToCents(centsToInput(1999))).toBe(1999)
    expect(centsToInput(500)).toBe('5.00')
  })
})

describe('formatDate', () => {
  it('renders the same calendar day it was given', () => {
    // The bug this guards: new Date('2026-08-07') is UTC midnight, which is
    // Aug 6 in any negative-offset timezone.
    expect(formatDate('2026-08-07')).toBe('Aug 7, 2026')
    expect(formatDate('2026-01-01')).toBe('Jan 1, 2026')
  })
})

describe('toISODate', () => {
  it('zero-pads month and day', () => {
    expect(toISODate(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('percentChange', () => {
  it('computes signed change', () => {
    expect(percentChange(150, 100)).toBe(50)
    expect(percentChange(50, 100)).toBe(-50)
  })

  it('returns null when there is no baseline', () => {
    expect(percentChange(100, 0)).toBeNull()
  })
})
