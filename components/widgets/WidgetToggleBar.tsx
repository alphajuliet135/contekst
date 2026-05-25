'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckSquare, Calendar, FileText, Repeat2, Link2, Users, Quote, Plus, X } from 'lucide-react'
import type { WidgetType, WidgetInstance } from '@/lib/types'
import { colorTint } from '@/lib/utils'

const SINGLE_WIDGETS: { type: WidgetType; label: string; Icon: React.ElementType }[] = [
  { type: 'dates',   label: 'Dates',   Icon: Calendar  },
  { type: 'notes',   label: 'Notes',   Icon: FileText   },
  { type: 'habits',  label: 'Habits',  Icon: Repeat2    },
  { type: 'links',   label: 'Links',   Icon: Link2      },
  { type: 'people',  label: 'People',  Icon: Users      },
  { type: 'mantra',  label: 'Mantra',  Icon: Quote      },
]

interface Props {
  contextId: string
  color: string
  initialEnabled: Record<WidgetType, boolean>
  widgetSettings: Partial<Record<WidgetType, Record<string, unknown>>>
  todosInstances: WidgetInstance[]
  onAddTodosList: (listName: string) => Promise<void>
  onRemoveTodosWidget: (widgetId: string) => Promise<void>
}

export function WidgetToggleBar({
  contextId, color, initialEnabled,
  todosInstances, onAddTodosList, onRemoveTodosWidget,
}: Props) {
  const router = useRouter()
  const [enabled, setEnabled] = useState(initialEnabled)
  const [addingList, setAddingList] = useState(false)
  const [newListName, setNewListName] = useState('')

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

  async function handleAddList() {
    const name = newListName.trim() || 'New list'
    setAddingList(false)
    setNewListName('')
    await onAddTodosList(name)
  }

  return (
    <div
      className="widget-toggle-bar"
      style={{
        position: 'sticky',
        bottom: 0,
        zIndex: 10,
        background: 'hsl(var(--card))',
        borderTop: '0.5px solid hsl(var(--border))',
        padding: '10px 40px',
        paddingBottom: 'max(10px, var(--safe-bottom, 0px))',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <div className="toggle-bar-fade-left" />
      <div className="toggle-bar-fade-right" />
      <span style={{
        fontSize: 12,
        fontWeight: 500,
        color: 'hsl(var(--muted-foreground))',
        marginRight: 6,
        flexShrink: 0,
      }}>
        Widgets:
      </span>
      <div className="widget-toggle-bar-chips">
        {/* Todos instances — one chip per widget */}
        {todosInstances.map(inst => {
          const label = inst.label ?? 'Priorities'
          return (
            <div key={inst.id} style={{ display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0 }}>
              <button
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '4px 6px 4px 10px',
                  borderRadius: todosInstances.length > 1 ? '6px 0 0 6px' : 6,
                  border: 'none',
                  background: colorTint(color, 0.2),
                  fontSize: 12, fontWeight: 500,
                  color: 'hsl(var(--foreground))',
                  cursor: 'default',
                }}
              >
                <CheckSquare size={11} strokeWidth={2} />
                {label}
              </button>
              {todosInstances.length > 1 && (
                <button
                  onClick={() => onRemoveTodosWidget(inst.id)}
                  style={{
                    display: 'flex', alignItems: 'center',
                    padding: '4px 8px',
                    borderRadius: '0 6px 6px 0',
                    border: 'none',
                    background: colorTint(color, 0.2),
                    color: 'hsl(var(--muted-foreground))',
                    cursor: 'pointer',
                  }}
                  title="Remove this list widget"
                >
                  <X size={11} strokeWidth={2} />
                </button>
              )}
            </div>
          )
        })}

        {/* Add new priorities list */}
        {addingList ? (
          <input
            value={newListName}
            onChange={e => setNewListName(e.target.value)}
            onBlur={() => { if (!newListName.trim()) { setAddingList(false); setNewListName('') } else handleAddList() }}
            onKeyDown={e => {
              if (e.key === 'Enter') handleAddList()
              if (e.key === 'Escape') { setAddingList(false); setNewListName('') }
            }}
            autoFocus
            placeholder="List name…"
            style={{
              background: 'hsl(var(--muted))', border: '0.5px solid hsl(var(--border))',
              borderRadius: 6, outline: 'none',
              fontSize: 12, color: 'hsl(var(--foreground))',
              padding: '4px 10px', width: 100, fontFamily: 'inherit',
            }}
          />
        ) : (
          <button
            onClick={() => setAddingList(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 8px',
              borderRadius: 6,
              border: '0.5px solid hsl(var(--border))',
              background: 'transparent',
              fontSize: 12, fontWeight: 400,
              color: 'hsl(var(--muted-foreground))',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            title="Add a new Priorities list"
          >
            <Plus size={10} strokeWidth={2} />
            Priorities
          </button>
        )}

        {/* Single-instance widget toggles */}
        {SINGLE_WIDGETS.map(({ type, label, Icon }) => {
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
    </div>
  )
}
