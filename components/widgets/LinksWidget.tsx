'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Link2, ExternalLink, Plus, Trash2 } from 'lucide-react'
import type { Link } from '@/lib/types'

interface LinkItem {
  id: string
  title: string
  url: string
}

interface Props {
  links: Link[]
  color: string
  contextId: string
}

function normalizeUrl(url: string): string {
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    return 'https://' + url
  }
  return url
}

export function LinksWidget({ links, color, contextId }: Props) {
  const router = useRouter()
  const titleRef = useRef<HTMLInputElement>(null)

  const [items, setItems]         = useState<LinkItem[]>(links.map(l => ({ id: l.id, title: l.title, url: l.url })))
  const [showForm, setShowForm]   = useState(false)
  const [newTitle, setNewTitle]   = useState('')
  const [newUrl, setNewUrl]       = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setItems(links.map(l => ({ id: l.id, title: l.title, url: l.url })))
  }, [links])

  useEffect(() => { if (showForm) titleRef.current?.focus() }, [showForm])

  // ── Add link ───────────────────────────────────────────────────────────────

  async function handleAdd() {
    const title = newTitle.trim()
    const url = normalizeUrl(newUrl.trim())
    if (!title || !url || submitting) return
    setSubmitting(true)
    const tempId = `temp-${Date.now()}`
    setItems(prev => [...prev, { id: tempId, title, url }])
    setShowForm(false); setNewTitle(''); setNewUrl(''); setSubmitting(false)
    await fetch('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contextId, title, url }),
    })
    router.refresh()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleAdd()
    if (e.key === 'Escape') { setShowForm(false); setNewTitle(''); setNewUrl('') }
  }

  // ── Delete link ────────────────────────────────────────────────────────────

  async function deleteLink(e: React.MouseEvent, id: string) {
    e.preventDefault()
    e.stopPropagation()
    setItems(prev => prev.filter(l => l.id !== id))
    if (!id.startsWith('temp-')) {
      await fetch(`/api/links/${id}`, { method: 'DELETE' })
      router.refresh()
    }
  }

  const canSubmit = newTitle.trim().length > 0 && newUrl.trim().length > 0 && !submitting

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
        <Link2 size={14} strokeWidth={1.5} style={{ color }} />
        <span style={{ fontSize: 13, fontWeight: 500 }}>Links</span>
        {items.length > 0 && (
          <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>{items.length}</span>
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
      {items.length === 0 && !showForm ? (
        <div style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))' }}>No links yet</span>
        </div>
      ) : (
        <div style={{ paddingBottom: showForm ? 0 : 6 }}>
          {items.map(link => (
            <div
              key={link.id}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 16px' }}
            >
              <ExternalLink size={12} strokeWidth={1.5} style={{ color, flexShrink: 0 }} />
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 13, flex: 1, minWidth: 0,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  textDecoration: 'none', color: 'hsl(var(--foreground))',
                }}
              >
                {link.title}
              </a>
              <button
                onClick={e => deleteLink(e, link.id)}
                style={{
                  background: 'none', border: 'none', padding: 3,
                  color: 'hsl(var(--muted-foreground))',
                  cursor: 'pointer', borderRadius: 4,
                  display: 'flex', alignItems: 'center',
                  opacity: 0.4, flexShrink: 0,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.4' }}
              >
                <Trash2 size={11} strokeWidth={1.5} />
              </button>
            </div>
          ))}

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
                onKeyDown={handleKeyDown}
                placeholder="Link title…"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'hsl(var(--background))',
                  border: '0.5px solid hsl(var(--border))',
                  borderRadius: 6, padding: '6px 10px',
                  fontSize: 13, color: 'hsl(var(--foreground))',
                  outline: 'none',
                }}
              />
              <input
                type="text"
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="https://…"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'hsl(var(--background))',
                  border: '0.5px solid hsl(var(--border))',
                  borderRadius: 6, padding: '6px 10px',
                  fontSize: 13, color: 'hsl(var(--foreground))',
                  outline: 'none',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setNewTitle(''); setNewUrl('') }}
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
                  disabled={!canSubmit}
                  style={{
                    border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 500,
                    padding: '4px 12px',
                    background: canSubmit ? color : 'hsl(var(--muted))',
                    color: canSubmit ? 'white' : 'hsl(var(--muted-foreground))',
                    cursor: canSubmit ? 'pointer' : 'default',
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
