'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Todo, TodoList } from '@/lib/types'
import { colorTint, formatDate } from '@/lib/utils'
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
  todoLists: TodoList[]
  color: string
  contextId: string
}

export function MacroPriorities({ todos: initialTodos, todoLists, color, contextId }: Props) {
  const router = useRouter()
  const [localTodos, setLocalTodos] = useState(initialTodos)
  const [activeListId, setActiveListId] = useState<string | null>(todoLists[0]?.id ?? null)
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const addInputRef = useRef<HTMLInputElement>(null)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => { setLocalTodos(initialTodos) }, [initialTodos])
  useEffect(() => {
    if (todoLists.length > 0 && activeListId === null) {
      setActiveListId(todoLists[0].id)
    }
  }, [todoLists])

  useEffect(() => {
    if (adding) addInputRef.current?.focus()
  }, [adding])

  const filteredTodos = activeListId
    ? localTodos.filter(t => t.listId === activeListId)
    : localTodos

  function countForList(listId: string) {
    return localTodos.filter(t => t.listId === listId).length
  }

  async function markDone(id: string) {
    setLocalTodos(prev => prev.filter(t => t.id !== id))
    await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: true, completedAt: new Date().toISOString() }),
    })
    router.refresh()
  }

  async function addTodo() {
    const title = newTitle.trim()
    if (!title) { setAdding(false); setNewTitle(''); return }
    const tempId = `temp-${Date.now()}`
    setLocalTodos(prev => [...prev, {
      id: tempId, contextId, userId: '', title, priority: 'medium',
      dueDate: null, done: false, pinned: false, completedAt: null, createdAt: null,
      listId: activeListId ?? null,
    }])
    setNewTitle('')
    setAdding(false)
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contextId, title, priority: 'medium', listId: activeListId ?? undefined }),
    })
    if (res.ok) {
      const created = await res.json()
      setLocalTodos(prev => prev.map(t => t.id === tempId ? created : t))
    } else {
      setLocalTodos(prev => prev.filter(t => t.id !== tempId))
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
      <div style={{ padding: '14px 18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0, letterSpacing: -0.1 }}>Priorities</h2>
          <CountPill count={filteredTodos.length} color={color} />
        </div>
        <button
          onClick={() => setAdding(v => !v)}
          style={{ fontSize: 12, color, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, padding: 0 }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 5v14M5 12h14"/></svg>
          Add
        </button>
      </div>

      {/* Tab strip */}
      {todoLists.length > 0 && (
        <div style={{ padding: '10px 18px 0', display: 'flex', gap: 4, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {todoLists.map(list => {
            const active = activeListId === list.id
            const cnt = countForList(list.id)
            return (
              <button
                key={list.id}
                onClick={() => setActiveListId(list.id)}
                style={{
                  padding: '3px 9px', borderRadius: 5, cursor: 'pointer',
                  fontSize: 12, fontWeight: active ? 500 : 400,
                  background: active ? colorTint(color, 0.16) : 'transparent',
                  color: active ? color : 'hsl(var(--muted-foreground))',
                  border: 'none', display: 'flex', alignItems: 'center', gap: 6,
                  whiteSpace: 'nowrap', flexShrink: 0,
                }}
              >
                {list.name}
                {cnt > 0 && <CountPill count={cnt} color={color} dim={!active} />}
              </button>
            )
          })}
        </div>
      )}

      {/* Todo rows */}
      <div style={{ marginTop: 10, borderTop: '0.5px solid hsl(var(--muted))' }}>
        {filteredTodos.length === 0 && !adding ? (
          <div style={{ padding: '14px 18px', fontSize: 13, color: 'hsl(var(--muted-foreground))' }}>
            All clear — nothing here.
          </div>
        ) : (
          filteredTodos.map((t, i) => {
            const overdue = !!(t.dueDate && t.dueDate < today)
            const subLabel = overdue ? `Overdue · since ${formatDate(t.dueDate!)}` : t.dueDate ? `Due ${formatDate(t.dueDate)}` : null
            return (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '12px 18px',
                borderTop: i > 0 ? '0.5px solid hsl(var(--muted))' : 'none',
                borderLeft: overdue ? '2px solid #d95f5f' : '2px solid transparent',
                paddingLeft: overdue ? 16 : 18,
              }}>
                <button
                  onClick={() => markDone(t.id)}
                  style={{
                    marginTop: 2, width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                    border: `1.5px solid ${color}`, background: 'none', cursor: 'pointer', padding: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, lineHeight: 1.3 }}>{t.title}</div>
                  {subLabel && (
                    <div style={{ fontSize: 11, color: overdue ? '#d95f5f' : 'hsl(var(--muted-foreground))', marginTop: 2 }}>
                      {subLabel}
                    </div>
                  )}
                </div>
                <span style={{ ...BADGE_BASE, ...BADGE[t.priority] }}>
                  {t.priority === 'high' ? 'High' : t.priority === 'medium' ? 'Med' : 'Low'}
                </span>
              </div>
            )
          })
        )}

        {/* Inline add row */}
        {adding && (
          <div style={{ padding: '10px 18px', borderTop: filteredTodos.length > 0 ? '0.5px solid hsl(var(--muted))' : 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 14, height: 14, borderRadius: '50%', border: `1.5px solid ${color}`, flexShrink: 0, display: 'inline-block' }} />
            <input
              ref={addInputRef}
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addTodo(); if (e.key === 'Escape') { setAdding(false); setNewTitle('') } }}
              onBlur={addTodo}
              placeholder="New todo…"
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                fontSize: 13, color: 'hsl(var(--foreground))', fontFamily: 'inherit',
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
