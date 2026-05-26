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

const SECTIONS: { label: string; widgetType: string }[] = [
  { label: 'Priorities',  widgetType: 'todos'   },
  { label: 'Ahead',       widgetType: 'dates'   },
  { label: 'Notes',       widgetType: 'notes'   },
  { label: 'Habits',      widgetType: 'habits'  },
  { label: 'Links',       widgetType: 'links'   },
  { label: 'People',      widgetType: 'people'  },
  { label: 'Mantra',      widgetType: 'mantra'  },
]

interface Props {
  contextId: string
  name: string
  color: string
  type: 'macro' | 'micro'
  description: string | null
  sectionEnabled: Record<string, boolean>
}

export function MacroHeroActions({ contextId, name, color, type, description, sectionEnabled }: Props) {
  const router = useRouter()
  const [editing, setEditing]         = useState(false)
  const [editName, setEditName]       = useState(name)
  const [editDesc, setEditDesc]       = useState(description ?? '')
  const [editColor, setEditColor]     = useState(color)
  const [saving, setSaving]           = useState(false)
  const [layoutOpen, setLayoutOpen]   = useState(false)
  const [localEnabled, setLocalEnabled] = useState(sectionEnabled)

  async function toggleSection(widgetType: string) {
    const next = !localEnabled[widgetType]
    setLocalEnabled(prev => ({ ...prev, [widgetType]: next }))
    await fetch('/api/widgets', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contextId, widgetType, enabled: next }),
    })
    router.refresh()
  }

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
      body: JSON.stringify({ name: editName.trim(), color: editColor, description: editDesc.trim() || null }),
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

  const btnStyle = (c: string): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '5px 10px', borderRadius: 7,
    border: `0.5px solid ${colorTint(c, 0.3)}`,
    background: colorTint(c, 0.08),
    fontSize: 12, color: 'hsl(var(--foreground))',
    cursor: 'pointer', whiteSpace: 'nowrap',
  })

  return (
    <>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={openEdit} style={btnStyle(color)}>
          <Pencil size={11} strokeWidth={1.75} />
          Edit context
        </button>
        <button
          onClick={() => moveTo(type === 'macro' ? 'micro' : 'macro')}
          style={btnStyle(color)}
        >
          {type === 'macro' ? 'Move to Micro' : 'Promote to Macro'}
        </button>
        <button onClick={() => { setLocalEnabled(sectionEnabled); setLayoutOpen(true) }} style={btnStyle(color)}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          Edit layout
        </button>
      </div>

      {/* Edit layout modal */}
      {layoutOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setLayoutOpen(false) }}
        >
          <div style={{
            background: 'hsl(var(--card))',
            border: '0.5px solid hsl(var(--border))',
            borderRadius: 14, padding: 24,
            width: '100%', maxWidth: 360,
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 8px' }}>Edit layout</h2>
            {SECTIONS.map(s => {
              const on = localEnabled[s.widgetType] ?? (s.widgetType !== 'mantra')
              return (
                <div
                  key={s.widgetType}
                  onClick={() => toggleSection(s.widgetType)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                    background: on ? colorTint(color, 0.08) : 'transparent',
                    border: `0.5px solid ${on ? colorTint(color, 0.25) : 'hsl(var(--border))'}`,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{s.label}</span>
                  <div style={{
                    width: 32, height: 18, borderRadius: 9, position: 'relative',
                    background: on ? color : 'hsl(var(--muted))',
                    transition: 'background 0.15s', flexShrink: 0,
                  }}>
                    <span style={{
                      position: 'absolute', top: 3, left: on ? 15 : 3,
                      width: 12, height: 12, borderRadius: '50%', background: 'white',
                      transition: 'left 0.15s',
                    }} />
                  </div>
                </div>
              )
            })}
            <button
              onClick={() => setLayoutOpen(false)}
              style={{
                marginTop: 8, padding: '7px 16px', borderRadius: 7, border: 'none',
                background: color, color: 'white', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setEditing(false) }}
        >
          <div style={{
            background: 'hsl(var(--card))',
            border: '0.5px solid hsl(var(--border))',
            borderRadius: 14, padding: 24,
            width: '100%', maxWidth: 420,
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Edit context</h2>

            <input
              autoFocus
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditing(false) }}
              placeholder="Context name"
              style={{
                background: 'rgba(0,0,0,0.15)', border: '0.5px solid rgba(255,255,255,0.15)',
                borderRadius: 8, padding: '8px 12px', fontSize: 15, fontWeight: 600,
                color: 'hsl(var(--foreground))', outline: 'none', width: '100%', boxSizing: 'border-box',
              }}
            />

            <textarea
              value={editDesc}
              onChange={e => setEditDesc(e.target.value)}
              placeholder="Short description (optional)"
              rows={2}
              style={{
                background: 'rgba(0,0,0,0.12)', border: '0.5px solid rgba(255,255,255,0.12)',
                borderRadius: 8, padding: '7px 12px', fontSize: 13,
                color: 'hsl(var(--foreground))', outline: 'none', resize: 'none',
                fontFamily: 'inherit', width: '100%', boxSizing: 'border-box', lineHeight: 1.5,
              }}
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 6 }}>
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setEditColor(c)}
                  style={{
                    width: '100%', aspectRatio: '1', borderRadius: 6, cursor: 'pointer', outline: 'none',
                    border: editColor === c ? '2.5px solid white' : '2px solid transparent',
                    background: c,
                    boxShadow: editColor === c ? `0 0 0 1px ${c}` : 'none',
                  }}
                />
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
              <button
                onClick={() => setEditing(false)}
                style={{
                  padding: '6px 14px', borderRadius: 7,
                  border: '0.5px solid rgba(255,255,255,0.2)',
                  background: 'transparent', fontSize: 12,
                  color: 'hsl(var(--muted-foreground))', cursor: 'pointer',
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
        </div>
      )}
    </>
  )
}
