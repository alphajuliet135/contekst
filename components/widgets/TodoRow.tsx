'use client'

import { useRef } from 'react'
import { Trash2, Calendar } from 'lucide-react'
import type { Todo, Priority } from '@/lib/types'
import { formatDate } from '@/lib/utils'

export const BADGE_BASE: React.CSSProperties = {
  borderRadius: 5, padding: '1px 7px', fontSize: 11, fontWeight: 500,
  flexShrink: 0, whiteSpace: 'nowrap',
}
export const BADGE = {
  high:   { background: 'rgba(212,136,58,0.18)',  color: '#d4883a', border: '1px solid rgba(212,136,58,0.25)' },
  medium: { background: 'rgba(143,143,143,0.15)', color: '#8F8F8F', border: '1px solid rgba(143,143,143,0.2)' },
  low:    { background: 'rgba(100,100,100,0.12)',  color: '#6B6B6B', border: '1px solid rgba(100,100,100,0.15)' },
  done:   { background: 'rgba(55,138,221,0.15)',   color: '#378ADD', border: '1px solid rgba(55,138,221,0.2)' },
} as const

interface TodoRowProps {
  todo: Todo
  today: string
  isEditingTitle: boolean
  draftTitle: string
  isEditingPriority: boolean
  isEditingDueDate: boolean
  draftDueDate: string
  onToggle: () => void
  onDelete: (e: React.MouseEvent) => void
  onStartEditing: () => void
  onTitleChange: (v: string) => void
  onTitleBlur: () => void
  onTitleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onOpenPriorityPicker: () => void
  onSelectPriority: (p: Priority) => void
  onStartEditingDueDate: () => void
  onDraftDueDateChange: (v: string) => void
  onSaveDueDate: (value: string) => void
  onCancelDueDateEdit: () => void
}

export function TodoRow({
  todo, today,
  isEditingTitle, draftTitle,
  isEditingPriority, isEditingDueDate, draftDueDate,
  onToggle, onDelete, onStartEditing,
  onTitleChange, onTitleBlur, onTitleKeyDown,
  onOpenPriorityPicker, onSelectPriority,
  onStartEditingDueDate, onDraftDueDateChange, onSaveDueDate, onCancelDueDateEdit,
}: TodoRowProps) {
  const editInputRef = useRef<HTMLInputElement>(null)

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '7px 16px' }}>
      <span
        onClick={onToggle}
        style={{
          width: 16, height: 16, borderRadius: '50%',
          border: '1.5px solid hsl(var(--border))',
          flexShrink: 0, marginTop: 1, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        {isEditingTitle ? (
          <input
            ref={editInputRef}
            value={draftTitle}
            onChange={e => onTitleChange(e.target.value)}
            onBlur={onTitleBlur}
            onKeyDown={onTitleKeyDown}
            autoFocus
            style={{
              background: 'none', border: 'none', outline: 'none',
              fontSize: 13, lineHeight: 1.4, display: 'block',
              color: 'hsl(var(--foreground))',
              width: '100%', padding: 0, fontFamily: 'inherit',
            }}
          />
        ) : (
          <span
            onClick={onStartEditing}
            style={{ fontSize: 13, lineHeight: 1.4, display: 'block', cursor: 'text' }}
          >
            {todo.title}
          </span>
        )}
        {isEditingDueDate ? (
          <input
            type="date"
            autoFocus
            value={draftDueDate}
            onChange={e => onDraftDueDateChange(e.target.value)}
            onBlur={() => onSaveDueDate(draftDueDate)}
            onKeyDown={e => {
              if (e.key === 'Enter') e.currentTarget.blur()
              if (e.key === 'Escape') onCancelDueDateEdit()
            }}
            style={{
              background: 'none', border: 'none', outline: 'none',
              fontSize: 12, color: 'hsl(var(--muted-foreground))',
              fontFamily: 'inherit', display: 'block', marginTop: 1,
              padding: 0, cursor: 'pointer',
            }}
          />
        ) : todo.dueDate ? (
          <span
            onClick={onStartEditingDueDate}
            style={{
              fontSize: 11,
              color: todo.dueDate <= today ? '#d95f5f' : 'hsl(var(--muted-foreground))',
              display: 'block', marginTop: 1, cursor: 'pointer',
            }}
          >
            {todo.dueDate <= today ? 'Overdue' : `Due ${formatDate(todo.dueDate)}`}
          </span>
        ) : (
          <span
            onClick={onStartEditingDueDate}
            style={{
              display: 'flex', alignItems: 'center', gap: 3,
              marginTop: 1, opacity: 0, cursor: 'pointer',
              fontSize: 11, color: 'hsl(var(--muted-foreground))',
              transition: 'opacity 100ms',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '0'}
          >
            <Calendar size={10} strokeWidth={1.5} />
            Add date
          </span>
        )}
      </div>
      {isEditingPriority ? (
        <div data-prio-picker style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
          {(['high', 'medium', 'low'] as Priority[]).map(p => (
            <button
              key={p}
              onMouseDown={e => { e.stopPropagation(); onSelectPriority(p) }}
              style={{
                ...BADGE_BASE,
                ...(p === todo.priority
                  ? BADGE[p]
                  : { background: 'transparent', color: 'hsl(var(--muted-foreground))', border: '0.5px solid hsl(var(--border))' }),
                cursor: 'pointer',
              }}
            >
              {p === 'high' ? 'H' : p === 'medium' ? 'M' : 'L'}
            </button>
          ))}
        </div>
      ) : (
        <button
          onMouseDown={e => { e.stopPropagation(); onOpenPriorityPicker() }}
          title="Change priority"
          style={{ ...BADGE_BASE, ...BADGE[todo.priority], cursor: 'pointer', border: 'none' }}
        >
          {todo.priority === 'high' ? 'High' : todo.priority === 'medium' ? 'Med' : 'Low'}
        </button>
      )}
      <button
        onClick={onDelete}
        style={{
          background: 'none', border: 'none', padding: 3, marginTop: 1,
          color: 'hsl(var(--muted-foreground))', cursor: 'pointer',
          borderRadius: 4, display: 'flex', alignItems: 'center', opacity: 0.4,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.4' }}
      >
        <Trash2 size={11} strokeWidth={1.5} />
      </button>
    </div>
  )
}
