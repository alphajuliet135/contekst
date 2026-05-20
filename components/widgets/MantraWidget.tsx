'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Quote } from 'lucide-react'

interface Props {
  initialText: string | null
  contextId: string
  color: string
}

export function MantraWidget({ initialText, contextId, color }: Props) {
  const router = useRouter()
  const [text, setText]       = useState(initialText ?? '')
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft]     = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { setText(initialText ?? '') }, [initialText])

  useEffect(() => {
    if (isEditing) textareaRef.current?.focus()
  }, [isEditing])

  function startEditing() {
    setDraft(text)
    setIsEditing(true)
  }

  async function handleBlur() {
    setIsEditing(false)
    const trimmed = draft.trim()
    if (trimmed === text) return
    setText(trimmed)
    await fetch('/api/widgets', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contextId, widgetType: 'mantra', settings: { text: trimmed } }),
    })
    router.refresh()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Escape') { setIsEditing(false); setDraft(text) }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); e.currentTarget.blur() }
  }

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
        <Quote size={14} strokeWidth={1.5} style={{ color }} />
        <span style={{ fontSize: 13, fontWeight: 500 }}>Mantra</span>
      </div>

      {/* Body */}
      <div
        style={{ padding: '16px 20px', minHeight: 64, cursor: isEditing ? 'default' : 'text' }}
        onClick={() => { if (!isEditing) startEditing() }}
      >
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            rows={2}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'none', border: 'none', outline: 'none', resize: 'none',
              fontSize: 15, lineHeight: 1.6, fontStyle: 'italic',
              color: 'hsl(var(--foreground))',
              fontFamily: 'inherit', padding: 0,
            }}
          />
        ) : text ? (
          <p style={{
            margin: 0, fontSize: 15, lineHeight: 1.6,
            fontStyle: 'italic', color: 'hsl(var(--foreground))',
            textAlign: 'center',
          }}>
            {text}
          </p>
        ) : (
          <p style={{
            margin: 0, fontSize: 13,
            color: 'hsl(var(--muted-foreground))',
            textAlign: 'center',
          }}>
            Click to add a mantra…
          </p>
        )}
      </div>
    </div>
  )
}
