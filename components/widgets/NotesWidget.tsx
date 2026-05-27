'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Plus, Trash2 } from 'lucide-react'
import type { Note } from '@/lib/types'

interface NoteItem {
  id: string   // real DB id or 'temp-{timestamp}' for unsaved new notes
  content: string
  title: string | null
}

interface Props {
  notes: Note[]
  color: string
  contextId: string
}

export function NotesWidget({ notes, color, contextId }: Props) {
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [items, setItems]           = useState<NoteItem[]>(notes.map(n => ({ id: n.id, content: n.content, title: n.title ?? null })))
  const [editingId, setEditingId]   = useState<string | null>(null)
  const [draftContent, setDraft]    = useState('')
  const [savingId, setSavingId]     = useState<string | null>(null)
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null)
  const [draftTitle, setDraftTitle]         = useState('')
  const [hoveredId, setHoveredId]           = useState<string | null>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)

  // Sync items when server re-renders after refresh
  useEffect(() => {
    setItems(notes.map(n => ({ id: n.id, content: n.content, title: n.title ?? null })))
  }, [notes])

  // Auto-focus title input when entering title edit mode
  useEffect(() => {
    if (editingTitleId) titleInputRef.current?.focus()
  }, [editingTitleId])

  // Auto-focus + auto-size the textarea when a note enters edit mode
  useEffect(() => {
    if (editingId && textareaRef.current) {
      const el = textareaRef.current
      el.focus()
      el.setSelectionRange(el.value.length, el.value.length)
      el.style.height = 'auto'
      el.style.height = el.scrollHeight + 'px'
    }
  }, [editingId])

  // ── Open a note for editing ────────────────────────────────────────────────

  function startEditing(item: NoteItem) {
    setEditingId(item.id)
    setDraft(item.content)
  }

  // ── Auto-grow textarea ─────────────────────────────────────────────────────

  function autoGrow(el: HTMLTextAreaElement) {
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }

  // ── Save on blur ───────────────────────────────────────────────────────────

  async function handleBlur() {
    if (!editingId) return
    const id = editingId
    const content = draftContent

    setEditingId(null)

    const isTemp = id.startsWith('temp-')

    if (isTemp) {
      if (!content.trim()) {
        // Discard empty unsaved note
        setItems(prev => prev.filter(n => n.id !== id))
        return
      }
      // Create in DB
      setSavingId(id)
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contextId, content }),
      })
      const real = await res.json()
      setItems(prev => prev.map(n => n.id === id ? { id: real.id, content, title: null } : n))
      setSavingId(null)
      router.refresh()
    } else {
      // Update existing note
      setItems(prev => prev.map(n => n.id === id ? { ...n, content } : n))
      setSavingId(id)
      await fetch(`/api/notes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, updatedAt: new Date().toISOString() }),
      })
      setSavingId(null)
      router.refresh()
    }
  }

  // ── Title editing ──────────────────────────────────────────────────────────

  function startEditingTitle(e: React.MouseEvent, item: NoteItem) {
    e.stopPropagation()
    setEditingTitleId(item.id)
    setDraftTitle(item.title ?? '')
  }

  async function handleTitleBlur() {
    if (!editingTitleId) return
    const id = editingTitleId
    const title = draftTitle.trim() || null
    setEditingTitleId(null)
    if (title === items.find(n => n.id === id)?.title) return
    setItems(prev => prev.map(n => n.id === id ? { ...n, title } : n))
    if (!id.startsWith('temp-')) {
      await fetch(`/api/notes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })
      router.refresh()
    }
  }

  // ── Add new note ───────────────────────────────────────────────────────────

  function addNote() {
    const tempId = `temp-${Date.now()}`
    setItems(prev => [...prev, { id: tempId, content: '', title: null }])
    setEditingId(tempId)
    setDraft('')
  }

  // ── Delete note ────────────────────────────────────────────────────────────

  async function deleteNote(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    if (editingId === id) setEditingId(null)
    setItems(prev => prev.filter(n => n.id !== id))
    if (!id.startsWith('temp-')) {
      await fetch(`/api/notes/${id}`, { method: 'DELETE' })
      router.refresh()
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

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
        <FileText size={14} strokeWidth={1.5} style={{ color }} />
        <span style={{ fontSize: 13, fontWeight: 500 }}>Notes</span>
        <button
          onClick={addNote}
          style={{
            marginLeft: 'auto', background: 'none', border: 'none',
            color: 'hsl(var(--muted-foreground))', fontSize: 12, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 3, padding: '2px 4px',
          }}
        >
          <Plus size={11} strokeWidth={2} />
          New note
        </button>
      </div>

      {/* Body */}
      {items.length === 0 ? (
        <div
          onClick={addNote}
          style={{ padding: '14px 16px', cursor: 'text' }}
        >
          <span style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))' }}>
            No notes yet — click to add one
          </span>
        </div>
      ) : (
        <div className="notes-body">
          {items.map((item, i) => {
            const isEditing = editingId === item.id
            const isSaving = savingId === item.id
            const isLast = i === items.length - 1

            return (
              <div
                key={item.id}
                style={{
                  borderBottom: isLast ? 'none' : '0.5px solid hsl(var(--border))',
                  position: 'relative',
                }}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {isEditing ? (
                  <div style={{ padding: '12px 16px' }}>
                    {/* Title input in edit mode */}
                    {editingTitleId === item.id ? (
                      <input
                        ref={titleInputRef}
                        value={draftTitle}
                        onChange={e => setDraftTitle(e.target.value)}
                        onBlur={handleTitleBlur}
                        onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); if (e.key === 'Escape') setEditingTitleId(null) }}
                        placeholder="Note title"
                        style={{
                          width: '100%', boxSizing: 'border-box',
                          background: 'none', border: 'none', outline: 'none',
                          fontSize: 15, fontWeight: 600, marginBottom: 6,
                          color: 'hsl(var(--foreground))',
                          fontFamily: 'inherit', padding: 0,
                        }}
                      />
                    ) : item.title ? (
                      <div
                        onClick={e => startEditingTitle(e, item)}
                        style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, cursor: 'text' }}
                      >
                        {item.title}
                      </div>
                    ) : (
                      <div
                        onClick={e => startEditingTitle(e, item)}
                        style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', marginBottom: 6, cursor: 'text' }}
                      >
                        + Add title
                      </div>
                    )}
                    <textarea
                      ref={textareaRef}
                      value={draftContent}
                      onChange={e => { setDraft(e.target.value); autoGrow(e.target) }}
                      onBlur={handleBlur}
                      onInput={e => autoGrow(e.currentTarget)}
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        background: 'hsl(var(--background))',
                        border: '0.5px solid hsl(var(--border))',
                        borderRadius: 7,
                        padding: '8px 10px',
                        fontSize: 13, lineHeight: 1.7,
                        color: 'hsl(var(--foreground))',
                        resize: 'none', outline: 'none',
                        fontFamily: 'inherit',
                        minHeight: 80,
                        display: 'block',
                        overflow: 'hidden',
                      }}
                      placeholder="Write something…"
                    />
                    {isSaving && (
                      <span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', marginTop: 4, display: 'block' }}>
                        Saving…
                      </span>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => startEditing(item)}
                    style={{
                      padding: '12px 40px 12px 16px',
                      cursor: 'text',
                      position: 'relative',
                    }}
                  >
                    {/* Title in view mode */}
                    {editingTitleId === item.id ? (
                      <input
                        ref={titleInputRef}
                        value={draftTitle}
                        onChange={e => setDraftTitle(e.target.value)}
                        onBlur={handleTitleBlur}
                        onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); if (e.key === 'Escape') setEditingTitleId(null) }}
                        onClick={e => e.stopPropagation()}
                        placeholder="Note title"
                        style={{
                          width: '100%', boxSizing: 'border-box',
                          background: 'none', border: 'none', outline: 'none',
                          fontSize: 15, fontWeight: 600, marginBottom: 4,
                          color: 'hsl(var(--foreground))',
                          fontFamily: 'inherit', padding: 0, display: 'block',
                        }}
                      />
                    ) : item.title ? (
                      <div
                        onClick={e => startEditingTitle(e, item)}
                        style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, cursor: 'text' }}
                      >
                        {item.title}
                      </div>
                    ) : hoveredId === item.id ? (
                      <div
                        onClick={e => startEditingTitle(e, item)}
                        style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', marginBottom: 4, cursor: 'text', opacity: 0.6 }}
                      >
                        + Add title
                      </div>
                    ) : null}
                    <div style={{
                      fontSize: 13, lineHeight: 1.7,
                      color: item.content ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}>
                      {item.content || 'Empty note'}
                    </div>
                    {isSaving && (
                      <span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', marginTop: 2, display: 'block' }}>
                        Saving…
                      </span>
                    )}
                  </div>
                )}

                {/* Delete button */}
                {!isEditing && (
                  <button
                    className="notes-delete-btn"
                    onClick={e => deleteNote(e, item.id)}
                    style={{
                      position: 'absolute', top: 10, right: 10,
                      background: 'none', border: 'none', padding: 4,
                      color: 'hsl(var(--muted-foreground))',
                      cursor: 'pointer', borderRadius: 4,
                      display: 'flex', alignItems: 'center',
                      opacity: 0.5,
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.5' }}
                  >
                    <Trash2 size={12} strokeWidth={1.5} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
