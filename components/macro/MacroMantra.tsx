'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { colorTint } from '@/lib/utils'

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"

interface Props {
  contextId: string
  color: string
  mantraText: string | null
}

export function MacroMantra({ contextId, color, mantraText }: Props) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(mantraText ?? '')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function save() {
    setEditing(false)
    const trimmed = text.trim()
    await fetch('/api/widgets', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contextId,
        widgetType: 'mantra',
        settings: { text: trimmed || null },
      }),
    })
    router.refresh()
  }

  function startEdit() {
    setText(mantraText ?? '')
    setEditing(true)
    setTimeout(() => textareaRef.current?.focus(), 0)
  }

  if (editing) {
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, margin: '16px 0 18px' }}>
        <span style={{ width: 3, alignSelf: 'stretch', background: color, opacity: 0.6, borderRadius: 1.5, flexShrink: 0, minHeight: 22 }} />
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onBlur={save}
          onKeyDown={e => { if (e.key === 'Escape') save() }}
          placeholder="Write a mantra…"
          style={{
            flex: 1, fontSize: 15, color: 'hsl(var(--foreground))', fontStyle: 'italic',
            lineHeight: 1.5, letterSpacing: -0.1,
            background: 'none', border: 'none', outline: 'none', resize: 'none',
            fontFamily: 'inherit', minHeight: 44,
          }}
        />
      </div>
    )
  }

  if (mantraText) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={startEdit}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') startEdit() }}
        style={{ display: 'flex', alignItems: 'flex-start', gap: 12, margin: '16px 0 18px', cursor: 'text' }}
      >
        <span style={{ width: 3, alignSelf: 'stretch', background: color, opacity: 0.6, borderRadius: 1.5, flexShrink: 0, minHeight: 22 }} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 15, color: 'hsl(var(--foreground))', fontStyle: 'italic', lineHeight: 1.5, letterSpacing: -0.1 }}>
            {mantraText}
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 10, fontFamily: MONO, color: 'hsl(var(--muted-foreground))', letterSpacing: 0.8, textTransform: 'uppercase' }}>
            Mantra · pinned
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={startEdit}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') startEdit() }}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0 18px',
        cursor: 'pointer', padding: '8px 10px', borderRadius: 7,
        border: `0.5px dashed ${colorTint(color, 0.3)}`,
        background: colorTint(color, 0.04),
      }}
    >
      <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>Add a mantra…</span>
    </div>
  )
}
