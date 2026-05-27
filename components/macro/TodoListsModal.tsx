'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Trash2, ChevronUp, ChevronDown, Check } from 'lucide-react'
import type { TodoList } from '@/lib/types'

interface Props {
  lists: TodoList[]
  contextId: string
  color: string
  onClose: () => void
}

export function TodoListsModal({ lists: initialLists, contextId, color, onClose }: Props) {
  const router = useRouter()
  const [lists, setLists] = useState(initialLists)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [newListName, setNewListName] = useState('')
  const [addingList, setAddingList] = useState(false)
  const renameRef = useRef<HTMLInputElement>(null)
  const addRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (renamingId) renameRef.current?.focus() }, [renamingId])
  useEffect(() => { if (addingList) addRef.current?.focus() }, [addingList])

  // Close on backdrop click
  function handleBackdrop(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose()
  }

  function startRename(list: TodoList) {
    setRenamingId(list.id)
    setRenameValue(list.name)
  }

  async function commitRename(id: string) {
    const trimmed = renameValue.trim()
    setRenamingId(null)
    if (!trimmed) return
    const original = lists.find(l => l.id === id)?.name ?? ''
    if (trimmed === original) return
    setLists(prev => prev.map(l => l.id === id ? { ...l, name: trimmed } : l))
    await fetch(`/api/todo-lists/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmed }),
    })
    router.refresh()
  }

  async function deleteList(id: string) {
    setLists(prev => prev.filter(l => l.id !== id))
    await fetch(`/api/todo-lists/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  async function move(id: string, direction: 'up' | 'down') {
    const idx = lists.findIndex(l => l.id === id)
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === lists.length - 1) return
    const newLists = [...lists]
    const target = direction === 'up' ? idx - 1 : idx + 1
    ;[newLists[idx], newLists[target]] = [newLists[target], newLists[idx]]
    setLists(newLists)
    // Persist both affected lists' order
    await Promise.all([
      fetch(`/api/todo-lists/${newLists[idx].id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: idx }),
      }),
      fetch(`/api/todo-lists/${newLists[target].id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: target }),
      }),
    ])
    router.refresh()
  }

  async function addList() {
    const name = newListName.trim()
    if (!name) { setAddingList(false); return }
    setAddingList(false)
    setNewListName('')
    const res = await fetch('/api/todo-lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contextId, name }),
    })
    const row = await res.json()
    setLists(prev => [...prev, row])
    router.refresh()
  }

  const ROW: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '9px 16px',
    borderBottom: '0.5px solid hsl(var(--border))',
  }

  return (
    <div
      onClick={handleBackdrop}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div className="card-shadow" style={{
        background: 'hsl(var(--card))',
        border: '0.5px solid hsl(var(--border))',
        borderRadius: 14,
        width: 380, maxWidth: 'calc(100vw - 32px)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 16px',
          borderBottom: '0.5px solid hsl(var(--border))',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Manage Lists</span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'hsl(var(--muted-foreground))', display: 'flex' }}
          >
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>

        {/* List rows */}
        <div style={{ maxHeight: 360, overflowY: 'auto' }}>
          {lists.length === 0 && !addingList && (
            <div style={{ padding: '14px 16px', fontSize: 13, color: 'hsl(var(--muted-foreground))' }}>
              No lists yet. Add one below.
            </div>
          )}
          {lists.map((list, i) => (
            <div key={list.id} style={ROW}>
              {/* Reorder */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flexShrink: 0 }}>
                <button
                  onClick={() => move(list.id, 'up')}
                  disabled={i === 0}
                  style={{ background: 'none', border: 'none', cursor: i === 0 ? 'default' : 'pointer', padding: 0, color: 'hsl(var(--muted-foreground))', opacity: i === 0 ? 0.25 : 1, display: 'flex' }}
                >
                  <ChevronUp size={12} strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => move(list.id, 'down')}
                  disabled={i === lists.length - 1}
                  style={{ background: 'none', border: 'none', cursor: i === lists.length - 1 ? 'default' : 'pointer', padding: 0, color: 'hsl(var(--muted-foreground))', opacity: i === lists.length - 1 ? 0.25 : 1, display: 'flex' }}
                >
                  <ChevronDown size={12} strokeWidth={1.5} />
                </button>
              </div>

              {/* Name / rename */}
              {renamingId === list.id ? (
                <input
                  ref={renameRef}
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  onBlur={() => commitRename(list.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') e.currentTarget.blur()
                    if (e.key === 'Escape') setRenamingId(null)
                  }}
                  style={{
                    flex: 1, background: 'hsl(var(--background))',
                    border: `0.5px solid ${color}`,
                    borderRadius: 5, padding: '3px 8px',
                    fontSize: 13, color: 'hsl(var(--foreground))', outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
              ) : (
                <span
                  onClick={() => startRename(list)}
                  style={{ flex: 1, fontSize: 13, cursor: 'text', userSelect: 'none' }}
                >
                  {list.name}
                </span>
              )}

              {/* Delete */}
              <button
                onClick={() => deleteList(list.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 3, color: 'hsl(var(--muted-foreground))', display: 'flex', flexShrink: 0, opacity: 0.6 }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.6' }}
              >
                <Trash2 size={12} strokeWidth={1.5} />
              </button>
            </div>
          ))}

          {/* Add new list row */}
          {addingList ? (
            <div style={{ ...ROW, gap: 6 }}>
              <input
                ref={addRef}
                value={newListName}
                onChange={e => setNewListName(e.target.value)}
                onBlur={addList}
                onKeyDown={e => {
                  if (e.key === 'Enter') e.currentTarget.blur()
                  if (e.key === 'Escape') { setAddingList(false); setNewListName('') }
                }}
                placeholder="List name"
                style={{
                  flex: 1, background: 'hsl(var(--background))',
                  border: `0.5px solid ${color}`,
                  borderRadius: 5, padding: '4px 8px',
                  fontSize: 13, color: 'hsl(var(--foreground))', outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              <button
                onMouseDown={e => { e.preventDefault(); addList() }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 3, color, display: 'flex' }}
              >
                <Check size={13} strokeWidth={2} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAddingList(true)}
              style={{
                display: 'block', width: '100%', padding: '10px 16px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12, color: 'hsl(var(--muted-foreground))', textAlign: 'left',
              }}
            >
              + Add list
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
