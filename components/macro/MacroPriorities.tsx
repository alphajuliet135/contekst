'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar } from 'lucide-react'
import type { Todo, TodoList } from '@/lib/types'
import { colorTint, formatDate } from '@/lib/utils'
import { CountPill } from './CountPill'

const BADGE_BASE: React.CSSProperties = {
  borderRadius: 5, padding: '1px 7px', fontSize: 11, fontWeight: 500,
  flexShrink: 0, whiteSpace: 'nowrap',
}
const BADGE = {
  high:   { background: 'rgba(212,136,58,0.18)',  color: '#d4883a', border: '1px solid rgba(212,136,58,0.25)' },
  medium: { background: 'rgba(143,143,143,0.15)', color: '#8F8F8F', border: '1px solid rgba(143,143,143,0.2)' },
  low:    { background: 'rgba(100,100,100,0.12)', color: '#6B6B6B', border: '1px solid rgba(100,100,100,0.15)' },
}

const MENU_ITEM: React.CSSProperties = {
  display: 'block', width: '100%', padding: '5px 12px',
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: 12, color: 'hsl(var(--foreground))', textAlign: 'left',
}

interface Props {
  todos: Todo[]
  todoLists: TodoList[]
  color: string
  contextId: string
}

export function MacroPriorities({ todos: initialTodos, todoLists: initialLists, color, contextId }: Props) {
  const router = useRouter()
  const [localTodos, setLocalTodos] = useState(initialTodos)
  const [localLists, setLocalLists] = useState(initialLists)
  const [activeListId, setActiveListId] = useState<string | null>(initialLists[0]?.id ?? null)
  const [adding, setAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDueDate, setNewDueDate] = useState('')
  const [editingDateId, setEditingDateId] = useState<string | null>(null)
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null)
  const [editTodoTitle, setEditTodoTitle] = useState('')
  const [priorityPopoverId, setPriorityPopoverId] = useState<string | null>(null)
  const [renamingListId, setRenamingListId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [hoveredListId, setHoveredListId] = useState<string | null>(null)
  const [addingList, setAddingList] = useState(false)
  const [newListName, setNewListName] = useState('')
  const addInputRef = useRef<HTMLInputElement>(null)
  const addRowRef = useRef<HTMLDivElement>(null)
  const newListInputRef = useRef<HTMLInputElement>(null)
  const renameInputRef = useRef<HTMLInputElement>(null)
  const editTodoRef = useRef<HTMLInputElement>(null)
  const priorityPopoverRef = useRef<HTMLDivElement>(null)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => { setLocalTodos(initialTodos) }, [initialTodos])
  useEffect(() => { setLocalLists(initialLists) }, [initialLists])
  useEffect(() => {
    if (initialLists.length > 0 && activeListId === null) {
      setActiveListId(initialLists[0].id)
    }
  }, [initialLists])

  useEffect(() => { if (adding) addInputRef.current?.focus() }, [adding])
  useEffect(() => { if (addingList) newListInputRef.current?.focus() }, [addingList])
  useEffect(() => { if (renamingListId) renameInputRef.current?.focus() }, [renamingListId])
  useEffect(() => { if (editingTodoId) editTodoRef.current?.focus() }, [editingTodoId])

  // Close priority popover on outside click
  useEffect(() => {
    if (!priorityPopoverId) return
    function onMouseDown(e: MouseEvent) {
      if (priorityPopoverRef.current && !priorityPopoverRef.current.contains(e.target as Node)) {
        setPriorityPopoverId(null)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [priorityPopoverId])

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

  async function saveDueDate(id: string, value: string) {
    setEditingDateId(null)
    const dueDate = value || null
    setLocalTodos(prev => prev.map(t => t.id === id ? { ...t, dueDate } : t))
    await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dueDate }),
    })
    router.refresh()
  }

  async function savePriority(id: string, priority: 'high' | 'medium' | 'low') {
    setPriorityPopoverId(null)
    setLocalTodos(prev => prev.map(t => t.id === id ? { ...t, priority } : t))
    await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority }),
    })
    router.refresh()
  }

  function startEditTodo(t: Todo) {
    setEditingTodoId(t.id)
    setEditTodoTitle(t.title)
  }

  async function saveTodoTitle(id: string) {
    const title = editTodoTitle.trim()
    setEditingTodoId(null)
    if (!title) return
    setLocalTodos(prev => prev.map(t => t.id === id ? { ...t, title } : t))
    await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    router.refresh()
  }

  async function addTodo() {
    const title = newTitle.trim()
    if (!title) { setAdding(false); setNewTitle(''); setNewDueDate(''); return }
    const tempId = `temp-${Date.now()}`
    const dueDate = newDueDate || null
    setLocalTodos(prev => [...prev, {
      id: tempId, contextId, userId: '', title, priority: 'medium',
      dueDate, done: false, pinned: false, completedAt: null, createdAt: null,
      listId: activeListId ?? null,
    }])
    setNewTitle('')
    setNewDueDate('')
    setAdding(false)
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contextId, title, priority: 'medium', listId: activeListId ?? undefined, dueDate }),
    })
    if (res.ok) {
      const created = await res.json()
      setLocalTodos(prev => prev.map(t => t.id === tempId ? created : t))
    } else {
      setLocalTodos(prev => prev.filter(t => t.id !== tempId))
    }
    router.refresh()
  }

  async function addList() {
    const name = newListName.trim()
    setAddingList(false)
    setNewListName('')
    if (!name) return
    const res = await fetch('/api/todo-lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contextId, name }),
    })
    if (res.ok) {
      const created = await res.json()
      setLocalLists(prev => [...prev, created])
      setActiveListId(created.id)
    }
    router.refresh()
  }

  async function renameList(id: string) {
    const name = renameValue.trim()
    setRenamingListId(null)
    if (!name) return
    setLocalLists(prev => prev.map(l => l.id === id ? { ...l, name } : l))
    await fetch(`/api/todo-lists/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    router.refresh()
  }

  async function deleteList(id: string) {
    setLocalLists(prev => {
      const next = prev.filter(l => l.id !== id)
      if (activeListId === id) setActiveListId(next[0]?.id ?? null)
      return next
    })
    await fetch(`/api/todo-lists/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div style={{
      background: 'hsl(var(--card))',
      border: '0.5px solid hsl(var(--border))',
      borderRadius: 12,
      boxShadow: '0 1px 2px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0, letterSpacing: -0.1 }}>Priorities</h2>
          <CountPill count={filteredTodos.length} color={color} />
        </div>
        <button
          title="Add todo"
          onClick={() => setAdding(v => !v)}
          style={{ fontSize: 12, color, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>

      {/* Tab strip */}
      <div style={{ padding: '10px 18px 0', display: 'flex', gap: 4, overflowX: 'auto', scrollbarWidth: 'none', alignItems: 'center' }}>
        {localLists.map(list => {
          const active = activeListId === list.id
          const renaming = renamingListId === list.id
          const cnt = countForList(list.id)
          return (
            <div
              key={list.id}
              onMouseEnter={() => setHoveredListId(list.id)}
              onMouseLeave={() => setHoveredListId(null)}
              style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}
            >
              {renaming ? (
                <input
                  ref={renameInputRef}
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') renameList(list.id)
                    if (e.key === 'Escape') setRenamingListId(null)
                  }}
                  onBlur={() => renameList(list.id)}
                  style={{
                    background: colorTint(color, 0.16),
                    border: `1px solid ${colorTint(color, 0.4)}`,
                    borderRadius: 5, padding: '3px 9px',
                    fontSize: 12, color, outline: 'none', fontFamily: 'inherit',
                    minWidth: 60,
                  }}
                />
              ) : (
                <>
                  <button
                    onClick={() => setActiveListId(list.id)}
                    style={{
                      padding: '3px 9px', borderRadius: 5, cursor: 'pointer',
                      fontSize: 12, fontWeight: active ? 500 : 400,
                      background: active ? colorTint(color, 0.16) : 'transparent',
                      color: active ? color : 'hsl(var(--muted-foreground))',
                      border: 'none', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
                    }}
                  >
                    {list.name}
                    {cnt > 0 && <CountPill count={cnt} color={color} dim={!active} />}
                  </button>
                  {active && hoveredListId === list.id && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 2px)', left: 0, zIndex: 20,
                      background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))',
                      borderRadius: 6, padding: '2px 0', minWidth: 100,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                    }}>
                      <button
                        onClick={() => { setRenameValue(list.name); setRenamingListId(list.id) }}
                        style={MENU_ITEM}
                      >
                        Rename
                      </button>
                      <button
                        onClick={() => deleteList(list.id)}
                        style={{ ...MENU_ITEM, color: '#d95f5f' }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
        {addingList ? (
          <input
            ref={newListInputRef}
            value={newListName}
            onChange={e => setNewListName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') addList()
              if (e.key === 'Escape') { setAddingList(false); setNewListName('') }
            }}
            onBlur={addList}
            placeholder="List name…"
            style={{
              background: colorTint(color, 0.1), border: `1px solid ${colorTint(color, 0.35)}`,
              borderRadius: 5, padding: '3px 9px', fontSize: 12, color,
              outline: 'none', fontFamily: 'inherit', minWidth: 80, flexShrink: 0,
            }}
          />
        ) : (
          <button
            title="Add list"
            onClick={() => setAddingList(true)}
            style={{
              fontSize: 14, color: 'hsl(var(--muted-foreground))', background: 'none',
              border: 'none', cursor: 'pointer', padding: '2px 4px', lineHeight: 1,
              flexShrink: 0,
            }}
          >+</button>
        )}
      </div>

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
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 18px',
                borderTop: i > 0 ? '0.5px solid hsl(var(--muted))' : 'none',
                borderLeft: overdue ? '2px solid #d95f5f' : '2px solid transparent',
                paddingLeft: overdue ? 16 : 18,
              }}>
                <button
                  onClick={() => markDone(t.id)}
                  style={{
                    width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                    border: `1.5px solid ${color}`, background: 'none', cursor: 'pointer', padding: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  {editingTodoId === t.id ? (
                    <input
                      ref={editTodoRef}
                      value={editTodoTitle}
                      onChange={e => setEditTodoTitle(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveTodoTitle(t.id); if (e.key === 'Escape') setEditingTodoId(null) }}
                      onBlur={() => saveTodoTitle(t.id)}
                      style={{
                        fontSize: 13, background: 'none', border: 'none', outline: 'none',
                        color: 'hsl(var(--foreground))', fontFamily: 'inherit',
                        width: '100%', padding: 0, lineHeight: 1.3,
                      }}
                    />
                  ) : (
                    <div
                      onClick={() => startEditTodo(t)}
                      style={{ fontSize: 13, lineHeight: 1.3, cursor: 'text' }}
                    >
                      {t.title}
                    </div>
                  )}
                  {subLabel && (
                    <div style={{ fontSize: 11, color: overdue ? '#d95f5f' : 'hsl(var(--muted-foreground))', marginTop: 2 }}>
                      {subLabel}
                    </div>
                  )}
                </div>

                {/* Priority badge with popover */}
                <div style={{ position: 'relative', flexShrink: 0 }} ref={priorityPopoverId === t.id ? priorityPopoverRef : undefined}>
                  <button
                    onClick={() => setPriorityPopoverId(prev => prev === t.id ? null : t.id)}
                    style={{ ...BADGE_BASE, ...BADGE[t.priority], cursor: 'pointer' }}
                  >
                    {t.priority === 'high' ? 'High' : t.priority === 'medium' ? 'Med' : 'Low'}
                  </button>
                  {priorityPopoverId === t.id && (
                    <div style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 4px)', zIndex: 20,
                      background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))',
                      borderRadius: 7, padding: 4, display: 'flex', flexDirection: 'column', gap: 2,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                    }}>
                      {(['high', 'medium', 'low'] as const).map(p => (
                        <button
                          key={p}
                          onClick={() => savePriority(t.id, p)}
                          style={{ ...BADGE_BASE, ...BADGE[p], cursor: 'pointer', border: 'none', textAlign: 'left' }}
                        >
                          {p === 'high' ? 'High' : p === 'medium' ? 'Med' : 'Low'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Due date chip/picker */}
                {editingDateId === t.id ? (
                  <input
                    type="date"
                    autoFocus
                    defaultValue={t.dueDate ?? ''}
                    onChange={e => saveDueDate(t.id, e.target.value)}
                    onBlur={() => setEditingDateId(null)}
                    onKeyDown={e => { if (e.key === 'Escape') setEditingDateId(null) }}
                    style={{
                      fontSize: 11, background: 'hsl(var(--muted))',
                      border: '0.5px solid hsl(var(--border))',
                      borderRadius: 4, padding: '2px 5px',
                      color: 'hsl(var(--foreground))', outline: 'none',
                      colorScheme: 'dark', flexShrink: 0,
                    }}
                  />
                ) : (
                  <button
                    onClick={() => setEditingDateId(t.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 3, padding: '2px 6px',
                      background: t.dueDate ? colorTint(color, 0.12) : 'transparent',
                      border: t.dueDate ? `0.5px solid ${colorTint(color, 0.3)}` : '0.5px solid transparent',
                      borderRadius: 4, cursor: 'pointer',
                      fontSize: 11, color: t.dueDate ? color : 'hsl(var(--muted-foreground))',
                      flexShrink: 0,
                    }}
                  >
                    {t.dueDate ? formatDate(t.dueDate) : <Calendar size={11} strokeWidth={1.75} />}
                  </button>
                )}
              </div>
            )
          })
        )}

        {/* Inline add row */}
        {adding && (
          <div
            ref={addRowRef}
            style={{ padding: '10px 18px', borderTop: filteredTodos.length > 0 ? '0.5px solid hsl(var(--muted))' : 'none', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <span style={{ width: 14, height: 14, borderRadius: '50%', border: `1.5px solid ${color}`, flexShrink: 0, display: 'inline-block' }} />
            <input
              ref={addInputRef}
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addTodo(); if (e.key === 'Escape') { setAdding(false); setNewTitle(''); setNewDueDate('') } }}
              onBlur={e => {
                if (addRowRef.current?.contains(e.relatedTarget as Node)) return
                addTodo()
              }}
              placeholder="New todo…"
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                fontSize: 13, color: 'hsl(var(--foreground))', fontFamily: 'inherit',
              }}
            />
            <input
              type="date"
              tabIndex={0}
              value={newDueDate}
              onChange={e => setNewDueDate(e.target.value)}
              onBlur={e => {
                if (addRowRef.current?.contains(e.relatedTarget as Node)) return
                addTodo()
              }}
              style={{
                fontSize: 11, background: 'hsl(var(--muted))',
                border: '0.5px solid hsl(var(--border))',
                borderRadius: 4, padding: '2px 5px',
                color: 'hsl(var(--muted-foreground))', outline: 'none',
                colorScheme: 'dark', flexShrink: 0,
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
