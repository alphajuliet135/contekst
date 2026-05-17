import { CheckSquare, Plus, Check } from 'lucide-react'
import type { Todo } from '@/lib/types'
import { formatDate } from '@/lib/utils'

const BADGE_BASE: React.CSSProperties = {
  borderRadius: 5, padding: '1px 7px', fontSize: 11, fontWeight: 500,
  flexShrink: 0, whiteSpace: 'nowrap',
}
const BADGE = {
  high:   { background: 'rgba(212,136,58,0.18)',  color: '#d4883a', border: '1px solid rgba(212,136,58,0.25)' },
  medium: { background: 'rgba(143,143,143,0.15)', color: '#8F8F8F', border: '1px solid rgba(143,143,143,0.2)' },
  low:    { background: 'rgba(100,100,100,0.12)',  color: '#6B6B6B', border: '1px solid rgba(100,100,100,0.15)' },
  done:   { background: 'rgba(55,138,221,0.15)',   color: '#378ADD', border: '1px solid rgba(55,138,221,0.2)' },
} as const

const priorityOrder = { high: 0, medium: 1, low: 2 }

export function TodosWidget({ todos, color }: { todos: Todo[]; color: string }) {
  const sorted = [...todos].sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  const activeCount = sorted.filter(t => !t.done).length
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="card-shadow" style={{
      background: 'hsl(var(--card))',
      border: '0.5px solid hsl(var(--border))',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '0.5px solid hsl(var(--border))',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <CheckSquare size={14} strokeWidth={1.5} style={{ color }} />
        <span style={{ fontSize: 13, fontWeight: 500 }}>Priorities</span>
        {activeCount > 0 && (
          <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>{activeCount}</span>
        )}
        <button style={{
          marginLeft: 'auto', background: 'none', border: 'none',
          color: 'hsl(var(--muted-foreground))', fontSize: 12, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 3, padding: '2px 4px',
        }}>
          <Plus size={11} strokeWidth={2} />
          Add
        </button>
      </div>

      {/* Body */}
      {todos.length === 0 ? (
        <div style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))' }}>No priorities yet</span>
        </div>
      ) : (
        <div style={{ padding: '6px 0' }}>
          {sorted.map(todo => (
            <div key={todo.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '7px 16px' }}>
              {/* Checkbox */}
              {todo.done ? (
                <span style={{
                  width: 16, height: 16, borderRadius: '50%',
                  background: color, flexShrink: 0, marginTop: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Check size={9} strokeWidth={3} style={{ color: 'white' }} />
                </span>
              ) : (
                <span style={{
                  width: 16, height: 16, borderRadius: '50%',
                  border: '1.5px solid hsl(var(--border))',
                  flexShrink: 0, marginTop: 1,
                }} />
              )}

              {/* Title + due date */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{
                  fontSize: 13, lineHeight: 1.4, display: 'block',
                  textDecoration: todo.done ? 'line-through' : 'none',
                  color: todo.done ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))',
                }}>
                  {todo.title}
                </span>
                {!todo.done && todo.dueDate && (
                  <span style={{
                    fontSize: 11,
                    color: todo.dueDate <= today ? '#d95f5f' : 'hsl(var(--muted-foreground))',
                    display: 'block', marginTop: 1,
                  }}>
                    {todo.dueDate <= today ? 'Overdue' : `Due ${formatDate(todo.dueDate)}`}
                  </span>
                )}
              </div>

              {/* Badge */}
              <span style={{ ...BADGE_BASE, ...(todo.done ? BADGE.done : BADGE[todo.priority]) }}>
                {todo.done ? 'Done' : todo.priority === 'high' ? 'High' : todo.priority === 'medium' ? 'Med' : 'Low'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
