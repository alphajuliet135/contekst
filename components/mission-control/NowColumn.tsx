'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Priority } from '@/lib/types'
import { TodoCheckbox } from '@/components/ui/TodoCheckbox'

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"

const BADGE_BASE: React.CSSProperties = {
  borderRadius: 5, padding: '1px 7px', fontSize: 11, fontWeight: 500,
  flexShrink: 0, whiteSpace: 'nowrap',
}
const BADGE: Record<Priority, React.CSSProperties> = {
  high:   { background: 'rgba(212,136,58,0.18)',  color: '#d4883a', border: '1px solid rgba(212,136,58,0.25)' },
  medium: { background: 'rgba(143,143,143,0.15)', color: '#8F8F8F', border: '1px solid rgba(143,143,143,0.2)' },
  low:    { background: 'rgba(100,100,100,0.12)',  color: '#6B6B6B', border: '1px solid rgba(100,100,100,0.15)' },
}

export interface TodoWithCtx {
  id: string
  title: string
  priority: Priority
  dueDate?: string | null
  contextName: string
  contextColor: string
}

interface Props {
  overdue: TodoWithCtx[]
  dueToday: TodoWithCtx[]
}

export function NowColumn({ overdue: initialOverdue, dueToday: initialDueToday }: Props) {
  const router = useRouter()
  const [overdue, setOverdue] = useState(initialOverdue)
  const [dueToday, setDueToday] = useState(initialDueToday)

  useEffect(() => { setOverdue(initialOverdue) }, [initialOverdue])
  useEffect(() => { setDueToday(initialDueToday) }, [initialDueToday])

  async function markDone(id: string) {
    setOverdue(prev => prev.filter(t => t.id !== id))
    setDueToday(prev => prev.filter(t => t.id !== id))
    await fetch(`/api/todos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: true, completedAt: new Date().toISOString() }),
    })
    router.refresh()
  }

  const total = overdue.length + dueToday.length
  if (total === 0) return null

  return (
    <div style={{
      background: 'hsl(var(--card))',
      border: '0.5px solid hsl(var(--border))',
      borderRadius: 14,
      boxShadow: '0 1px 2px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 18px', borderBottom: '0.5px solid hsl(var(--border))', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0, letterSpacing: -0.2 }}>Now</h2>
          <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>What needs your attention right now</span>
        </div>
        <span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', fontFamily: MONO }}>{total} item{total !== 1 ? 's' : ''}</span>
      </div>

      {/* Overdue group */}
      {overdue.length > 0 && (
        <div style={{ padding: '14px 18px 6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#d95f5f', flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: '#d95f5f', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 500 }}>Overdue</span>
          </div>
          {overdue.map((t, i) => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderTop: i > 0 ? '0.5px solid hsl(var(--muted))' : 'none' }}>
              <TodoCheckbox todoId={t.id} color={t.contextColor} size={14} />
              <span style={{ flex: 1, fontSize: 14, cursor: 'pointer' }} onClick={() => markDone(t.id)}>{t.title}</span>
              <span style={{ ...BADGE_BASE, ...BADGE[t.priority] }}>{t.priority === 'high' ? 'High' : t.priority === 'medium' ? 'Med' : 'Low'}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 96, flexShrink: 0 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.contextColor }} />
                <span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.contextName}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Due today group */}
      {dueToday.length > 0 && (
        <div style={{ padding: '14px 18px 16px', borderTop: overdue.length > 0 ? '0.5px solid hsl(var(--muted))' : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#d4883a', flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: '#d4883a', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 500 }}>Due today</span>
          </div>
          {dueToday.map((t, i) => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderTop: i > 0 ? '0.5px solid hsl(var(--muted))' : 'none' }}>
              <div style={{ marginTop: 3 }}>
                <TodoCheckbox todoId={t.id} color={t.contextColor} size={14} />
              </div>
              <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => markDone(t.id)}>
                <div style={{ fontSize: 14, lineHeight: 1.3 }}>{t.title}</div>
              </div>
              <span style={{ ...BADGE_BASE, ...BADGE[t.priority], marginTop: 2 }}>{t.priority === 'high' ? 'High' : t.priority === 'medium' ? 'Med' : 'Low'}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 96, flexShrink: 0, marginTop: 3 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.contextColor }} />
                <span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.contextName}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
