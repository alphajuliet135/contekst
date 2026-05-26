import { colorTint } from '@/lib/utils'
import { MacroHeroActions } from './MacroHeroActions'
import { MacroMantra } from './MacroMantra'
import { CountPill } from './CountPill'

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"

interface Props {
  contextId: string
  name: string
  color: string
  type: 'macro' | 'micro'
  description: string | null
  mantraText: string | null
  overdueCt: number
  highCt: number
  upcoming30d: number
  topStreak: number
  nextEventStr: string
  activity28d: number[]
  sectionEnabled: Record<string, boolean>
}

export function MacroHero({
  contextId, name, color, type, description, mantraText,
  overdueCt, highCt, upcoming30d, topStreak, nextEventStr, activity28d, sectionEnabled,
}: Props) {
  // Build summary paragraph clauses
  const clauses: React.ReactNode[] = []
  if (overdueCt > 0) clauses.push(
    <span key="overdue" style={{ color: '#d95f5f', fontWeight: 500 }}>
      {overdueCt} overdue
    </span>
  )
  if (highCt > 0) clauses.push(
    <span key="high" style={{ color: '#d4883a', fontWeight: 500 }}>
      {highCt} high-priority todo{highCt !== 1 ? 's' : ''}
    </span>
  )
  if (upcoming30d > 0) clauses.push(
    <span key="upcoming" style={{ color: 'hsl(var(--foreground))' }}>
      {upcoming30d} event{upcoming30d !== 1 ? 's' : ''} in the next 30 days
    </span>
  )

  const stats = [
    { value: highCt,        label: 'High open',  color: 'hsl(var(--foreground))' },
    { value: upcoming30d,   label: 'Upcoming',   color: 'hsl(var(--foreground))' },
    { value: topStreak,     label: 'Day streak', color: color },
    { value: nextEventStr,  label: 'Next event', color: '#d4883a' },
  ]

  return (
    <div style={{
      padding: '28px 40px 24px',
      background: colorTint(color, 0.07),
      borderBottom: `0.5px solid ${colorTint(color, 0.22)}`,
      flexShrink: 0,
    }}>
      <div className="macro-hero-grid">
        {/* Left column */}
        <div>
          {/* Eyebrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontFamily: MONO, color, letterSpacing: 1, textTransform: 'uppercase' }}>
              {name} · Macro
            </span>
          </div>

          {/* H1 */}
          <h1 style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.5, margin: 0, lineHeight: 1.15 }}>
            {name}
          </h1>

          {/* Summary paragraph */}
          <p style={{ fontSize: 14, color: 'hsl(var(--muted-foreground))', lineHeight: 1.55, margin: '10px 0 0', maxWidth: 560 }}>
            {clauses.length === 0 ? (
              <span style={{ color: 'hsl(var(--muted-foreground))' }}>All clear.</span>
            ) : clauses.reduce<React.ReactNode[]>((acc, clause, i) => {
              if (i === 0) return [clause]
              const sep = i === clauses.length - 1 && clauses.length > 1 ? ', and ' : ', '
              return [...acc, sep, clause]
            }, [])}
          </p>

          {/* Mantra block */}
          <MacroMantra contextId={contextId} color={color} mantraText={mantraText} />

          {/* Stats row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 20, marginTop: 0 }}>
            {stats.map((s, i) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 20, fontWeight: 600, color: s.color, letterSpacing: -0.3, lineHeight: 1, fontFamily: MONO }}>
                  {s.value}
                </span>
                <span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>{s.label}</span>
                {i < stats.length - 1 && (
                  <span style={{ width: 1, height: 16, background: colorTint(color, 0.2), display: 'inline-block', marginLeft: 8, verticalAlign: 'middle' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 4 }}>
          {/* Activity heatmap */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: 'hsl(var(--muted-foreground))', letterSpacing: 0.8, textTransform: 'uppercase' }}>Activity</span>
              <span style={{ fontSize: 10, color: 'hsl(var(--muted-foreground))', fontFamily: MONO }}>4w</span>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(14, 1fr)',
              gridTemplateRows: 'repeat(2, 1fr)',
              gap: 3,
            }}>
              {activity28d.map((v, i) => {
                const isToday = i === 27
                return (
                  <span key={i} style={{
                    aspectRatio: '1', borderRadius: 2.5,
                    background: v ? color : 'hsl(var(--muted))',
                    opacity: v ? (isToday ? 1 : 0.55) : 1,
                    border: isToday ? `0.5px solid ${color}` : 'none',
                    display: 'block',
                  }} />
                )
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: 'hsl(var(--muted-foreground))', fontFamily: MONO }}>
              <span>4w ago</span>
              <span>this week</span>
            </div>
          </div>

          {/* Action buttons */}
          <MacroHeroActions
            contextId={contextId}
            name={name}
            color={color}
            type={type}
            description={description}
            sectionEnabled={sectionEnabled}
          />
        </div>
      </div>
    </div>
  )
}
