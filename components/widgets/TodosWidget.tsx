'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { CheckSquare, Plus, Check, Trash2 } from 'lucide-react'
import type { Todo, Priority } from '@/lib/types'
import { formatDate } from '@/lib/utils'

// ── Badge styles (reused for priority selector in add form) ───────────────────

const BADGE_BASE: React.CSSProperties = {
  borderRadius: 5, padding: '1px 7px', fontSize: 11, fontWeight: 500,
  flexShrink: 0, whiteSpace: 'nowrap',
}
const BADGE = {
  high:   { background: 'rgba(212,136,58,0.18)',  color: '#d4883a', border: '1px solid rgba(212,136,58,0.25)' },
  medium: { background: 'rgba(143,143,143,0.15)', color: '#8F8F8F', border: '1px solid rgba(143,143,143,0.2)' },
  low:    { background: 'rgba(100,100,100,0.12)',  color: '#6B6B6B', border: '1px solid rgba(100,100,100,0.15)' },
  done:   { background: 'rgba(55,138,221,0.15)',   color: '#378ADD', border: '1px solid rgba(55,138,221,0.2)' },
} as const

const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 }

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  todos: Todo[]
  color: string
  contextId: string
}

export function TodosWidget({ todos, color, contextId }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [items, setItems]             = useState<Todo[]>(todos)
  const [showForm, setShowForm]       = useState(false)
  const [newTitle, setNewTitle]       = useState('')
  const [newPriority, setNewPriority] = useState<Priority>('medium')
  const [submitting, setSubmitting]   = useState(false)
  const [editingTodoId, setEditingTodoId]     = useState<string | null>(null)
  const [draftTitle, setDraftTitle]           = useState('')
  const editInputRef                          = useRef<HTMLInputElement>(null)
  const [editingPriorityId, setEditingPriorityId] = useState<string | null>(null)

  // Sync with server after router.refresh()
  useEffect(() => { setItems(todos) }, [todos])

  // Auto-focus the input when the form opens
  useEffect(() => {
    if (showForm) inputRef.current?.focus()
  }, [showForm])

  // Auto-focus edit input when a todo enters edit mode
  useEffect(() => {
    if (editingTodoId) editInputRef.current?.focus()
  }, [editingTodoId])

  // Close priority picker when clicking outside
  useEffect(() => {
    if (!editingPriorityId) return
    function onMouseDown(e: MouseEvent) {
      if (!(e.target as Element).closest('[data-prio-picker]')) {
        setEditingPriorityId(null)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [editingPriorityId])

  // ── Toggle done ─────────────────────────────────────────────────────────────

  async function toggleDone(todo: Todo) {
    const nowDone = !todo.done
    const completedAt = nowDone ? new Date().toISOString() : null
    setItems(prev => prev.map(t =>
      t.id === todo.id ? { ...t, done: nowDone, completedAt } : t
    ))
    await fetch(`/api/todos/${todo.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: nowDone, completedAt }),
    })
    router.refresh()
  }

  // ── Delete task ─────────────────────────────────────────────────────────────

  async function deleteTodo(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    setItems(prev => prev.filter(t => t.id !== id))
    if (!id.startsWith('temp-')) {
      await fetch(`/api/todos/${id}`, { method: 'DELETE' })
      router.refresh()
    }
  }

  // ── Add task ────────────────────────────────────────────────────────────────

  async function handleAdd() {
    const title = newTitle.trim()
    if (!title || submitting) return
    setSubmitting(true)

    const tempId = `temp-${Date.now()}`
    setItems(prev => [...prev, {
      id: tempId, contextId, userId: '',
      title, priority: newPriority,
      done: false, pinned: false,
      completedAt: null, createdAt: null,
    }])
    setShowForm(false)
    setNewTitle('')
    setNewPriority('medium')
    setSubmitting(false)

    await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contextId, title, priority: newPriority }),
    })
    router.refresh()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleAdd()
    if (e.key === 'Escape') { setShowForm(false); setNewTitle(''); setNewPriority('medium') }
  }

  // ── Inline title editing ────────────────────────────────────────────────────

  function startEditingTodo(todo: Todo) {
    setEditingTodoId(todo.id)
    setDraftTitle(todo.title)
  }

  async function handleTitleBlur() {
    if (!editingTodoId) return
    const id = editingTodoId
    const title = draftTitle.trim()
    setEditingTodoId(null)
    if (!title || title === items.find(t => t.id === id)?.title) return
    setItems(prev => prev.map(t => t.id === id ? { ...t, title } : t))
    await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    router.refresh()
  }

  function handleTitleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.currentTarget.blur() }
    if (e.key === 'Escape') { setEditingTodoId(null) }
  }

  async function selectPriority(todo: Todo, p: Priority) {
    setEditingPriorityId(null)
    if (p === todo.priority) return
    setItems(prev => prev.map(t => t.id === todo.id ? { ...t, priority: p } : t))
    await fetch(`/api/todos/${todo.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority: p }),
    })
  }

  // ── Sorted lists ────────────────────────────────────────────────────────────

  const activeItems = items
    .filter(t => !t.done)
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })

  const doneItems = items
    .filter(t => t.done)
    .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))

  const activeCount = activeItems.length
  const hasItems = items.length > 0
  const today = new Date().toISOString().split('T')[0]

  // ── Render ──────────────────────────────────────────────────────────────────

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
        <CheckSquare size={14} strokeWidth={1.5} style={{ color }} />
        <span style={{ fontSize: 13, fontWeight: 500 }}>Priorities</span>
        {activeCount > 0 && (
          <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>{activeCount}</span>
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
      {!hasItems && !showForm ? (
        <div style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))' }}>
            No priorities yet — click Add to create one
          </span>
        </div>
      ) : (
        <div style={{ paddingBottom: showForm ? 0 : 6 }}>
          {/* Active tasks */}
          {activeItems.map(todo => (
            <div key={todo.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '7px 16px' }}>
              {/* Checkbox */}
              <span
                onClick={() => toggleDone(todo)}
                style={{
                  width: 16, height: 16, borderRadius: '50%',
                  border: '1.5px solid hsl(var(--border))',
                  flexShrink: 0, marginTop: 1,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              />
              {/* Title + due date */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {editingTodoId === todo.id ? (
                  <input
                    ref={editInputRef}
                    value={draftTitle}
                    onChange={e => setDraftTitle(e.target.value)}
                    onBlur={handleTitleBlur}
                    onKeyDown={handleTitleKeyDown}
                    style={{
                      background: 'none', border: 'none', outline: 'none',
                      fontSize: 13, lineHeight: 1.4, display: 'block',
                      color: 'hsl(var(--foreground))',
                      width: '100%', padding: 0, fontFamily: 'inherit',
                    }}
                  />
                ) : (
                  <span
                    onClick={() => startEditingTodo(todo)}
                    style={{ fontSize: 13, lineHeight: 1.4, display: 'block', cursor: 'text' }}
                  >
                    {todo.title}
                  </span>
                )}
                {todo.dueDate && (
                  <span style={{
                    fontSize: 11,
                    color: todo.dueDate <= today ? '#d95f5f' : 'hsl(var(--muted-foreground))',
                    display: 'block', marginTop: 1,
                  }}>
                    {todo.dueDate <= today ? 'Overdue' : `Due ${formatDate(todo.dueDate)}`}
                  </span>
                )}
              </div>
              {/* Priority badge / inline picker */}
              {editingPriorityId === todo.id ? (
                <div data-prio-picker style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                  {(['high', 'medium', 'low'] as Priority[]).map(p => (
                    <button
                      key={p}
                      onMouseDown={e => { e.stopPropagation(); selectPriority(todo, p) }}
                      style={{
                        ...BADGE_BASE,
                        ...(p === todo.priority
                          ? BADGE[p]
                          : { background: 'transparent', color: 'hsl(var(--muted-foreground))', border: '0.5px solid hsl(var(--border))' }),
                        cursor: 'pointer',
                      }}
                    >
                      {p === 'high' ? 'H' : p === 'medium' ? 'M' : 'L'}
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  onMouseDown={e => { e.stopPropagation(); setEditingPriorityId(todo.id) }}
                  title="Change priority"
                  style={{ ...BADGE_BASE, ...BADGE[todo.priority], cursor: 'pointer', border: 'none' }}
                >
                  {todo.priority === 'high' ? 'High' : todo.priority === 'medium' ? 'Med' : 'Low'}
                </button>
              )}
              {/* Delete */}
              <button
                onClick={e => deleteTodo(e, todo.id)}
                style={{
                  background: 'none', border: 'none', padding: 3, marginTop: 1,
                  color: 'hsl(var(--muted-foreground))', cursor: 'pointer',
                  borderRadius: 4, display: 'flex', alignItems: 'center', opacity: 0.4,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.4' }}
              >
                <Trash2 size={11} strokeWidth={1.5} />
              </button>
            </div>
          ))}

          {/* Done tasks */}
          {doneItems.length > 0 && (
            <>
              {activeItems.length > 0 && (
                <div style={{ borderTop: '0.5px solid hsl(var(--border))', margin: '4px 0' }} />
              )}
              {doneItems.map(todo => (
                <div key={todo.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '6px 16px' }}>
                  {/* Filled checkbox */}
                  <span
                    onClick={() => toggleDone(todo)}
                    style={{
                      width: 16, height: 16, borderRadius: '50%',
                      background: color, flexShrink: 0, marginTop: 1,
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Check size={9} strokeWidth={3} style={{ color: 'white' }} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{
                      fontSize: 13, lineHeight: 1.4, display: 'block',
                      textDecoration: 'line-through',
                      color: 'hsl(var(--muted-foreground))',
                    }}>
                      {todo.title}
                    </span>
                  </div>
                  <span style={{ ...BADGE_BASE, ...BADGE.done }}>Done</span>
                  <button
                    onClick={e => deleteTodo(e, todo.id)}
                    style={{
                      background: 'none', border: 'none', padding: 3, marginTop: 1,
                      color: 'hsl(var(--muted-foreground))', cursor: 'pointer',
                      borderRadius: 4, display: 'flex', alignItems: 'center', opacity: 0.4,
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.4' }}
                  >
                    <Trash2 size={11} strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </>
          )}

          {/* Inline add form */}
          {showForm && (
            <div style={{
              padding: '10px 16px 12px',
              borderTop: hasItems ? '0.5px solid hsl(var(--border))' : 'none',
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
                  fontSize: 13, color: 'hsl(var(--foreground))',
                  padding: '0 0 8px',
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Priority selector */}
                <div style={{ display: 'flex', gap: 4 }}>
                  {(['high', 'medium', 'low'] as Priority[]).map(p => {
                    const selected = newPriority === p
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewPriority(p)}
                        style={{
                          ...BADGE_BASE,
                          ...(selected ? BADGE[p] : {
                            background: 'transparent',
                            color: 'hsl(var(--muted-foreground))',
                            border: '0.5px solid hsl(var(--border))',
                          }),
                          cursor: 'pointer',
                        }}
                      >
                        {p === 'high' ? 'High' : p === 'medium' ? 'Med' : 'Low'}
                      </button>
                    )
                  })}
                </div>
                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setNewTitle(''); setNewPriority('medium') }}
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
                      padding: '4px 12px', cursor: newTitle.trim() ? 'pointer' : 'default',
                      background: newTitle.trim() ? color : 'hsl(var(--muted))',
                      color: newTitle.trim() ? 'white' : 'hsl(var(--muted-foreground))',
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
