'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { colorTint } from '@/lib/utils'

const COLORS = [
  '#378ADD', '#3DA05E', '#D4883A', '#8B7EC8',
  '#D95F5F', '#5EA8C8', '#CF6B8C', '#5EC8A8',
  '#C2A02E', '#6B8BC8', '#C27B2E', '#8B8CC8',
]

interface Props {
  contextId: string
  name: string
  color: string
  type: 'macro' | 'micro'
  description: string | null
  meta: string
}

export function ContextHeader({ contextId, name, color, type, description, meta }: Props) {
  const router = useRouter()

  const [editing, setEditing]     = useState(false)
  const [editName, setEditName]   = useState(name)
  const [editDesc, setEditDesc]   = useState(description ?? '')
  const [editColor, setEditColor] = useState(color)
  const [saving, setSaving]       = useState(false)

  function openEdit() {
    setEditName(name)
    setEditDesc(description ?? '')
    setEditColor(color)
    setEditing(true)
  }

  async function saveEdit() {
    if (!editName.trim()) return
    setSaving(true)
    await fetch(`/api/contexts/${contextId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editName.trim(),
        color: editColor,
        description: editDesc.trim() || null,
      }),
    })
    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  async function moveTo(target: 'micro' | 'macro') {
    await fetch(`/api/contexts/${contextId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: target }),
    })
    router.push(target === 'micro' ? '/micro' : `/ctx/${contextId}`)
    router.refresh()
  }

  return (
    <div style={{
      background: colorTint(editing ? editColor : color, 0.12),
      borderBottom: `0.5px solid ${colorTint(editing ? editColor : color, 0.25)}`,
      padding: '20px 40px',
      flexShrink: 0,
    }}>
      {editing ? (
        /* ── Edit mode ─────────────────────────────────────── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Name */}
          <input
            autoFocus
            value={editName}
            onChange={e => setEditName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(false) }}
            placeholder="Context name"
            style={{
              background: 'rgba(0,0,0,0.15)',
              border: '0.5px solid rgba(255,255,255,0.15)',
              borderRadius: 8, padding: '8px 12px',
              fontSize: 20, fontWeight: 600, letterSpacing: -0.3,
              color: 'hsl(var(--foreground))', outline: 'none', width: '100%', boxSizing: 'border-box',
            }}
          />

          {/* Description */}
          <textarea
            value={editDesc}
            onChange={e => setEditDesc(e.target.value)}
            placeholder="Short description (optional)"
            rows={2}
            style={{
              background: 'rgba(0,0,0,0.12)',
              border: '0.5px solid rgba(255,255,255,0.12)',
              borderRadius: 8, padding: '7px 12px',
              fontSize: 13, color: 'hsl(var(--foreground))',
              outline: 'none', resize: 'none', fontFamily: 'inherit',
              width: '100%', boxSizing: 'border-box', lineHeight: 1.5,
            }}
          />

          {/* Colour swatches */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 6 }}>
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setEditColor(c)}
                style={{
                  width: '100%', aspectRatio: '1',
                  borderRadius: 6,
                  border: editColor === c ? '2.5px solid white' : '2px solid transparent',
                  background: c, cursor: 'pointer', outline: 'none',
                  boxShadow: editColor === c ? `0 0 0 1px ${c}` : 'none',
                }}
              />
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setEditing(false)}
              style={{
                padding: '6px 14px', borderRadius: 7,
                border: '0.5px solid rgba(255,255,255,0.2)',
                background: 'transparent',
                fontSize: 12, color: 'hsl(var(--muted-foreground))', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={saveEdit}
              disabled={!editName.trim() || saving}
              style={{
                padding: '6px 16px', borderRadius: 7, border: 'none',
                background: editColor, color: 'white',
                fontSize: 12, fontWeight: 500, cursor: 'pointer',
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        /* ── Normal mode ───────────────────────────────────── */
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
              <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: -0.4, margin: 0 }}>
                {name}
              </h1>
            </div>
            <p style={{ fontSize: 13, color: color, margin: 0, paddingLeft: 20, opacity: 0.9 }}>
              {meta || 'Macro context'}
            </p>
            {description && (
              <p style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))', margin: '4px 0 0', paddingLeft: 20 }}>
                {description}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, marginTop: 4 }}>
            <button
              onClick={openEdit}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 10px', borderRadius: 7,
                border: `0.5px solid ${colorTint(color, 0.35)}`,
                background: colorTint(color, 0.08),
                fontSize: 12, color: 'hsl(var(--muted-foreground))', cursor: 'pointer',
              }}
            >
              <Pencil size={11} strokeWidth={1.75} />
              Edit
            </button>
            <button
              onClick={() => moveTo(type === 'macro' ? 'micro' : 'macro')}
              style={{
                padding: '5px 12px', borderRadius: 7,
                border: `0.5px solid ${colorTint(color, 0.35)}`,
                background: colorTint(color, 0.08),
                fontSize: 12, color: 'hsl(var(--muted-foreground))', cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {type === 'macro' ? 'Move to Micro' : 'Promote to Macro'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
