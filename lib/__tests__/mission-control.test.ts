import { describe, it, expect } from 'vitest'

// ── hasAny: logic mirrored from BriefingHero ────────────────────────────────

function hasAny(overdueCount: number, dueTodayCount: number, upcoming7dCount: number) {
  return overdueCount > 0 || dueTodayCount > 0 || upcoming7dCount > 0
}

describe('hasAny (BriefingHero)', () => {
  it('returns false when all counts are 0', () => {
    expect(hasAny(0, 0, 0)).toBe(false)
  })

  it('returns true when overdue count > 0', () => {
    expect(hasAny(1, 0, 0)).toBe(true)
  })

  it('returns true when due today count > 0', () => {
    expect(hasAny(0, 2, 0)).toBe(true)
  })

  it('returns true when upcoming7d count > 0', () => {
    expect(hasAny(0, 0, 5)).toBe(true)
  })
})

// ── allClear: logic mirrored from MicroPulse ────────────────────────────────

interface MicroCardData {
  id: string
  name: string
  color: string
  topTodo: string | null
  meta: string
  pulse: number[]
}

function allClear(micros: Pick<MicroCardData, 'topTodo'>[]) {
  return micros.every(m => m.topTodo === null)
}

describe('allClear (MicroPulse)', () => {
  it('returns true when no micros have a topTodo', () => {
    const micros = [
      { topTodo: null },
      { topTodo: null },
    ]
    expect(allClear(micros)).toBe(true)
  })

  it('returns false when at least one micro has a topTodo', () => {
    const micros = [
      { topTodo: null },
      { topTodo: 'Renew passport' },
    ]
    expect(allClear(micros)).toBe(false)
  })

  it('returns true for an empty list', () => {
    expect(allClear([])).toBe(true)
  })
})

// ── countAll: all-lists total counter (MacroPriorities) ──────────────────────

describe('priorities all-lists counter', () => {
  it('counts undone todos across all lists', () => {
    const todos = [
      { id: '1', done: false, listId: 'list-a' },
      { id: '2', done: false, listId: 'list-b' },
      { id: '3', done: true,  listId: 'list-a' },
      { id: '4', done: false, listId: null },
    ]
    const activeCount = todos.filter(t => !t.done).length
    expect(activeCount).toBe(3)
  })

  it('does not count done todos', () => {
    const todos = [
      { id: '1', done: true,  listId: 'list-a' },
      { id: '2', done: true,  listId: 'list-b' },
    ]
    expect(todos.filter(t => !t.done).length).toBe(0)
  })
})

// ── formatDay: always-month format (MacroAhead) ──────────────────────────────

function formatDay(dateStr: string) {
  const [y, mo, dy] = dateStr.split('-').map(Number)
  const dt = new Date(y, mo - 1, dy)
  const wd = dt.toLocaleDateString('en-GB', { weekday: 'short' })
  const mon = dt.toLocaleDateString('en-GB', { month: 'short' })
  return `${wd} ${String(dy).padStart(2, ' ')} ${mon}`
}

describe('formatDay (MacroAhead)', () => {
  it('always includes the month abbreviation', () => {
    const result = formatDay('2026-07-15')
    expect(result).toMatch(/Jul/)
  })

  it('always includes the month even in the current month', () => {
    const today = new Date()
    const y = today.getFullYear()
    const m = String(today.getMonth() + 1).padStart(2, '0')
    const result = formatDay(`${y}-${m}-05`)
    // Must contain a 3-letter month abbreviation
    expect(result).toMatch(/[A-Z][a-z]{2}/)
  })

  it('produces consistent-length strings regardless of month', () => {
    const jan = formatDay('2026-01-03')
    const nov = formatDay('2026-11-03')
    // Both should include weekday + padded day + month (same structure)
    expect(jan.split(' ').length).toBe(nov.split(' ').length)
  })
})
