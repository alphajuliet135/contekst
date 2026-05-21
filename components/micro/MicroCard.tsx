'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Plus, Calendar, X, ExternalLink } from 'lucide-react'
import type { Todo, Priority } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { PromoteButton } from './PromoteButton'
import { MicroContextModal } from './MicroContextModal'

const BADGE_BASE: React.CSSProperties = {
  borderRadius: 5, padding: '1px 6px', fontSize: 10, fontWeight: 500,
  flexShrink: 0, whiteSpace: 'nowrap',
}
const BADGE = {
  high:   { background: 'rgba(212,136,58,0.18)',  color: '#d4883a', border: '1px solid rgba(212,136,58,0.25)' },
  medium: { background: 'rgba(143,143,143,0.15)', color: '#8F8F8F', border: '1px solid rgba(143,143,143,0.2)' },
  low:    { background: 'rgba(100,100,100,0.12)',  color: '#6B6B6B', border: '1px solid rgba(100,100,100,0.15)' },
} as const

const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 }

interface DateItem {
  id: string
  title: string
  date: string
}

interface Props {
  ctx: { id: string; name: string; color: string }
  initialTodos: Todo[]
  initialDates: DateItem[]
  today: string
}

export function MicroCard({ ctx, initialTodos, initialDates, today }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [showModal, setShowModal]     = useState(false)
  const [todos, setTodos]             = useState<Todo[]>(initialTodos)
  const [showForm, setShowForm]       = useState(false)
  const [newTitle, setNewTitle]       = useState('')
  const [newPriority, setNewPriority] = useState<Priority>('medium')
  const [submitting, setSubmitting]   = useState(false)

  useEffect(() => { setTodos(initialTodos) }, [initialTodos])
  useEffect(() => { if (showForm) inputRef.current?.focus() }, [showForm])

  // Toggle done — optimistically removes from the visible list
  async function toggleDone(todo: Todo) {
    setTodos(prev => prev.filter(t => t.id !== todo.id))
    await fetch(`/api/todos/${todo.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: true, completedAt: new Date().toISOString() }),
    })
    router.refresh()
  }

  // Add task
  async function handleAdd() {
    const title = newTitle.trim()
    if (!title || submitting) return
    setSubmitting(true)
    const tempId = `temp-${Date.now()}`
    setTodos(prev => [...prev, {
      id: tempId, contextId: ctx.id, userId: '',
      title, priority: newPriority,
      done: false, pinned: false,
      completedAt: null, createdAt: null,
    }])
    setShowForm(false); setNewTitle(''); setNewPriority('medium')
    await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contextId: ctx.id, title, priority: newPriority }),
    })
    setSubmitting(false)
    router.refresh()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleAdd()
    if (e.key === 'Escape') { setShowForm(false); setNewTitle(''); setNewPriority('medium') }
  }

  const sortedTodos = [...todos].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
  const displayTodos = sortedTodos.slice(0, 2)
  const moreCount = Math.max(0, sortedTodos.length - 2)
  const topDate = initialDates[0] ?? null
  const hasContent = sortedTodos.length > 0 || topDate !== null

  return (
    <>
    <div className="card-shadow" style={{
      background: 'hsl(var(--card))',
      border: '0.5px solid hsl(var(--border))',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '11px 14px',
        display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: '0.5px solid hsl(var(--border))',
      }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: ctx.color, flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 500, flex: 1, minWidth: 0 }}>{ctx.name}</span>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex', alignItems: 'center',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'hsl(var(--muted-foreground))',
            padding: 3, borderRadius: 5, opacity: 0.7,
          }}
          title="View full context"
        >
          <ExternalLink size={12} strokeWidth={1.5} />
        </button>
        <PromoteButton contextId={ctx.id} />
      </div>

      {/* Body */}
      <div style={{ padding: '8px 0 0' }}>
        {!hasContent && !showForm ? (
          <div style={{ padding: '6px 14px 10px' }}>
            <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>All clear</span>
          </div>
        ) : (
          <>
            {/* Todo rows */}
            {displayTodos.map(todo => (
              <div key={todo.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 14px' }}>
                {/* Checkbox */}
                <span
                  onClick={() => toggleDone(todo)}
                  style={{
                    width: 14, height: 14, borderRadius: '50%',
                    border: '1.5px solid hsl(var(--border))',
                    flexShrink: 0, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                />
                <span style={{
                  fontSize: 12, flex: 1, minWidth: 0,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {todo.title}
                </span>
                <span style={{ ...BADGE_BASE, ...BADGE[todo.priority] }}>
                  {todo.priority === 'high' ? 'H' : todo.priority === 'medium' ? 'M' : 'L'}
                </span>
              </div>
            ))}

            {/* Overflow count */}
            {moreCount > 0 && (
              <div style={{ padding: '3px 14px' }}>
                <span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>
                  +{moreCount} more
                </span>
              </div>
            )}

            {/* Top upcoming date */}
            {topDate && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 14px' }}>
                <Calendar size={11} strokeWidth={1.5} style={{ color: ctx.color, flexShrink: 0 }} />
                <span style={{
                  fontSize: 12, color: 'hsl(var(--muted-foreground))',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {topDate.title} · {formatDate(topDate.date)}
                </span>
              </div>
            )}
          </>
        )}

        {/* Add form or trigger */}
        {showForm ? (
          <div style={{
            padding: '8px 14px 10px',
            borderTop: (hasContent || !showForm) ? '0.5px solid hsl(var(--border))' : 'none',
          }}>
            <input
              ref={inputRef}
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a task…"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'none', border: 'none', outline: 'none',
                fontSize: 12, color: 'hsl(var(--foreground))',
                padding: '0 0 6px',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Priority pills */}
              <div style={{ display: 'flex', gap: 3 }}>
                {(['high', 'medium', 'low'] as Priority[]).map(p => {
                  const selected = newPriority === p
                  return (
                    <button key={p} type="button" onClick={() => setNewPriority(p)} style={{
                      ...BADGE_BASE,
                      ...(selected ? BADGE[p] : {
                        background: 'transparent',
                        color: 'hsl(var(--muted-foreground))',
                        border: '0.5px solid hsl(var(--border))',
                      }),
                      cursor: 'pointer',
                    }}>
                      {p === 'high' ? 'H' : p === 'medium' ? 'M' : 'L'}
                    </button>
                  )
                })}
              </div>
              {/* Actions */}
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setNewTitle(''); setNewPriority('medium') }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                    color: 'hsl(var(--muted-foreground))', display: 'flex', alignItems: 'center',
                  }}
                >
                  <X size={12} strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!newTitle.trim() || submitting}
                  style={{
                    border: 'none', borderRadius: 4, fontSize: 11, fontWeight: 500,
                    padding: '3px 8px',
                    background: newTitle.trim() ? ctx.color : 'hsl(var(--muted))',
                    color: newTitle.trim() ? 'white' : 'hsl(var(--muted-foreground))',
                    cursor: newTitle.trim() ? 'pointer' : 'default',
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              width: '100%', padding: '6px 14px 10px',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 11, color: 'hsl(var(--muted-foreground))',
              borderTop: hasContent ? '0.5px solid hsl(var(--border))' : 'none',
            }}
          >
            <Plus size={10} strokeWidth={2} />
            Add task
          </button>
        )}
      </div>
    </div>

    {showModal && (
      <MicroContextModal
        contextId={ctx.id}
        contextName={ctx.name}
        contextColor={ctx.color}
        onClose={() => setShowModal(false)}
      />
    )}
    </>
  )
}
