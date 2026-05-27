import { describe, it, expect } from 'vitest'
import { colorTint, colorBorder, formatDate, isOverdue, isDueSoon } from '../utils'

describe('colorTint', () => {
  it('produces rgba with correct channels for red', () => {
    expect(colorTint('#ff0000', 0.5)).toBe('rgba(255, 0, 0, 0.5)')
  })

  it('uses default opacity of 0.12', () => {
    expect(colorTint('#0080ff')).toBe('rgba(0, 128, 255, 0.12)')
  })

  it('produces transparent output at opacity 0', () => {
    expect(colorTint('#123456', 0)).toBe('rgba(18, 52, 86, 0)')
  })
})

describe('colorBorder', () => {
  it('delegates to colorTint with given opacity', () => {
    expect(colorBorder('#aabbcc', 0.3)).toBe(colorTint('#aabbcc', 0.3))
  })

  it('uses default opacity of 0.3', () => {
    expect(colorBorder('#ffffff')).toBe(colorTint('#ffffff', 0.3))
  })
})

describe('formatDate', () => {
  it('formats an ISO date to "day Month" format', () => {
    const result = formatDate('2026-05-12')
    expect(result).toMatch(/12/)
    expect(result.toLowerCase()).toMatch(/may/)
  })

  it('handles month boundary correctly', () => {
    const result = formatDate('2026-01-01')
    expect(result).toMatch(/1/)
    expect(result.toLowerCase()).toMatch(/jan/)
  })

  it('formats the last day of a month', () => {
    const result = formatDate('2026-03-31')
    expect(result).toMatch(/31/)
    expect(result.toLowerCase()).toMatch(/mar/)
  })
})

describe('isOverdue', () => {
  it('returns true for a past date', () => {
    expect(isOverdue('2020-01-01')).toBe(true)
  })

  it('returns false for a future date', () => {
    const future = new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0]
    expect(isOverdue(future)).toBe(false)
  })
})

describe('isDueSoon', () => {
  it('returns true for a date within the default 7-day window', () => {
    const soon = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
    expect(isDueSoon(soon)).toBe(true)
  })

  it('returns false for a date beyond the window', () => {
    const far = new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0]
    expect(isDueSoon(far)).toBe(false)
  })

  it('returns false for an already past date', () => {
    expect(isDueSoon('2020-01-01')).toBe(false)
  })
})
