import { describe, it, expect, vi, afterEach } from 'vitest'
import { colorTint, colorBorder, formatDate, isOverdue, isDueSoon } from './utils'

describe('colorTint', () => {
  it('returns rgba with default opacity', () => {
    expect(colorTint('#378ADD')).toBe('rgba(55, 138, 221, 0.12)')
  })

  it('accepts custom opacity', () => {
    expect(colorTint('#000000', 0.5)).toBe('rgba(0, 0, 0, 0.5)')
  })
})

describe('colorBorder', () => {
  it('delegates to colorTint with 0.3 opacity', () => {
    expect(colorBorder('#ffffff')).toBe(colorTint('#ffffff', 0.3))
  })
})

describe('formatDate', () => {
  it('formats a date string in en-GB short form', () => {
    expect(formatDate('2026-01-15')).toMatch(/15 Jan/)
  })
})

describe('isOverdue', () => {
  afterEach(() => vi.useRealTimers())

  it('returns true for a past date', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-24'))
    expect(isOverdue('2026-05-01')).toBe(true)
  })

  it('returns false for a future date', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-24'))
    expect(isOverdue('2026-12-31')).toBe(false)
  })
})

describe('isDueSoon', () => {
  afterEach(() => vi.useRealTimers())

  it('returns true when due within the default 7 days', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-24'))
    expect(isDueSoon('2026-05-28')).toBe(true)
  })

  it('returns false when due beyond the window', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-24'))
    expect(isDueSoon('2026-06-30')).toBe(false)
  })

  it('returns false for a past date', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-24'))
    expect(isDueSoon('2026-05-01')).toBe(false)
  })
})
