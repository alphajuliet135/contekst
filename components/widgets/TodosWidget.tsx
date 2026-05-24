'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckSquare, Plus, Check, Trash2, X } from 'lucide-react'
import type { Todo, TodoList, Priority } from '@/lib/types'
import { TodoRow, BADGE_BASE, BADGE } from './TodoRow'
import { AddTodoForm } from './AddTodoForm'

const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 }

interface Props {
  todos: Todo[]
  todoLists: TodoList[]
  color: string
  contextId: string
}

export function TodosWidget({ todos, todoLists, color, contextId }: Props) {
  const router = useRouter()

  // ── Todo state ──────────────────────────────────────────────────────────────

  const [items, setItems]             = useState<Todo[]>(todos)
  const [showForm, setShowForm]       = useState(false)
  const [newTitle, setNewTitle]       = useState('')
  const [newPriority, setNewPriority] = useState<Priority>('medium')
  const [newDueDate, setNewDueDate]   = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [editingTodoId, setEditingTodoId]         = useState<string | null>(null)
  const [draftTitle, setDraftTitle]               = useState('')
  const [editingPriorityId, setEditingPriorityId] = useState<string | null>(null)
  const [editingDueDateId, setEditingDueDateId]   = useState<string | null>(null)
  const [draftDueDate, setDraftDueDate]           = useState('')

  // ── List state ──────────────────────────────────────────────────────────────

  const [lists, setLists]                 = useState<TodoList[]>(todoLists)
  const [activeListId, setActiveListId]   = useState<string | null>(null)
  const [editingListId, setEditingListId] = useState<string | null>(null)
  const [draftListName, setDraftListName] = useState('')
  const [addingList, setAddingList]       = useState(false)
  const [newListName, setNewListName]     = useState('')

  useEffect(() => { setItems(todos) }, [todos])
  useEffect(() => { setLists(todoLists) }, [todoLists])

  useEffect(() => {
    if (!editingPriorityId) return
    function onMouseDown(e: MouseEvent) {
      if (!(e.target as Element).closest('[data-prio-picker]')) setEditingPriorityId(null)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [editingPriorityId])

  // ── Derived ─────────────────────────────────────────────────────────────────

  const visibleItems = activeListId === null
    ? items.filter(t => t.listId == null)
    : items.filter(t => t.listId === activeListId)

  const activeItems = visibleItems
    .filter(t => !t.done)
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })

  const doneItems = visibleItems
    .filter(t => t.done)
    .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))

  const activeCount = items.filter(t => !t.done).length
  const hasItems    = visibleItems.length > 0
  const today       = new Date().toISOString().split('T')[0]

  // ── Todo actions ─────────────────────────────────────────────────────────────

  async function toggleDone(todo: Todo) {
    const nowDone = !todo.done
    const completedAt = nowDone ? new Date().toISOString() : null
    setItems(prev => prev.map(t => t.id === todo.id ? { ...t, done: nowDone, completedAt } : t))
    await fetch(`/api/todos/${todo.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: nowDone, completedAt }),
    })
    router.refresh()
  }

  async function deleteTodo(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    setItems(prev => prev.filter(t => t.id !== id))
    if (!id.startsWith('temp-')) {
      await fetch(`/api/todos/${id}`, { method: 'DELETE' })
      router.refresh()
    }
  }

  async function handleAdd() {
    const title = newTitle.trim()
    if (!title || submitting) return
    setSubmitting(true)
    const tempId = `temp-${Date.now()}`
    setItems(prev => [...prev, {
      id: tempId, contextId, userId: '',
      listId: activeListId,
      title, priority: newPriority,
      dueDate: newDueDate || null,
      done: false, pinned: false,
      completedAt: null, createdAt: null,
    }])
    setShowForm(false)
    setNewTitle('')
    setNewPriority('medium')
    setNewDueDate('')
    await fetch('/api/todos', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contextId, title, priority: newPriority, listId: activeListId, dueDate: newDueDate || undefined }),
    })
    setSubmitting(false)
    router.refresh()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleAdd()
    if (e.key === 'Escape') { setShowForm(false); setNewTitle(''); setNewPriority('medium'); setNewDueDate('') }
  }

  async function handleTitleBlur() {
    if (!editingTodoId) return
    const id = editingTodoId
    const title = draftTitle.trim()
    setEditingTodoId(null)
    if (!title || title === items.find(t => t.id === id)?.title) return
    setItems(prev => prev.map(t => t.id === id ? { ...t, title } : t))
    await fetch(`/api/todos/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    router.refresh()
  }

  async function saveDueDate(todo: Todo, value: string) {
    const dueDate = value || null
    setEditingDueDateId(null)
    setDraftDueDate('')
    if (dueDate === (todo.dueDate ?? null)) return
    setItems(prev => prev.map(t => t.id === todo.id ? { ...t, dueDate } : t))
    await fetch(`/api/todos/${todo.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dueDate }),
    })
    router.refresh()
  }

  async function selectPriority(todo: Todo, p: Priority) {
    setEditingPriorityId(null)
    if (p === todo.priority) return
    setItems(prev => prev.map(t => t.id === todo.id ? { ...t, priority: p } : t))
    await fetch(`/api/todos/${todo.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority: p }),
    })
  }

  // ── List actions ─────────────────────────────────────────────────────────────

  async function handleCreateList() {
    const name = newListName.trim()
    setAddingList(false)
    setNewListName('')
    if (!name) return
    const res = await fetch('/api/todo-lists', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contextId, name }),
    })
    const newList: TodoList = await res.json()
    setLists(prev => [...prev, newList])
    setActiveListId(newList.id)
    router.refresh()
  }

  async function handleRenameList() {
    if (!editingListId) return
    const id = editingListId
    const name = draftListName.trim()
    setEditingListId(null)
    if (!name || name === lists.find(l => l.id === id)?.name) return
    setLists(prev => prev.map(l => l.id === id ? { ...l, name } : l))
    await fetch(`/api/todo-lists/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    router.refresh()
  }

  async function handleDeleteList(id: string) {
    setLists(prev => prev.filter(l => l.id !== id))
    if (activeListId === id) setActiveListId(null)
    setItems(prev => prev.map(t => t.listId === id ? { ...t, listId: null } : t))
    await fetch(`/api/todo-lists/${id}`, { method: 'DELETE' })
    router.refresh()
  }

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
        borderBottom: lists.length > 0 ? 'none' : '0.5px solid hsl(var(--border))',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <CheckSquare size={14} strokeWidth={1.5} style={{ color }} />
        <span style={{ fontSize: 13, fontWeight: 500 }}>Priorities</span>
        {activeCount > 0 && (
          <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>{activeCount}</span>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          {lists.length === 0 && !addingList && (
            <button
              onClick={() => setAddingList(true)}
              style={{
                background: 'none', border: 'none',
                color: 'hsl(var(--muted-foreground))', fontSize: 11, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 2, padding: '2px 6px', opacity: 0.6,
              }}
              title="Create a named list"
            >
              <Plus size={9} strokeWidth={2} />
              list
            </button>
          )}
          {lists.length === 0 && addingList && (
            <input
              value={newListName}
              onChange={e => setNewListName(e.target.value)}
              onBlur={() => { if (!newListName.trim()) { setAddingList(false); setNewListName('') } }}
              onKeyDown={e => {
                if (e.key === 'Enter') handleCreateList()
                if (e.key === 'Escape') { setAddingList(false); setNewListName('') }
              }}
              autoFocus
              placeholder="List name…"
              style={{
                background: 'none', border: 'none', outline: 'none',
                fontSize: 12, color: 'hsl(var(--foreground))',
                width: 90, fontFamily: 'inherit', padding: '2px 0',
              }}
            />
          )}
          <button
            onClick={() => setShowForm(v => !v)}
            style={{
              background: 'none', border: 'none',
              color: showForm ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
              fontSize: 12, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 3, padding: '2px 4px',
            }}
          >
            <Plus size={11} strokeWidth={2} />
            Add
          </button>
        </div>
      </div>

      {/* Tab bar */}
      {lists.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', padding: '0 8px',
          borderBottom: '0.5px solid hsl(var(--border))',
          overflowX: 'auto', scrollbarWidth: 'none',
        }}>
          <button
            onClick={() => setActiveListId(null)}
            style={{
              flexShrink: 0, padding: '7px 8px', background: 'none', border: 'none',
              fontSize: 12, fontWeight: activeListId === null ? 500 : 400, cursor: 'pointer',
              color: activeListId === null ? color : 'hsl(var(--muted-foreground))',
              borderBottom: activeListId === null ? `2px solid ${color}` : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            Main
          </button>
          {lists.map(list => (
            <div key={list.id} style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
              {editingListId === list.id ? (
                <input
                  value={draftListName}
                  onChange={e => setDraftListName(e.target.value)}
                  onBlur={handleRenameList}
                  onKeyDown={e => {
                    if (e.key === 'Enter') e.currentTarget.blur()
                    if (e.key === 'Escape') setEditingListId(null)
                  }}
                  autoFocus
                  style={{
                    background: 'none', border: 'none', outline: 'none',
                    fontSize: 12, color: 'hsl(var(--foreground))',
                    padding: '7px 4px', marginBottom: -1,
                    width: Math.max(60, draftListName.length * 8),
                    fontFamily: 'inherit',
                  }}
                />
              ) : (
                <button
                  onClick={() => setActiveListId(list.id)}
                  onDoubleClick={() => { setEditingListId(list.id); setDraftListName(list.name) }}
                  style={{
                    padding: '7px 4px 7px 8px', background: 'none', border: 'none',
                    fontSize: 12, fontWeight: activeListId === list.id ? 500 : 400, cursor: 'pointer',
                    color: activeListId === list.id ? color : 'hsl(var(--muted-foreground))',
                    borderBottom: activeListId === list.id ? `2px solid ${color}` : '2px solid transparent',
                    marginBottom: -1, display: 'flex', alignItems: 'center', gap: 3,
                  }}
                >
                  {list.name}
                  <span
                    onMouseDown={e => { e.stopPropagation(); handleDeleteList(list.id) }}
                    style={{ display: 'flex', alignItems: 'center', color: 'hsl(var(--muted-foreground))', opacity: 0.4, cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '0.4'}
                  >
                    <X size={9} strokeWidth={2} />
                  </span>
                </button>
              )}
            </div>
          ))}
          {addingList ? (
            <input
              value={newListName}
              onChange={e => setNewListName(e.target.value)}
              onBlur={() => { if (!newListName.trim()) { setAddingList(false); setNewListName('') } }}
              onKeyDown={e => {
                if (e.key === 'Enter') handleCreateList()
                if (e.key === 'Escape') { setAddingList(false); setNewListName('') }
              }}
              autoFocus
              placeholder="List name…"
              style={{
                background: 'none', border: 'none', outline: 'none',
                fontSize: 12, color: 'hsl(var(--foreground))',
                padding: '7px 4px', width: 90, fontFamily: 'inherit',
              }}
            />
          ) : (
            <button
              onClick={() => setAddingList(true)}
              style={{
                padding: '7px 6px', background: 'none', border: 'none',
                cursor: 'pointer', color: 'hsl(var(--muted-foreground))',
                display: 'flex', alignItems: 'center', opacity: 0.5, marginLeft: 2,
              }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.opacity = '1'}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = '0.5'}
              title="New list"
            >
              <Plus size={11} strokeWidth={2} />
            </button>
          )}
        </div>
      )}

      {/* Body */}
      {!hasItems && !showForm ? (
        <div style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))' }}>
            {activeListId === null
              ? 'No priorities yet — click Add to create one'
              : `No items in "${lists.find(l => l.id === activeListId)?.name ?? 'this list'}" — click Add`}
          </span>
        </div>
      ) : (
        <div style={{ paddingBottom: showForm ? 0 : 6 }}>
          {activeItems.map(todo => (
            <TodoRow
              key={todo.id}
              todo={todo}
              today={today}
              isEditingTitle={editingTodoId === todo.id}
              draftTitle={draftTitle}
              isEditingPriority={editingPriorityId === todo.id}
              isEditingDueDate={editingDueDateId === todo.id}
              draftDueDate={draftDueDate}
              onToggle={() => toggleDone(todo)}
              onDelete={e => deleteTodo(e, todo.id)}
              onStartEditing={() => { setEditingTodoId(todo.id); setDraftTitle(todo.title) }}
              onTitleChange={v => setDraftTitle(v)}
              onTitleBlur={handleTitleBlur}
              onTitleKeyDown={e => {
                if (e.key === 'Enter') e.currentTarget.blur()
                if (e.key === 'Escape') setEditingTodoId(null)
              }}
              onOpenPriorityPicker={() => setEditingPriorityId(todo.id)}
              onSelectPriority={p => selectPriority(todo, p)}
              onStartEditingDueDate={() => { setEditingDueDateId(todo.id); setDraftDueDate(todo.dueDate ?? '') }}
              onDraftDueDateChange={v => setDraftDueDate(v)}
              onSaveDueDate={value => saveDueDate(todo, value)}
              onCancelDueDateEdit={() => { setEditingDueDateId(null); setDraftDueDate('') }}
            />
          ))}

          {doneItems.length > 0 && (
            <>
              {activeItems.length > 0 && (
                <div style={{ borderTop: '0.5px solid hsl(var(--border))', margin: '4px 0' }} />
              )}
              {doneItems.map(todo => (
                <div key={todo.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '6px 16px' }}>
                  <span
                    onClick={() => toggleDone(todo)}
                    style={{
                      width: 16, height: 16, borderRadius: '50%',
                      background: color, flexShrink: 0, marginTop: 1, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Check size={9} strokeWidth={3} style={{ color: 'white' }} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{
                      fontSize: 13, lineHeight: 1.4, display: 'block',
                      textDecoration: 'line-through', color: 'hsl(var(--muted-foreground))',
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

          {showForm && (
            <AddTodoForm
              newTitle={newTitle}
              newPriority={newPriority}
              newDueDate={newDueDate}
              submitting={submitting}
              hasItems={hasItems}
              color={color}
              onTitleChange={v => { setNewTitle(v) }}
              onPriorityChange={p => setNewPriority(p)}
              onDueDateChange={v => setNewDueDate(v)}
              onAdd={handleAdd}
              onCancel={() => { setShowForm(false); setNewTitle(''); setNewPriority('medium'); setNewDueDate('') }}
              onKeyDown={handleKeyDown}
            />
          )}
        </div>
      )}
    </div>
  )
}
