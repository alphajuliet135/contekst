export interface WeekDay {
  dayLabel: string
  dateNum: number
  isToday: boolean
  dots: { color: string; opacity: number }[]
}

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"

export function WeekStrip({ days }: { days: WeekDay[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
      {days.map((day, i) => (
        <div key={i} style={{
          padding: '8px 6px 10px',
          background: day.isToday ? 'hsl(var(--card))' : 'transparent',
          border: day.isToday ? '0.5px solid hsl(var(--border))' : '0.5px solid transparent',
          borderRadius: 8,
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: 10, fontFamily: MONO, letterSpacing: 0.5, marginBottom: 3,
            color: day.isToday ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
          }}>
            {day.dayLabel}
          </div>
          <div style={{
            fontSize: 14, fontFamily: MONO, lineHeight: 1,
            fontWeight: day.isToday ? 600 : 500,
            color: day.isToday ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
          }}>
            {day.dateNum}
          </div>
          <div style={{
            marginTop: 8, height: 18,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            gap: 2, flexWrap: 'wrap',
          }}>
            {day.dots.slice(0, 6).map((dot, j) => (
              <span key={j} style={{
                width: 5, height: 5, borderRadius: 1.5,
                background: dot.color, opacity: dot.opacity,
                display: 'inline-block', flexShrink: 0,
              }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
