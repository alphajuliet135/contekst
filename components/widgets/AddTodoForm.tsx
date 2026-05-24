'use client'

import { useRef } from 'react'
import type { Priority } from '@/lib/types'
import { BADGE_BASE, BADGE } from './TodoRow'

interface AddTodoFormProps {
  newTitle: string
  newPriority: Priority
  newDueDate: string
  submitting: boolean
  hasItems: boolean
  color: string
  onTitleChange: (v: string) => void
  onPriorityChange: (p: Priority) => void
  onDueDateChange: (v: string) => void
  onAdd: () => void
  onCancel: () => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export function AddTodoForm({
  newTitle, newPriority, newDueDate,
  submitting, hasItems, color,
  onTitleChange, onPriorityChange, onDueDateChange,
  onAdd, onCancel, onKeyDown,
}: AddTodoFormProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div style={{
      padding: '10px 16px 12px',
      borderTop: hasItems ? '0.5px solid hsl(var(--border))' : 'none',
    }}>
      <input
        ref={inputRef}
        type="text"
        value={newTitle}
        onChange={e => onTitleChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Add a task…"
        autoFocus
        style={{
          width: '100%', boxSizing: 'border-box',
          background: 'none', border: 'none', outline: 'none',
          fontSize: 13, color: 'hsl(var(--foreground))',
          padding: '0 0 8px',
        }}
      />
      <input
        type="date"
        value={newDueDate}
        onChange={e => onDueDateChange(e.target.value)}
        style={{
          background: 'none', border: 'none', outline: 'none',
          fontSize: 12, color: 'hsl(var(--muted-foreground))',
          fontFamily: 'inherit', padding: '0 0 8px',
          display: 'block', width: '100%', boxSizing: 'border-box',
          cursor: 'pointer',
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['high', 'medium', 'low'] as Priority[]).map(p => {
            const selected = newPriority === p
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPriorityChange(p)}
                style={{
                  ...BADGE_BASE,
                  ...(selected ? BADGE[p] : {
                    background: 'transparent',
                    color: 'hsl(var(--muted-foreground))',
                    border: '0.5px solid hsl(var(--border))',
                  }),
                  cursor: 'pointer',
                }}
              >
                {p === 'high' ? 'High' : p === 'medium' ? 'Med' : 'Low'}
              </button>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: 'none', border: 'none', fontSize: 12,
              color: 'hsl(var(--muted-foreground))', cursor: 'pointer', padding: '2px 4px',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onAdd}
            disabled={!newTitle.trim() || submitting}
            style={{
              border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 500,
              padding: '4px 12px', cursor: newTitle.trim() ? 'pointer' : 'default',
              background: newTitle.trim() ? color : 'hsl(var(--muted))',
              color: newTitle.trim() ? 'white' : 'hsl(var(--muted-foreground))',
            }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
