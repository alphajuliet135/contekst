import { Repeat2, Plus } from 'lucide-react'
import type { Habit, HabitLog } from '@/lib/types'
import { colorTint } from '@/lib/utils'

export function HabitsWidget({
  habits,
  logs,
  color,
}: {
  habits: Habit[]
  logs: HabitLog[]
  color: string
}) {
  const completedIds = new Set(logs.filter(l => l.completed).map(l => l.habitId))

  return (
    <div className="card-shadow" style={{
      background: 'hsl(var(--card))',
      border: '0.5px solid hsl(var(--border))',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 16px',
        borderBottom: '0.5px solid hsl(var(--border))',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <Repeat2 size={14} strokeWidth={1.5} style={{ color }} />
        <span style={{ fontSize: 13, fontWeight: 500 }}>Habits</span>
        {habits.length > 0 && (
          <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>
            {completedIds.size}/{habits.length} today
          </span>
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

      {habits.length === 0 ? (
        <div style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))' }}>No habits</span>
        </div>
      ) : (
        <div style={{ padding: '6px 0' }}>
          {habits.map(habit => {
            const done = completedIds.has(habit.id)
            return (
              <div key={habit.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '7px 16px',
              }}>
                <span style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  border: `1.5px solid ${done ? color : 'hsl(var(--border))'}`,
                  background: done ? colorTint(color, 0.2) : 'transparent',
                  flexShrink: 0,
                }} />
                <span style={{
                  fontSize: 13,
                  flex: 1,
                  color: done ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))',
                }}>
                  {habit.title}
                </span>
                <span style={{
                  fontSize: 11,
                  color: 'hsl(var(--muted-foreground))',
                  padding: '2px 6px',
                  background: 'hsl(var(--muted))',
                  borderRadius: 4,
                }}>
                  {habit.frequency}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
