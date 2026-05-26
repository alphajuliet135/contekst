'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Todo, DateEvent } from '@/lib/types'
import { colorTint, colorBorder } from '@/lib/utils'
import { CountPill } from './CountPill'

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"

const BADGE_BASE: React.CSSProperties = {
  borderRadius: 5, padding: '1px 7px', fontSize: 11, fontWeight: 500,
  flexShrink: 0, whiteSpace: 'nowrap',
}
const BADGE = {
  high:   { background: 'rgba(212,136,58,0.18)',  color: '#d4883a', border: '1px solid rgba(212,136,58,0.25)' },
  medium: { background: 'rgba(143,143,143,0.15)', color: '#8F8F8F', border: '1px solid rgba(143,143,143,0.2)' },
  low:    { background: 'rgba(100,100,100,0.12)', color: '#6B6B6B', border: '1px solid rgba(100,100,100,0.15)' },
}

interface Props {
  todos: Todo[]
  dates: DateEvent[]
  color: string
  contextId: string
  in30days: string
}

interface AheadItem {
  kind: 'todo' | 'date'
  id: string
  day: string
  title: string
  subtitle: string | null
  priority?: 'high' | 'medium' | 'low'
  highlight: boolean
}

export function MacroAhead({ todos, dates: initialDates, color, contextId, in30days }: Props) {
  const router = useRouter()
  const [localDates, setLocalDates] = useState(initialDates)
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState('')
  const titleRef = useRef<HTMLInputElement>(null)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => { setLocalDates(initialDates) }, [initialDates])
  useEffect(() => {
    if (adding) titleRef.current?.focus()
  }, [adding])

  // Merge todos+dates into sorted ahead items
  const aheadItems: AheadItem[] = []
  let firstDateHighlighted = false

  for (const d of localDates) {
    if (d.date >= today && d.date <= in30days) {
      const isFirst = !firstDateHighlighted
      if (isFirst) firstDateHighlighted = true
      aheadItems.push({
        kind: 'date', id: d.id, day: d.date,
        title: d.title, subtitle: d.note ?? null,
        highlight: isFirst,
      })
    }
  }
  for (const t of todos) {
    if (t.dueDate && t.dueDate >= today && t.dueDate <= in30days) {
      aheadItems.push({
        kind: 'todo', id: t.id, day: t.dueDate,
        title: t.title, subtitle: null,
        priority: t.priority, highlight: false,
      })
    }
  }
  aheadItems.sort((a, b) => a.day.localeCompare(b.day))

  function formatDay(dateStr: string) {
    const [y, mo, dy] = dateStr.split('-').map(Number)
    const dt = new Date(y, mo - 1, dy)
    const wd = dt.toLocaleDateString('en-GB', { weekday: 'short' })
    const todayMonth = new Date(today).getMonth()
    const monthChanged = dt.getMonth() !== todayMonth
    if (monthChanged) {
      const mon = dt.toLocaleDateString('en-GB', { month: 'short' })
      return `${wd} ${String(dy).padStart(2, ' ')} ${mon}`
    }
    return `${wd} ${dy}`
  }

  async function markDone(id: string) {
    await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: true, completedAt: new Date().toISOString() }),
    })
    router.refresh()
  }

  async function addDate() {
    const title = newTitle.trim()
    const date = newDate
    if (!title || !date) return
    const tempId = `temp-${Date.now()}`
    setLocalDates(prev => [...prev, {
      id: tempId, contextId, userId: '', title, date,
      note: null, pinned: false,
    }])
    setNewTitle('')
    setNewDate('')
    setAdding(false)
    const res = await fetch('/api/dates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contextId, title, date }),
    })
    if (res.ok) {
      const created = await res.json()
      setLocalDates(prev => prev.map(d => d.id === tempId ? created : d))
    } else {
      setLocalDates(prev => prev.filter(d => d.id !== tempId))
    }
    router.refresh()
  }

  return (
    <div style={{
      background: 'hsl(var(--card))',
      border: '0.5px solid hsl(var(--border))',
      borderRadius: 12, overflow: 'hidden',
      boxShadow: '0 1px 2px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 18px', borderBottom: '0.5px solid hsl(var(--border))', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0, letterSpacing: -0.1 }}>Ahead</h2>
          <CountPill count={aheadItems.length} color={color} />
          <span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>Next 30 days</span>
        </div>
        <button
          title="Add date"
          onClick={() => setAdding(v => !v)}
          style={{ fontSize: 12, color, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, padding: 0 }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>

      {/* Rows */}
      <div>
        {aheadItems.length === 0 && !adding ? (
          <div style={{ padding: '14px 18px', fontSize: 13, color: 'hsl(var(--muted-foreground))' }}>
            Nothing in the next 30 days.
          </div>
        ) : (
          aheadItems.map((item, i) => (
            <div key={item.id} style={{
              display: 'grid', gridTemplateColumns: '102px 1fr',
              padding: '11px 18px',
              borderTop: i > 0 ? '0.5px solid hsl(var(--muted))' : 'none',
              background: item.highlight ? colorTint(color, 0.05) : 'transparent',
            }}>
              <div style={{
                fontSize: 12, fontFamily: MONO, paddingTop: 2, whiteSpace: 'pre',
                color: item.highlight ? color : 'hsl(var(--muted-foreground))',
                fontWeight: item.highlight ? 500 : 400,
              }}>
                {formatDay(item.day)}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {item.kind === 'todo' ? (
                  <button
                    onClick={() => markDone(item.id)}
                    style={{
                      width: 13, height: 13, borderRadius: '50%', flexShrink: 0,
                      border: `1.5px solid ${color}`, background: 'none', cursor: 'pointer', padding: 0,
                    }}
                  />
                ) : (
                  <span style={{
                    width: 13, height: 13, borderRadius: 3, flexShrink: 0, display: 'inline-block',
                    background: colorTint(color, 0.18),
                    border: `0.5px solid ${colorBorder(color, 0.35)}`,
                  }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, lineHeight: 1.3, fontWeight: item.highlight ? 500 : 400 }}>
                    {item.title}
                  </div>
                  {item.subtitle && (
                    <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', marginTop: 1 }}>
                      {item.subtitle}
                    </div>
                  )}
                </div>
                {item.priority && (
                  <span style={{ ...BADGE_BASE, ...BADGE[item.priority] }}>
                    {item.priority === 'high' ? 'High' : item.priority === 'medium' ? 'Med' : 'Low'}
                  </span>
                )}
              </div>
            </div>
          ))
        )}

        {/* Inline add form */}
        {adding && (
          <div style={{ padding: '10px 18px', borderTop: aheadItems.length > 0 ? '0.5px solid hsl(var(--muted))' : 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="date"
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              style={{
                background: 'hsl(var(--muted))', border: 'none', borderRadius: 5,
                padding: '4px 8px', fontSize: 12, color: 'hsl(var(--foreground))',
                outline: 'none', fontFamily: MONO,
              }}
            />
            <input
              ref={titleRef}
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addDate(); if (e.key === 'Escape') { setAdding(false); setNewTitle(''); setNewDate('') } }}
              placeholder="Event title…"
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                fontSize: 13, color: 'hsl(var(--foreground))', fontFamily: 'inherit',
              }}
            />
            <button
              onClick={addDate}
              style={{ padding: '3px 10px', borderRadius: 5, border: 'none', background: color, color: 'white', fontSize: 11, cursor: 'pointer' }}
            >
              Add
            </button>
            <button
              onClick={() => { setAdding(false); setNewTitle(''); setNewDate('') }}
              style={{ padding: '3px 8px', borderRadius: 5, border: '0.5px solid hsl(var(--border))', background: 'none', color: 'hsl(var(--muted-foreground))', fontSize: 11, cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
