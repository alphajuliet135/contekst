import { WeekStrip, type WeekDay } from './WeekStrip'

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"

interface Props {
  firstName: string | null
  overdueCount: number
  dueTodayCount: number
  upcoming7dCount: number
  topContextByLoad: string | null
  weekDays: WeekDay[]
}

export function BriefingHero({
  firstName, overdueCount, dueTodayCount, upcoming7dCount, topContextByLoad, weekDays,
}: Props) {
  const now = new Date()
  const h = now.getHours()
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  const greetingText = firstName ? `${greeting}, ${firstName}.` : `${greeting}.`

  const dateStr = now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
  const eyebrow = `Briefing — ${dateStr}, ${timeStr}`

  const hasAny = overdueCount > 0 || dueTodayCount > 0 || upcoming7dCount > 0
  const weekNum = getWeekNumber(now)

  return (
    <div className="mc-briefing-hero" style={{ paddingBottom: 24, borderBottom: '0.5px solid hsl(var(--border))', marginBottom: 28 }}>
      {/* Left — greeting + summary */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 11, fontFamily: MONO, color: 'hsl(var(--muted-foreground))', letterSpacing: 1, textTransform: 'uppercase' }}>
            {eyebrow}
          </span>
          {!hasAny && (
            <>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'hsl(var(--border))', flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontFamily: MONO, color: '#2ec27e', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#2ec27e', display: 'inline-block' }} />
                all systems healthy
              </span>
            </>
          )}
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 600, letterSpacing: -0.6, margin: 0, lineHeight: 1.2 }}>
          {greetingText}
        </h1>

        <p style={{ fontSize: 15, color: 'hsl(var(--muted-foreground))', lineHeight: 1.55, margin: '10px 0 0', maxWidth: 580 }}>
          {!hasAny ? (
            'All clear for today.'
          ) : (
            <>
              {overdueCount > 0 && (
                <>You have <span style={{ color: '#d95f5f', fontWeight: 500 }}>{overdueCount} overdue</span></>
              )}
              {overdueCount > 0 && dueTodayCount > 0 && ', '}
              {dueTodayCount > 0 && (
                <><span style={{ color: '#d4883a', fontWeight: 500 }}>{dueTodayCount} due today</span></>
              )}
              {(overdueCount > 0 || dueTodayCount > 0) && upcoming7dCount > 0 && ', and '}
              {upcoming7dCount > 0 && (
                <><span style={{ color: 'hsl(var(--foreground))', fontWeight: 500 }}>{upcoming7dCount} event{upcoming7dCount !== 1 ? 's' : ''}</span> in the next week</>
              )}
              {topContextByLoad && ` — mostly ${topContextByLoad}`}
              .
            </>
          )}
        </p>
      </div>

      {/* Right — week strip */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <p style={{ fontSize: 11, fontWeight: 500, color: 'hsl(var(--muted-foreground))', letterSpacing: 0.8, textTransform: 'uppercase', margin: 0 }}>
            This week
          </p>
          <span style={{ fontSize: 10, color: 'hsl(var(--muted-foreground))', fontFamily: MONO }}>
            WK {weekNum}
          </span>
        </div>
        <WeekStrip days={weekDays} />
      </div>
    </div>
  )
}

function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}
