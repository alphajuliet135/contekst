'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { MacroPriorities } from '@/components/macro/MacroPriorities'
import { MacroAhead } from '@/components/macro/MacroAhead'
import { MacroNotes } from '@/components/macro/MacroNotes'
import { ReferenceStrip } from '@/components/macro/ReferenceStrip'
import type { Todo, TodoList, DateEvent, Note, Habit, HabitLog, Link, Person } from '@/lib/types'

interface HabitWithStreak extends Habit { streak: number }

interface DashboardData {
  contextId: string
  contextColor: string
  todos: Todo[]
  todoLists: TodoList[]
  dates: DateEvent[]
  notes: Note[]
  habits: Habit[]
  habitLogs28d: HabitLog[]
  completedIn28d: { completedAt: string | null }[]
  links: Link[]
  people: Person[]
  mantraText: string | null
  sectionEnabled: Record<string, boolean>
}

interface Props {
  contextId: string
  contextName: string
  contextColor: string
  onClose: () => void
}

function computeStreak(habitId: string, logs: HabitLog[]): number {
  let s = 0
  for (let i = 0; i < 28; i++) {
    const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
    if (logs.some(l => l.habitId === habitId && l.date === d && l.completed)) s++
    else break
  }
  return s
}

export function MicroContextModal({ contextId, contextName, contextColor, onClose }: Props) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    fetch(`/api/contexts/${contextId}/dashboard`, { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error('Failed')
        return res.json()
      })
      .then((d: DashboardData) => { setData(d); setLoading(false) })
      .catch(err => {
        if (err.name === 'AbortError') return
        setError(true); setLoading(false)
      })
    return () => controller.abort()
  }, [contextId])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const in30days = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

  const habitsWithStreak: HabitWithStreak[] = data
    ? data.habits.map(h => ({ ...h, streak: computeStreak(h.id, data.habitLogs28d ?? []) }))
    : []

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0, 0, 0, 0.55)',
          zIndex: 200,
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '5vh', left: '50%', transform: 'translateX(-50%)',
        width: 'min(92vw, 1100px)',
        height: '88vh',
        zIndex: 201,
        background: 'hsl(var(--background))',
        border: '0.5px solid hsl(var(--border))',
        borderRadius: 16,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
      }}>
        {/* Modal header */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '0.5px solid hsl(var(--border))',
          display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: contextColor, flexShrink: 0 }} />
          <span style={{ fontSize: 15, fontWeight: 600, flex: 1 }}>{contextName}</span>
          <span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>Micro context</span>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'hsl(var(--muted-foreground))', display: 'flex', padding: 4,
              borderRadius: 6,
            }}
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {loading && (
            <div style={{ padding: 40, textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
              Loading…
            </div>
          )}
          {error && (
            <div style={{ padding: 40, textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
              Failed to load context data.
            </div>
          )}
          {data && (
            <div className="page-pad" style={{ paddingBottom: 32 }}>
              {(data.sectionEnabled.todos || data.sectionEnabled.dates) && (
                <div className="macro-body-grid" style={{ marginBottom: 16 }}>
                  {data.sectionEnabled.todos && (
                    <MacroPriorities
                      todos={data.todos}
                      todoLists={data.todoLists}
                      color={data.contextColor}
                      contextId={data.contextId}
                    />
                  )}
                  {data.sectionEnabled.dates && (
                    <MacroAhead
                      todos={data.todos}
                      dates={data.dates}
                      color={data.contextColor}
                      contextId={data.contextId}
                      in30days={in30days}
                    />
                  )}
                </div>
              )}
              {data.sectionEnabled.notes && (
                <div style={{ marginBottom: 16 }}>
                  <MacroNotes
                    notes={data.notes}
                    color={data.contextColor}
                    contextId={data.contextId}
                  />
                </div>
              )}
              <ReferenceStrip
                habitsWithStreak={habitsWithStreak}
                links={data.links}
                people={data.people}
                color={data.contextColor}
                contextId={data.contextId}
                sectionEnabled={data.sectionEnabled}
              />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
