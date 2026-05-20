'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Todo, Priority } from '@/lib/types'

// ── Types ─────────────────────────────────────────────────────────────────────

interface TodoWithCtx extends Todo {
  contextName: string
  contextColor: string
}

interface Props {
  todos: TodoWithCtx[]
  today: string
}

// ── Badge styles ──────────────────────────────────────────────────────────────

const BADGE_BASE: React.CSSProperties = {
  borderRadius: 5, padding: '1px 7px', fontSize: 11, fontWeight: 500,
  flexShrink: 0, whiteSpace: 'nowrap',
}

const BADGE: Record<Priority, React.CSSProperties> = {
  high:   { background: 'rgba(212,136,58,0.18)',  color: '#d4883a', border: '1px solid rgba(212,136,58,0.25)' },
  medium: { background: 'rgba(143,143,143,0.15)', color: '#8F8F8F', border: '1px solid rgba(143,143,143,0.2)' },
  low:    { background: 'rgba(100,100,100,0.12)',  color: '#6B6B6B', border: '1px solid rgba(100,100,100,0.15)' },
}

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 }

// ── Component ─────────────────────────────────────────────────────────────────

export function TodayFocus({ todos, today }: Props) {
  const router = useRouter()
  const [sortBy, setSortBy] = useState<'priority' | 'context' | 'due'>('priority')
  const [items, setItems] = useState<TodoWithCtx[]>(todos)

  useEffect(() => { setItems(todos) }, [todos])

  // ── Sort logic ──────────────────────────────────────────────────────────────

  function sorted(): TodoWithCtx[] {
    const copy = [...items]
    if (sortBy === 'priority') {
      return copy.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
    }
    if (sortBy === 'context') {
      return copy.sort((a, b) => {
        const nameDiff = a.contextName.localeCompare(b.contextName)
        return nameDiff !== 0 ? nameDiff : PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      })
    }
    // due: overdue → today → no date; within each group by priority
    return copy.sort((a, b) => {
      const aGroup = !a.dueDate ? 2 : a.dueDate < today ? 0 : 1
      const bGroup = !b.dueDate ? 2 : b.dueDate < today ? 0 : 1
      if (aGroup !== bGroup) return aGroup - bGroup
      return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    })
  }

  // ── Mark done ───────────────────────────────────────────────────────────────

  async function markDone(id: string) {
    setItems(prev => prev.filter(t => t.id !== id))
    await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: true, completedAt: new Date().toISOString() }),
    })
    router.refresh()
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const sortedItems = sorted()
  if (items.length === 0) return null

  const SORT_OPTIONS: { key: 'priority' | 'context' | 'due'; label: string }[] = [
    { key: 'priority', label: 'Priority' },
    { key: 'context',  label: 'Context'  },
    { key: 'due',      label: 'Due'      },
  ]

  // Build context groups for 'context' sort
  const contextGroups: { name: string; color: string; todos: TodoWithCtx[] }[] = []
  if (sortBy === 'context') {
    for (const todo of sortedItems) {
      const last = contextGroups[contextGroups.length - 1]
      if (!last || last.name !== todo.contextName) {
        contextGroups.push({ name: todo.contextName, color: todo.contextColor, todos: [todo] })
      } else {
        last.todos.push(todo)
      }
    }
  }

  function TodoRow({ todo }: { todo: TodoWithCtx }) {
    const overdue = !!todo.dueDate && todo.dueDate < today
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 16px' }}>
        {/* Checkbox */}
        <span
          onClick={() => markDone(todo.id)}
          style={{
            width: 14, height: 14, borderRadius: '50%',
            border: '1.5px solid hsl(var(--border))',
            flexShrink: 0, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        />
        {/* Title */}
        <span style={{ flex: 1, fontSize: 13, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {todo.title}
        </span>
        {/* Due label — only shown when a due date is set */}
        {todo.dueDate && (
          <span style={{
            fontSize: 11, flexShrink: 0,
            color: overdue ? '#d95f5f' : 'hsl(var(--muted-foreground))',
          }}>
            {overdue ? 'Overdue' : 'Today'}
          </span>
        )}
        {/* Priority badge */}
        <span style={{ ...BADGE_BASE, ...BADGE[todo.priority] }}>
          {todo.priority === 'high' ? 'High' : todo.priority === 'medium' ? 'Med' : 'Low'}
        </span>
        {/* Context */}
        {sortBy !== 'context' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: todo.contextColor }} />
            <span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {todo.contextName}
            </span>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Section label + sort pills */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{
          fontSize: 11, fontWeight: 500, color: 'hsl(var(--muted-foreground))',
          letterSpacing: 0.8, textTransform: 'uppercase', margin: 0,
        }}>
          Today
        </p>
        <div style={{ display: 'flex', gap: 4 }}>
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              style={{
                padding: '3px 9px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: sortBy === opt.key ? 500 : 400,
                background: sortBy === opt.key ? 'hsl(var(--muted))' : 'transparent',
                color: sortBy === opt.key ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="card-shadow" style={{
        background: 'hsl(var(--card))',
        border: '0.5px solid hsl(var(--border))',
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        {sortBy === 'context' ? (
          contextGroups.map((group, gi) => (
            <div key={group.name}>
              {/* Group header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 16px 4px',
                borderTop: gi > 0 ? '0.5px solid hsl(var(--border))' : 'none',
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: group.color }} />
                <span style={{ fontSize: 11, fontWeight: 500, color: 'hsl(var(--muted-foreground))' }}>
                  {group.name}
                </span>
              </div>
              {group.todos.map(todo => <TodoRow key={todo.id} todo={todo} />)}
            </div>
          ))
        ) : (
          sortedItems.map(todo => <TodoRow key={todo.id} todo={todo} />)
        )}
      </div>
    </>
  )
}
