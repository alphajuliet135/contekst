'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { WidgetDashboard } from '@/components/widgets/WidgetDashboard'
import type { WidgetType, Todo, DateEvent, Note, Habit, HabitLog, Link, Person } from '@/lib/types'

interface DashboardData {
  contextId: string
  contextColor: string
  orderedEnabledTypes: WidgetType[]
  initialEnabled: Record<WidgetType, boolean>
  widgetSettings: Partial<Record<WidgetType, Record<string, unknown>>>
  todos: Todo[]
  dates: DateEvent[]
  notes: Note[]
  habits: Habit[]
  todayLogs: HabitLog[]
  links: Link[]
  people: Person[]
  mantraText: string | null
}

interface Props {
  contextId: string
  contextName: string
  contextColor: string
  onClose: () => void
}

export function MicroContextModal({ contextId, contextName, contextColor, onClose }: Props) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(`/api/contexts/${contextId}/dashboard`)
      .then(res => {
        if (!res.ok) throw new Error('Failed')
        return res.json()
      })
      .then((d: DashboardData) => { setData(d); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [contextId])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0, 0, 0, 0.55)',
          zIndex: 200,
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '5vh', left: '50%', transform: 'translateX(-50%)',
        width: 'min(92vw, 1100px)',
        height: '88vh',
        zIndex: 201,
        background: 'hsl(var(--background))',
        border: '0.5px solid hsl(var(--border))',
        borderRadius: 16,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
      }}>
        {/* Modal header */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '0.5px solid hsl(var(--border))',
          display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: contextColor, flexShrink: 0 }} />
          <span style={{ fontSize: 15, fontWeight: 600, flex: 1 }}>{contextName}</span>
          <span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>Micro context</span>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'hsl(var(--muted-foreground))', display: 'flex', padding: 4,
              borderRadius: 6,
            }}
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {loading && (
            <div style={{ padding: 40, textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
              Loading…
            </div>
          )}
          {error && (
            <div style={{ padding: 40, textAlign: 'center', color: 'hsl(var(--muted-foreground))' }}>
              Failed to load context data.
            </div>
          )}
          {data && (
            <WidgetDashboard
              contextId={data.contextId}
              contextColor={data.contextColor}
              orderedEnabledTypes={data.orderedEnabledTypes}
              initialEnabled={data.initialEnabled}
              widgetSettings={data.widgetSettings}
              todos={data.todos}
              dates={data.dates}
              notes={data.notes}
              habits={data.habits}
              todayLogs={data.todayLogs}
              links={data.links}
              people={data.people}
              mantraText={data.mantraText}
            />
          )}
        </div>
      </div>
    </>
  )
}
