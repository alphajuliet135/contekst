import { Calendar, Plus } from 'lucide-react'
import type { DateEvent } from '@/lib/types'
import { colorTint } from '@/lib/utils'

export function DatesWidget({ dates, color }: { dates: DateEvent[]; color: string }) {
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
        <Calendar size={14} strokeWidth={1.5} style={{ color }} />
        <span style={{ fontSize: 13, fontWeight: 500 }}>Upcoming dates</span>
        <button style={{
          marginLeft: 'auto', background: 'none', border: 'none',
          color: 'hsl(var(--muted-foreground))', fontSize: 12, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 3, padding: '2px 4px',
        }}>
          <Plus size={11} strokeWidth={2} />
          Add
        </button>
      </div>

      {dates.length === 0 ? (
        <div style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))' }}>No dates</span>
        </div>
      ) : (
        <div style={{ padding: '6px 0' }}>
          {dates.map(d => {
            // Parse as local date to avoid timezone offset shifting the day
            const [year, month, day] = d.date.split('-').map(Number)
            const dt = new Date(year, month - 1, day)
            const monthLabel = dt.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()
            const dayNum = dt.getDate()

            return (
              <div key={d.id} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '7px 16px',
              }}>
                <div style={{
                  background: colorTint(color, 0.1),
                  border: `0.5px solid ${colorTint(color, 0.35)}`,
                  borderRadius: 6,
                  padding: '4px 8px',
                  textAlign: 'center',
                  flexShrink: 0,
                  minWidth: 40,
                }}>
                  <div style={{ fontSize: 9, fontWeight: 500, color, letterSpacing: 0.5 }}>{monthLabel}</div>
                  <div style={{ fontSize: 15, fontWeight: 500, color, lineHeight: 1.2 }}>{dayNum}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                  <span style={{ fontSize: 13, display: 'block' }}>{d.title}</span>
                  {d.note && (
                    <span style={{
                      fontSize: 12,
                      color: 'hsl(var(--muted-foreground))',
                      display: 'block',
                      marginTop: 2,
                    }}>
                      {d.note}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
