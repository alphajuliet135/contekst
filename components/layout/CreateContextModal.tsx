'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'

const COLORS = [
  '#378ADD', '#3DA05E', '#D4883A', '#8B7EC8',
  '#D95F5F', '#5EA8C8', '#CF6B8C', '#5EC8A8',
  '#C2A02E', '#6B8BC8', '#C27B2E', '#8B8CC8',
]

interface Props {
  onClose: () => void
}

export function CreateContextModal({ onClose }: Props) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [type, setType] = useState<'macro' | 'micro'>('macro')
  const [color, setColor] = useState(COLORS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/contexts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), type, color }),
      })
      if (!res.ok) throw new Error()
      router.refresh()
      onClose()
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const canSubmit = name.trim().length > 0 && !loading

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          zIndex: 100,
        }}
      />

      {/* Dialog */}
      <div style={{
        position: 'fixed',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 101,
        width: 400,
        maxWidth: 'calc(100vw - 32px)',
        background: 'hsl(var(--card))',
        border: '0.5px solid hsl(var(--border))',
        borderRadius: 14,
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6)',
      }}>
        <form onSubmit={submit}>
          {/* Header */}
          <div style={{
            padding: '18px 20px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: '0.5px solid hsl(var(--border))',
          }}>
            <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.2 }}>
              New context
            </span>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none', border: 'none',
                color: 'hsl(var(--muted-foreground))',
                cursor: 'pointer', padding: 4, borderRadius: 5,
                display: 'flex', alignItems: 'center',
              }}
            >
              <X size={16} strokeWidth={2} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '20px 20px 0' }}>
            {/* Name */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'hsl(var(--muted-foreground))', marginBottom: 6 }}>
                Name
              </label>
              <input
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Work, Health, Side project"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'hsl(var(--background))',
                  border: '0.5px solid hsl(var(--border))',
                  borderRadius: 8, padding: '9px 12px',
                  fontSize: 14, color: 'hsl(var(--foreground))',
                  outline: 'none',
                }}
              />
            </div>

            {/* Type toggle */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'hsl(var(--muted-foreground))', marginBottom: 6 }}>
                Type
              </label>
              <div style={{
                display: 'flex',
                background: 'hsl(var(--muted))',
                borderRadius: 8, padding: 3,
              }}>
                {(['macro', 'micro'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    style={{
                      flex: 1, padding: '7px 0',
                      borderRadius: 6, border: 'none',
                      background: type === t ? 'hsl(var(--card))' : 'transparent',
                      color: type === t ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                      fontSize: 13, fontWeight: type === t ? 500 : 400,
                      cursor: 'pointer',
                      boxShadow: type === t ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
                    }}
                  >
                    {t === 'macro' ? 'Macro' : 'Micro'}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', marginTop: 6, marginBottom: 0 }}>
                {type === 'macro'
                  ? 'Full dashboard — for contexts that need regular attention'
                  : 'Compact card — for contexts that tick along in the background'}
              </p>
            </div>

            {/* Colour swatches */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, color: 'hsl(var(--muted-foreground))', marginBottom: 8 }}>
                Colour
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    title={c}
                    style={{
                      width: '100%', aspectRatio: '1',
                      borderRadius: 8,
                      border: color === c ? '2.5px solid white' : '2px solid transparent',
                      background: c,
                      cursor: 'pointer',
                      outline: 'none',
                      boxShadow: color === c ? `0 0 0 1px ${c}` : 'none',
                    }}
                  />
                ))}
              </div>
            </div>

            {error && (
              <p style={{ fontSize: 12, color: '#d95f5f', marginBottom: 16, marginTop: 0 }}>{error}</p>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '16px 20px 20px',
            display: 'flex', justifyContent: 'flex-end', gap: 8,
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px', borderRadius: 8,
                border: '0.5px solid hsl(var(--border))',
                background: 'transparent',
                fontSize: 13, color: 'hsl(var(--muted-foreground))',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                padding: '8px 18px', borderRadius: 8,
                border: 'none',
                background: canSubmit ? color : 'hsl(var(--muted))',
                color: canSubmit ? 'white' : 'hsl(var(--muted-foreground))',
                fontSize: 13, fontWeight: 500,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
              }}
            >
              {loading ? 'Creating…' : 'Create context'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
