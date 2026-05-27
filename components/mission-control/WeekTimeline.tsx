import type { Priority } from '@/lib/types'
import { colorTint, colorBorder } from '@/lib/utils'

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

export interface AheadItem {
  kind: 'todo' | 'date'
  id: string
  title: string
  subtitle?: string
  priority?: Priority
  contextColor: string
  contextName: string
}

export interface AheadDay {
  label: string
  items: AheadItem[]
}

const CAP = 14

export function WeekTimeline({ days }: { days: AheadDay[] }) {
  // Flatten to count total items and apply cap
  let totalShown = 0
  let overflow = 0

  const rows: { day: AheadDay; items: AheadItem[] }[] = []
  for (const day of days) {
    if (totalShown >= CAP) { overflow += day.items.length; continue }
    const slots = CAP - totalShown
    const shown = day.items.slice(0, slots)
    overflow += day.items.length - shown.length
    if (shown.length > 0) rows.push({ day, items: shown })
    totalShown += shown.length
  }

  const itemCount = totalShown + overflow

  return (
    <div className="card-shadow" style={{
      background: 'hsl(var(--card))',
      border: '0.5px solid hsl(var(--border))',
      borderRadius: 14,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '14px 18px', borderBottom: '0.5px solid hsl(var(--border))', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0, letterSpacing: -0.2 }}>Ahead</h2>
          <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>Next 14 days, across contexts</span>
        </div>
        <span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', fontFamily: MONO }}>
          {itemCount} item{itemCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Rows */}
      <div style={{ padding: '6px 0' }}>
        {rows.length === 0 ? (
          <div style={{ padding: '14px 18px', fontSize: 13, color: 'hsl(var(--muted-foreground))' }}>
            Nothing coming up in the next 14 days.
          </div>
        ) : (
          rows.map(({ day, items }, ri) => (
            <div key={day.label} style={{
              display: 'grid', gridTemplateColumns: '92px 1fr', alignItems: 'flex-start',
              padding: '10px 18px',
              borderTop: ri > 0 ? '0.5px solid hsl(var(--muted))' : 'none',
            }}>
              <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', fontFamily: MONO, paddingTop: 2, whiteSpace: 'pre' }}>
                {day.label}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {items.map((item, ii) => (
                  <div key={`${item.id}-${ii}`} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {item.kind === 'todo' ? (
                      <span style={{
                        width: 13, height: 13, borderRadius: '50%',
                        border: `1.5px solid ${item.contextColor}`,
                        flexShrink: 0, display: 'inline-block',
                      }} />
                    ) : (
                      <span style={{
                        width: 13, height: 13, borderRadius: 3, flexShrink: 0, display: 'inline-block',
                        background: colorTint(item.contextColor, 0.18),
                        border: `0.5px solid ${colorBorder(item.contextColor, 0.35)}`,
                      }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, lineHeight: 1.3 }}>{item.title}</div>
                      {item.subtitle && <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', marginTop: 1 }}>{item.subtitle}</div>}
                    </div>
                    {item.priority && <span style={{ ...BADGE_BASE, ...BADGE[item.priority] }}>{item.priority === 'high' ? 'High' : item.priority === 'medium' ? 'Med' : 'Low'}</span>}
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: item.contextColor, flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
        {overflow > 0 && (
          <div style={{ padding: '8px 18px', fontSize: 12, color: 'hsl(var(--muted-foreground))', borderTop: '0.5px solid hsl(var(--muted))' }}>
            +{overflow} more
          </div>
        )}
      </div>
    </div>
  )
}
