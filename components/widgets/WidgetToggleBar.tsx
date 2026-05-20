'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckSquare, Calendar, FileText, Repeat2, Link2, Users, Quote } from 'lucide-react'
import type { WidgetType } from '@/lib/types'
import { colorTint } from '@/lib/utils'

const WIDGETS: { type: WidgetType; label: string; Icon: React.ElementType }[] = [
  { type: 'todos',   label: 'Priorities',     Icon: CheckSquare },
  { type: 'dates',   label: 'Dates',          Icon: Calendar    },
  { type: 'notes',   label: 'Notes',          Icon: FileText    },
  { type: 'habits',  label: 'Habits',         Icon: Repeat2     },
  { type: 'links',   label: 'Links',          Icon: Link2       },
  { type: 'people',  label: 'People',         Icon: Users       },
  { type: 'mantra',  label: 'Mantra',         Icon: Quote       },
]

interface Props {
  contextId: string
  color: string
  initialEnabled: Record<WidgetType, boolean>
}

export function WidgetToggleBar({ contextId, color, initialEnabled }: Props) {
  const router = useRouter()
  const [enabled, setEnabled] = useState(initialEnabled)

  async function toggle(type: WidgetType) {
    const next = !enabled[type]
    setEnabled(prev => ({ ...prev, [type]: next }))
    await fetch('/api/widgets', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contextId, widgetType: type, enabled: next }),
    })
    router.refresh()
  }

  return (
    <div style={{
      position: 'sticky',
      bottom: 0,
      zIndex: 10,
      background: 'hsl(var(--card))',
      borderTop: '0.5px solid hsl(var(--border))',
      padding: '10px 40px',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
    }}>
      <span style={{
        fontSize: 12,
        fontWeight: 500,
        color: 'hsl(var(--muted-foreground))',
        marginRight: 6,
        flexShrink: 0,
      }}>
        Widgets:
      </span>
      {WIDGETS.map(({ type, label, Icon }) => {
        const on = enabled[type]
        return (
          <button
            key={type}
            onClick={() => toggle(type)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 10px',
              borderRadius: 6,
              border: on ? 'none' : '0.5px solid hsl(var(--border))',
              background: on ? colorTint(color, 0.2) : 'transparent',
              fontSize: 12,
              fontWeight: on ? 500 : 400,
              color: on ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
              cursor: 'pointer',
            }}
          >
            <Icon size={11} strokeWidth={on ? 2 : 1.5} />
            {label}
          </button>
        )
      })}
    </div>
  )
}
