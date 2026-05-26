'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { Note } from '@/lib/types'
import { colorTint } from '@/lib/utils'
import { CountPill } from './CountPill'

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"

interface Props {
  notes: Note[]
  color: string
  contextId: string
}

export function MacroNotes({ notes: initialNotes, color, contextId }: Props) {
  const router = useRouter()
  const [localNotes, setLocalNotes] = useState(initialNotes)
  const [selectedId, setSelectedId] = useState<string | null>(initialNotes[0]?.id ?? null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { setLocalNotes(initialNotes) }, [initialNotes])

  // Sync editable fields when selection changes
  useEffect(() => {
    const note = localNotes.find(n => n.id === selectedId)
    if (note) {
      setEditTitle(note.title ?? '')
      setEditContent(note.content ?? '')
    }
  }, [selectedId, localNotes])

  // Set initial selection
  useEffect(() => {
    if (!selectedId && localNotes.length > 0) setSelectedId(localNotes[0].id)
  }, [localNotes])

  function formatAge(updatedAt: string | null) {
    if (!updatedAt) return ''
    const diffMs = Date.now() - new Date(updatedAt).getTime()
    const h = Math.floor(diffMs / 3600000)
    if (h < 1) return 'just now'
    if (h < 24) return `${h}h ago`
    const d = Math.floor(h / 24)
    if (d < 7) return `${d}d ago`
    return `${Math.floor(d / 7)}w ago`
  }

  async function createNote() {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contextId, content: '' }),
    })
    if (res.ok) {
      const created = await res.json()
      setLocalNotes(prev => [created, ...prev])
      setSelectedId(created.id)
    }
    router.refresh()
  }

  async function saveNote(id: string, title: string, content: string) {
    setLocalNotes(prev => prev.map(n => n.id === id ? { ...n, title: title || null, content, updatedAt: new Date().toISOString() } : n))
    await fetch(`/api/notes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title || null, content, updatedAt: new Date().toISOString() }),
    })
    router.refresh()
  }

  const displayNotes = searchQuery
    ? localNotes.filter(n =>
        (n.title ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.content ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : localNotes

  async function deleteNote(id: string) {
    const remaining = localNotes.filter(n => n.id !== id)
    setLocalNotes(remaining)
    const wasSelected = selectedId === id
    if (wasSelected) setSelectedId(remaining[0]?.id ?? null)
    await fetch(`/api/notes/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  const selectedNote = localNotes.find(n => n.id === selectedId) ?? null
  const pinnedNote = localNotes.find(n => n.pinned) ?? localNotes[0] ?? null

  // Phone layout (< 640px via CSS class)
  const phoneLayout = (
    <div className="macro-notes-phone">
      {pinnedNote && (
        <div style={{
          padding: '14px 14px 14px 12px',
          background: colorTint(color, 0.06),
          borderLeft: `2px solid ${color}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            {pinnedNote.pinned && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill={color}><path d="M12 2v6h6l-2 4v6l-4-4-4 4v-6l-2-4h6V2z"/></svg>
            )}
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, flex: 1, letterSpacing: -0.1, fontStyle: !pinnedNote.title ? 'italic' : 'normal' }}>
              {pinnedNote.title || 'Untitled'}
            </h3>
            <span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', fontFamily: MONO }}>{formatAge(pinnedNote.updatedAt)}</span>
          </div>
          <p style={{
            margin: 0, fontSize: 13, lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            display: '-webkit-box', WebkitLineClamp: 6, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          } as React.CSSProperties}>
            {pinnedNote.content || pinnedNote.title || ''}
          </p>
        </div>
      )}
      {localNotes.filter(n => n !== pinnedNote).slice(0, 3).map((n, i) => (
        <div key={n.id} style={{ padding: '11px 14px', borderTop: '0.5px solid hsl(var(--muted))', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500, fontStyle: !n.title ? 'italic' : 'normal', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {n.title || 'Untitled'}
            </div>
            <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
              {n.content}
            </div>
          </div>
          <span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', fontFamily: MONO, flexShrink: 0 }}>{formatAge(n.updatedAt)}</span>
        </div>
      ))}
      {localNotes.length > 4 && (
        <div style={{ padding: '12px 14px', borderTop: '0.5px solid hsl(var(--muted))', fontSize: 12, color, textAlign: 'center', fontWeight: 500 }}>
          See all {localNotes.length} notes
        </div>
      )}
    </div>
  )

  return (
    <div style={{
      background: 'hsl(var(--card))',
      border: '0.5px solid hsl(var(--border))',
      borderRadius: 12, overflow: 'hidden',
      boxShadow: '0 1px 2px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)',
    }}>
      {/* Header */}
      <div style={{ padding: '11px 14px', borderBottom: '0.5px solid hsl(var(--border))', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color, display: 'inline-flex' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
          </svg>
        </span>
        <span style={{ fontSize: 13, fontWeight: 500 }}>Notes</span>
        <CountPill count={localNotes.length} color={color} />
        <div style={{
          marginLeft: 8, display: 'flex', alignItems: 'center', gap: 6,
          padding: '3px 9px', borderRadius: 5,
          background: searchFocused ? 'hsl(var(--card))' : 'hsl(var(--muted))',
          border: searchFocused ? `0.5px solid ${colorTint(color, 0.35)}` : '0.5px solid transparent',
          fontSize: 11, color: 'hsl(var(--muted-foreground))',
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/></svg>
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="Search"
            style={{
              background: 'none', border: 'none', outline: 'none',
              fontSize: 11, color: 'hsl(var(--foreground))', fontFamily: 'inherit',
              width: searchFocused || searchQuery ? 100 : 44,
              transition: 'width 0.15s',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'hsl(var(--muted-foreground))', display: 'flex', lineHeight: 1 }}
            >×</button>
          )}
        </div>
        <button
          title="Add note"
          onClick={createNote}
          style={{ marginLeft: 'auto', fontSize: 12, color, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3, padding: 0 }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>

      {/* Desktop/tablet two-pane */}
      <div className="macro-notes-desktop" style={{ display: 'flex', height: 320 }}>
        {/* Rail */}
        <div style={{
          width: 232, flexShrink: 0,
          borderRight: '0.5px solid hsl(var(--border))',
          overflowY: 'auto',
          background: 'rgba(255,255,255,0.015)',
        }}>
          {displayNotes.length === 0 ? (
            <div style={{ padding: '14px 12px', fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>
              {searchQuery ? 'No results.' : 'No notes yet.'}
            </div>
          ) : (
            displayNotes.map((n, i) => {
              const active = n.id === selectedId
              return (
                <div
                  key={n.id}
                  onClick={() => setSelectedId(n.id)}
                  style={{
                    padding: '9px 12px', cursor: 'pointer',
                    borderTop: i > 0 ? '0.5px solid hsl(var(--muted))' : 'none',
                    background: active ? colorTint(color, 0.12) : 'transparent',
                    borderLeft: active ? `2px solid ${color}` : '2px solid transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                    {n.pinned && (
                      <svg width="8" height="8" viewBox="0 0 24 24" fill={color}><path d="M12 2v6h6l-2 4v6l-4-4-4 4v-6l-2-4h6V2z"/></svg>
                    )}
                    <span style={{
                      fontSize: 13, fontWeight: active ? 600 : 500,
                      flex: 1, fontStyle: !n.title ? 'italic' : 'normal',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {n.title || 'Untitled'}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {n.content}
                  </div>
                  <div style={{ fontSize: 10, color: 'hsl(var(--muted-foreground))', fontFamily: MONO, marginTop: 3 }}>
                    {formatAge(n.updatedAt)}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Content pane */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {selectedNote ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  onBlur={() => saveNote(selectedNote.id, editTitle, editContent)}
                  placeholder="Untitled"
                  style={{
                    flex: 1, fontSize: 16, fontWeight: 600, letterSpacing: -0.1,
                    background: 'none', border: 'none', outline: 'none',
                    color: 'hsl(var(--foreground))', fontFamily: 'inherit',
                    fontStyle: !editTitle ? 'italic' : 'normal',
                    minWidth: 0,
                  }}
                />
                {selectedNote.pinned && (
                  <span style={{
                    fontSize: 10, fontFamily: MONO, color, letterSpacing: 0.5,
                    padding: '1px 6px', borderRadius: 3,
                    background: colorTint(color, 0.12), border: `0.5px solid ${colorTint(color, 0.25)}`,
                  }}>
                    PINNED
                  </span>
                )}
                <span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', fontFamily: MONO }}>
                  edited {formatAge(selectedNote.updatedAt)}
                </span>
                <button
                  onClick={() => deleteNote(selectedNote.id)}
                  title="Delete note"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 3,
                    color: 'hsl(var(--muted-foreground))', display: 'flex', alignItems: 'center',
                    borderRadius: 4, marginLeft: 'auto',
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
                  </svg>
                </button>
              </div>
              <textarea
                ref={contentRef}
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                onBlur={() => saveNote(selectedNote.id, editTitle, editContent)}
                placeholder="Start writing…"
                style={{
                  flex: 1, fontSize: 14, lineHeight: 1.65,
                  color: 'hsl(var(--foreground))', whiteSpace: 'pre-wrap',
                  background: 'none', border: 'none', outline: 'none', resize: 'none',
                  fontFamily: 'inherit', minHeight: 200,
                }}
              />
            </>
          ) : (
            <div style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))' }}>Select a note to view it.</div>
          )}
        </div>
      </div>

      {/* Phone layout injected by CSS class — hidden on desktop */}
      <style>{`
        .macro-notes-desktop { display: flex; }
        .macro-notes-phone { display: none; }
        @media (max-width: 640px) {
          .macro-notes-desktop { display: none; }
          .macro-notes-phone { display: block; }
        }
      `}</style>
      <div className="macro-notes-phone" style={{ display: 'none' }}>
        {phoneLayout}
      </div>
    </div>
  )
}
