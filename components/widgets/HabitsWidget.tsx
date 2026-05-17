'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Repeat2, Plus, Check, Trash2 } from 'lucide-react'
import type { Habit, HabitLog } from '@/lib/types'
import { colorTint } from '@/lib/utils'

type Frequency = 'daily' | 'weekly'

interface HabitItem {
  id: string
  title: string
  frequency: Frequency
}

interface Props {
  habits: Habit[]
  logs: HabitLog[]
  color: string
  contextId: string
}

export function HabitsWidget({ habits, logs, color, contextId }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [items, setItems] = useState<HabitItem[]>(
    habits.map(h => ({ id: h.id, title: h.title, frequency: h.frequency as Frequency }))
  )
  const [completedIds, setCompletedIds] = useState<Set<string>>(
    () => new Set(logs.filter(l => l.completed).map(l => l.habitId))
  )
  const [showForm, setShowForm]         = useState(false)
  const [newTitle, setNewTitle]         = useState('')
  const [newFrequency, setNewFrequency] = useState<Frequency>('daily')
  const [submitting, setSubmitting]     = useState(false)

  useEffect(() => {
    setItems(habits.map(h => ({ id: h.id, title: h.title, frequency: h.frequency as Frequency })))
    setCompletedIds(new Set(logs.filter(l => l.completed).map(l => l.habitId)))
  }, [habits, logs])

  useEffect(() => { if (showForm) inputRef.current?.focus() }, [showForm])

  // ── Toggle completion ──────────────────────────────────────────────────────

  async function toggleHabit(habitId: string) {
    const isNowDone = !completedIds.has(habitId)
    setCompletedIds(prev => {
      const next = new Set(prev)
      if (isNowDone) next.add(habitId)
      else next.delete(habitId)
      return next
    })
    const today = new Date().toISOString().split('T')[0]
    await fetch(`/api/habits/${habitId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: today, completed: isNowDone }),
    })
    router.refresh()
  }

  // ── Add habit ──────────────────────────────────────────────────────────────

  async function handleAdd() {
    const title = newTitle.trim()
    if (!title || submitting) return
    setSubmitting(true)
    const tempId = `temp-${Date.now()}`
    setItems(prev => [...prev, { id: tempId, title, frequency: newFrequency }])
    setShowForm(false); setNewTitle(''); setNewFrequency('daily'); setSubmitting(false)
    await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contextId, title, frequency: newFrequency }),
    })
    router.refresh()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleAdd()
    if (e.key === 'Escape') { setShowForm(false); setNewTitle(''); setNewFrequency('daily') }
  }

  // ── Delete habit ───────────────────────────────────────────────────────────

  async function deleteHabit(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    setItems(prev => prev.filter(h => h.id !== id))
    setCompletedIds(prev => { const next = new Set(prev); next.delete(id); return next })
    if (!id.startsWith('temp-')) {
      await fetch(`/api/habits/${id}`, { method: 'DELETE' })
      router.refresh()
    }
  }

  const completedCount = items.filter(h => completedIds.has(h.id)).length

  return (
    <div className="card-shadow" style={{
      background: 'hsl(var(--card))',
      border: '0.5px solid hsl(var(--border))',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '0.5px solid hsl(var(--border))',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <Repeat2 size={14} strokeWidth={1.5} style={{ color }} />
        <span style={{ fontSize: 13, fontWeight: 500 }}>Habits</span>
        {items.length > 0 && (
          <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>
            {completedCount}/{items.length} today
          </span>
        )}
        <button
          onClick={() => setShowForm(v => !v)}
          style={{
            marginLeft: 'auto', background: 'none', border: 'none',
            color: showForm ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
            fontSize: 12, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 3, padding: '2px 4px',
          }}
        >
          <Plus size={11} strokeWidth={2} />
          Add
        </button>
      </div>

      {/* Body */}
      {items.length === 0 && !showForm ? (
        <div style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))' }}>No habits yet</span>
        </div>
      ) : (
        <div style={{ padding: '6px 0 0' }}>
          {items.map(habit => {
            const done = completedIds.has(habit.id)
            return (
              <div key={habit.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '7px 16px',
                position: 'relative',
              }}>
                {/* Completion circle */}
                <span
                  onClick={() => toggleHabit(habit.id)}
                  style={{
                    width: 16, height: 16, borderRadius: '50%',
                    border: `1.5px solid ${done ? color : 'hsl(var(--border))'}`,
                    background: done ? colorTint(color, 0.2) : 'transparent',
                    flexShrink: 0, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 120ms, border 120ms',
                  }}
                >
                  {done && <Check size={9} strokeWidth={3} style={{ color }} />}
                </span>

                <span style={{
                  fontSize: 13, flex: 1,
                  color: done ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))',
                }}>
                  {habit.title}
                </span>

                <span style={{
                  fontSize: 11, color: 'hsl(var(--muted-foreground))',
                  padding: '2px 6px', background: 'hsl(var(--muted))', borderRadius: 4,
                }}>
                  {habit.frequency}
                </span>

                <button
                  onClick={e => deleteHabit(e, habit.id)}
                  style={{
                    background: 'none', border: 'none', padding: 3,
                    color: 'hsl(var(--muted-foreground))',
                    cursor: 'pointer', borderRadius: 4,
                    display: 'flex', alignItems: 'center',
                    opacity: 0.4,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.4' }}
                >
                  <Trash2 size={11} strokeWidth={1.5} />
                </button>
              </div>
            )
          })}

          {/* Inline add form */}
          {showForm && (
            <div style={{
              padding: '10px 16px 12px',
              borderTop: items.length > 0 ? '0.5px solid hsl(var(--border))' : 'none',
            }}>
              <input
                ref={inputRef}
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Habit name…"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'none', border: 'none', outline: 'none',
                  fontSize: 13, color: 'hsl(var(--foreground))',
                  padding: '0 0 8px',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Frequency segmented control */}
                <div style={{
                  display: 'flex',
                  background: 'hsl(var(--muted))',
                  borderRadius: 6, padding: 2,
                }}>
                  {(['daily', 'weekly'] as Frequency[]).map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setNewFrequency(f)}
                      style={{
                        padding: '3px 10px', borderRadius: 4, border: 'none',
                        background: newFrequency === f ? 'hsl(var(--card))' : 'transparent',
                        color: newFrequency === f ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                        fontSize: 12, fontWeight: newFrequency === f ? 500 : 400,
                        cursor: 'pointer',
                        boxShadow: newFrequency === f ? '0 1px 2px rgba(0,0,0,0.25)' : 'none',
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setNewTitle(''); setNewFrequency('daily') }}
                    style={{
                      background: 'none', border: 'none', fontSize: 12,
                      color: 'hsl(var(--muted-foreground))', cursor: 'pointer', padding: '2px 4px',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAdd}
                    disabled={!newTitle.trim() || submitting}
                    style={{
                      border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 500,
                      padding: '4px 12px',
                      background: newTitle.trim() ? color : 'hsl(var(--muted))',
                      color: newTitle.trim() ? 'white' : 'hsl(var(--muted-foreground))',
                      cursor: newTitle.trim() ? 'pointer' : 'default',
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
