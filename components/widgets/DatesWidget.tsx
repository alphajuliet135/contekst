'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, Plus, Trash2 } from 'lucide-react'
import { colorTint } from '@/lib/utils'

interface DateItem {
  id: string
  title: string
  date: string      // YYYY-MM-DD
  note: string | null
}

interface EditState {
  title: string
  date: string
  note: string
}

interface Props {
  dates: { id: string; title: string; date: string; note?: string | null }[]
  color: string
  contextId: string
}

function formatDisplay(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number)
  const dt = new Date(year, month - 1, day)
  return {
    monthLabel: dt.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase(),
    dayNum: dt.getDate(),
  }
}

export function DatesWidget({ dates, color, contextId }: Props) {
  const router = useRouter()
  const titleRef = useRef<HTMLInputElement>(null)
  const editTitleRef = useRef<HTMLInputElement>(null)

  const [items, setItems]           = useState<DateItem[]>(dates.map(d => ({
    id: d.id, title: d.title, date: d.date, note: d.note ?? null,
  })))
  const [showForm, setShowForm]     = useState(false)
  const [editingId, setEditingId]   = useState<string | null>(null)
  const [editState, setEditState]   = useState<EditState>({ title: '', date: '', note: '' })
  const [newTitle, setNewTitle]     = useState('')
  const [newDate, setNewDate]       = useState('')
  const [newNote, setNewNote]       = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setItems(dates.map(d => ({ id: d.id, title: d.title, date: d.date, note: d.note ?? null })))
  }, [dates])

  useEffect(() => { if (showForm) titleRef.current?.focus() }, [showForm])
  useEffect(() => { if (editingId) editTitleRef.current?.focus() }, [editingId])

  // ── Add date ───────────────────────────────────────────────────────────────

  async function handleAdd() {
    const title = newTitle.trim()
    if (!title || !newDate || submitting) return
    setSubmitting(true)
    const tempId = `temp-${Date.now()}`
    setItems(prev => [...prev, { id: tempId, title, date: newDate, note: newNote.trim() || null }])
    setShowForm(false); setNewTitle(''); setNewDate(''); setNewNote(''); setSubmitting(false)
    await fetch('/api/dates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contextId, title, date: newDate, note: newNote.trim() || null }),
    })
    router.refresh()
  }

  function handleAddKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleAdd()
    if (e.key === 'Escape') { setShowForm(false); setNewTitle(''); setNewDate(''); setNewNote('') }
  }

  // ── Edit date ──────────────────────────────────────────────────────────────

  function startEdit(item: DateItem) {
    setEditingId(item.id)
    setEditState({ title: item.title, date: item.date, note: item.note ?? '' })
  }

  async function saveEdit() {
    if (!editingId) return
    const id = editingId
    const { title, date, note } = editState
    if (!title.trim() || !date) { setEditingId(null); return }
    setItems(prev => prev.map(d =>
      d.id === id ? { ...d, title: title.trim(), date, note: note.trim() || null } : d
    ))
    setEditingId(null)
    if (!id.startsWith('temp-')) {
      await fetch(`/api/dates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), date, note: note.trim() || null }),
      })
      router.refresh()
    }
  }

  function handleEditKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') saveEdit()
    if (e.key === 'Escape') setEditingId(null)
  }

  // ── Delete date ────────────────────────────────────────────────────────────

  async function deleteDate(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    if (editingId === id) setEditingId(null)
    setItems(prev => prev.filter(d => d.id !== id))
    if (!id.startsWith('temp-')) {
      await fetch(`/api/dates/${id}`, { method: 'DELETE' })
      router.refresh()
    }
  }

  const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date))

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
        <Calendar size={14} strokeWidth={1.5} style={{ color }} />
        <span style={{ fontSize: 13, fontWeight: 500 }}>Upcoming dates</span>
        {items.length > 0 && (
          <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>{items.length}</span>
        )}
        <button
          onClick={() => { setShowForm(v => !v); setEditingId(null) }}
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
          <span style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))' }}>No dates yet</span>
        </div>
      ) : (
        <div style={{ padding: '6px 0 0' }}>
          {sorted.map(d => {
            const { monthLabel, dayNum } = formatDisplay(d.date)
            const isEditing = editingId === d.id

            return (
              <div key={d.id} style={{ position: 'relative' }}>
                {isEditing ? (
                  /* Edit form */
                  <div style={{ padding: '8px 16px 10px', borderBottom: '0.5px solid hsl(var(--border))' }}>
                    <input
                      ref={editTitleRef}
                      value={editState.title}
                      onChange={e => setEditState(s => ({ ...s, title: e.target.value }))}
                      onKeyDown={handleEditKey}
                      placeholder="Event title"
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        background: 'hsl(var(--background))',
                        border: '0.5px solid hsl(var(--border))',
                        borderRadius: 6, padding: '6px 10px',
                        fontSize: 13, color: 'hsl(var(--foreground))', outline: 'none', marginBottom: 6,
                      }}
                    />
                    <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                      <input
                        type="date"
                        value={editState.date}
                        onChange={e => setEditState(s => ({ ...s, date: e.target.value }))}
                        style={{
                          flex: 1, background: 'hsl(var(--background))',
                          border: '0.5px solid hsl(var(--border))',
                          borderRadius: 6, padding: '6px 10px',
                          fontSize: 13, color: 'hsl(var(--foreground))', outline: 'none',
                          colorScheme: 'inherit',
                        }}
                      />
                    </div>
                    <input
                      value={editState.note}
                      onChange={e => setEditState(s => ({ ...s, note: e.target.value }))}
                      onKeyDown={handleEditKey}
                      placeholder="Note (optional)"
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        background: 'hsl(var(--background))',
                        border: '0.5px solid hsl(var(--border))',
                        borderRadius: 6, padding: '6px 10px',
                        fontSize: 13, color: 'hsl(var(--foreground))', outline: 'none', marginBottom: 8,
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                      <button
                        onClick={() => setEditingId(null)}
                        style={{ background: 'none', border: 'none', fontSize: 12, color: 'hsl(var(--muted-foreground))', cursor: 'pointer', padding: '2px 4px' }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveEdit}
                        style={{
                          border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 500,
                          padding: '4px 12px', cursor: 'pointer',
                          background: color, color: 'white',
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Display row */
                  <div
                    onClick={() => startEdit(d)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '7px 16px 7px 16px',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{
                      background: colorTint(color, 0.1),
                      border: `0.5px solid ${colorTint(color, 0.35)}`,
                      borderRadius: 6, padding: '4px 8px',
                      textAlign: 'center', flexShrink: 0, width: 40,
                      boxSizing: 'border-box',
                    }}>
                      <div style={{ fontSize: 9, fontWeight: 500, color, letterSpacing: 0.5 }}>{monthLabel}</div>
                      <div style={{ fontSize: 15, fontWeight: 500, color, lineHeight: 1.2 }}>{dayNum}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                      <span style={{ fontSize: 13, display: 'block' }}>{d.title}</span>
                      {d.note && (
                        <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', display: 'block', marginTop: 2 }}>
                          {d.note}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={e => deleteDate(e, d.id)}
                      style={{
                        background: 'none', border: 'none', padding: 3, marginTop: 3,
                        color: 'hsl(var(--muted-foreground))', cursor: 'pointer',
                        borderRadius: 4, display: 'flex', alignItems: 'center', opacity: 0.4,
                        flexShrink: 0,
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.4' }}
                    >
                      <Trash2 size={11} strokeWidth={1.5} />
                    </button>
                  </div>
                )}
              </div>
            )
          })}

          {/* Inline add form */}
          {showForm && (
            <div style={{
              padding: '10px 16px 12px',
              borderTop: items.length > 0 ? '0.5px solid hsl(var(--border))' : 'none',
              display: 'flex', flexDirection: 'column', gap: 6,
            }}>
              <input
                ref={titleRef}
                type="text"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={handleAddKey}
                placeholder="Event title"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'hsl(var(--background))',
                  border: '0.5px solid hsl(var(--border))',
                  borderRadius: 6, padding: '6px 10px',
                  fontSize: 13, color: 'hsl(var(--foreground))', outline: 'none',
                }}
              />
              <input
                type="date"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                onKeyDown={handleAddKey}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'hsl(var(--background))',
                  border: '0.5px solid hsl(var(--border))',
                  borderRadius: 6, padding: '6px 10px',
                  fontSize: 13, color: 'hsl(var(--foreground))', outline: 'none',
                  colorScheme: 'inherit',
                }}
              />
              <input
                type="text"
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                onKeyDown={handleAddKey}
                placeholder="Note (optional)"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'hsl(var(--background))',
                  border: '0.5px solid hsl(var(--border))',
                  borderRadius: 6, padding: '6px 10px',
                  fontSize: 13, color: 'hsl(var(--foreground))', outline: 'none',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setNewTitle(''); setNewDate(''); setNewNote('') }}
                  style={{ background: 'none', border: 'none', fontSize: 12, color: 'hsl(var(--muted-foreground))', cursor: 'pointer', padding: '2px 4px' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={!newTitle.trim() || !newDate || submitting}
                  style={{
                    border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 500,
                    padding: '4px 12px',
                    background: (newTitle.trim() && newDate) ? color : 'hsl(var(--muted))',
                    color: (newTitle.trim() && newDate) ? 'white' : 'hsl(var(--muted-foreground))',
                    cursor: (newTitle.trim() && newDate) ? 'pointer' : 'default',
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
