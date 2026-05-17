import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/server/db'
import { contexts, todos, dates, users } from '@/server/db/schema'
import { eq, and, lte, gte } from 'drizzle-orm'
import { Calendar, ArrowRight } from 'lucide-react'
import { formatDate, colorTint } from '@/lib/utils'
import { TodoCheckbox } from '@/components/ui/TodoCheckbox'
import { Greeting } from '@/components/mission-control/Greeting'

// ── Countdown helper ─────────────────────────────────────────────────────────

function getCountdown(dateStr: string, today: string): string {
  const [y, m, d]   = dateStr.split('-').map(Number)
  const [ty, tm, td] = today.split('-').map(Number)
  const diff = Math.round(
    (new Date(y, m - 1, d).getTime() - new Date(ty, tm - 1, td).getTime()) / 86400000
  )
  if (diff <= 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff < 7)  return `In ${diff} days`
  if (diff < 14) return 'In 1 week'
  if (diff < 21) return 'In 2 weeks'
  if (diff < 28) return 'In 3 weeks'
  if (diff < 45) return 'In 1 month'
  if (diff < 75) return 'In 2 months'
  return `In ${Math.round(diff / 30)} months`
}

// ── Shared badge styles ──────────────────────────────────────────────────────

const BADGE_BASE: React.CSSProperties = {
  borderRadius: 5,
  padding: '1px 7px',
  fontSize: 11,
  fontWeight: 500,
  flexShrink: 0,
  whiteSpace: 'nowrap',
}

const BADGE_STYLES = {
  high:   { background: 'rgba(212,136,58,0.18)',  color: '#d4883a', border: '1px solid rgba(212,136,58,0.25)' },
  medium: { background: 'rgba(143,143,143,0.15)', color: '#8F8F8F', border: '1px solid rgba(143,143,143,0.2)' },
  low:    { background: 'rgba(100,100,100,0.12)',  color: '#6B6B6B', border: '1px solid rgba(100,100,100,0.15)' },
} as const

function badge(priority: keyof typeof BADGE_STYLES): React.CSSProperties {
  return { ...BADGE_BASE, ...BADGE_STYLES[priority] }
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function MissionControlPage() {
  const session = await auth()
  if (!session) redirect('/login')
  const userId = session.user.id

  // Read name directly from DB so it reflects updates without requiring re-auth
  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { name: true },
  })
  const userName = dbUser?.name

  const userContexts = await db.query.contexts.findMany({
    where: eq(contexts.userId, userId),
    orderBy: (c, { asc }) => [asc(c.order)],
  })

  const macros = userContexts.filter(c => c.type === 'macro')
  const micros = userContexts.filter(c => c.type === 'micro')

  const today = new Date().toISOString().split('T')[0]
  const in7days  = new Date(Date.now() +  7 * 86400000).toISOString().split('T')[0]
  const in30days = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

  const [activeTodos, upcomingDates, pinnedDates, allUpcoming] = await Promise.all([
    db.query.todos.findMany({
      where: and(eq(todos.userId, userId), eq(todos.done, false)),
    }),
    db.query.dates.findMany({
      where: and(eq(dates.userId, userId), gte(dates.date, today), lte(dates.date, in7days)),
    }),
    db.query.dates.findMany({
      where: and(eq(dates.userId, userId), eq(dates.pinned, true)),
    }),
    db.query.dates.findMany({
      where: and(eq(dates.userId, userId), gte(dates.date, today), lte(dates.date, in30days)),
      orderBy: (d, { asc }) => [asc(d.date)],
    }),
  ])

  const todosByCtx = new Map<string, typeof activeTodos>()
  for (const t of activeTodos) {
    if (!todosByCtx.has(t.contextId)) todosByCtx.set(t.contextId, [])
    todosByCtx.get(t.contextId)!.push(t)
  }

  const datesByCtx = new Map<string, typeof upcomingDates>()
  for (const d of upcomingDates) {
    if (!datesByCtx.has(d.contextId)) datesByCtx.set(d.contextId, [])
    datesByCtx.get(d.contextId)!.push(d)
  }

  function getUrgent(ctxId: string) {
    return (todosByCtx.get(ctxId) ?? [])
      .filter(t => t.priority === 'high' || (t.dueDate != null && t.dueDate <= today))
      .slice(0, 4)
  }

  const pinnedTodos = activeTodos.filter(t => t.pinned)

  const firstName = userName?.split(' ')[0] ?? null

  const dateLabel = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div style={{ display: 'flex', flex: 1 }}>
      {/* Main content */}
      <div className="page-pad" style={{ flex: 1, minWidth: 0 }}>

        {/* Greeting row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36 }}>
          <Greeting firstName={firstName} />
          <span style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))', flexShrink: 0, paddingBottom: 3 }}>
            {dateLabel}
          </span>
        </div>

        {/* Needs attention */}
        {macros.length > 0 && (
          <section style={{ marginBottom: 40 }}>
            <p style={{
              fontSize: 11, fontWeight: 500, color: 'hsl(var(--muted-foreground))',
              letterSpacing: 0.8, textTransform: 'uppercase', margin: '0 0 12px',
            }}>
              Needs attention
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 10,
            }}>
              {macros.map(ctx => {
                const urgent = getUrgent(ctx.id)
                const ctxUpcoming = (datesByCtx.get(ctx.id) ?? []).slice(0, 2)
                const hasItems = urgent.length > 0 || ctxUpcoming.length > 0

                return (
                  <div key={ctx.id} className="card-shadow" style={{
                    background: 'hsl(var(--card))',
                    border: '0.5px solid hsl(var(--border))',
                    borderRadius: 12,
                    overflow: 'hidden',
                  }}>
                    {/* Card header */}
                    <div style={{
                      padding: '10px 14px',
                      display: 'flex', alignItems: 'center', gap: 8,
                      borderBottom: hasItems ? '0.5px solid hsl(var(--border))' : 'none',
                    }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: ctx.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{ctx.name}</span>
                    </div>

                    {/* Card body */}
                    <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: 0 }}>
                      {hasItems ? (
                        <>
                          {urgent.map(todo => (
                            <div key={todo.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '6px 14px' }}>
                              <div style={{ marginTop: 2 }}>
                                <TodoCheckbox todoId={todo.id} color={ctx.color} size={15} />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <span style={{ fontSize: 13, lineHeight: 1.4, display: 'block' }}>
                                  {todo.title}
                                </span>
                                {todo.dueDate && (
                                  <span style={{ fontSize: 11, color: todo.dueDate <= today ? '#d95f5f' : 'hsl(var(--muted-foreground))', display: 'block', marginTop: 1 }}>
                                    {todo.dueDate <= today ? 'Overdue' : `Due ${formatDate(todo.dueDate)}`}
                                  </span>
                                )}
                              </div>
                              {/* Priority badge */}
                              <span style={badge(todo.priority === 'low' ? 'low' : todo.priority)}>
                                {todo.priority === 'high' ? 'High' : todo.priority === 'medium' ? 'Med' : 'Low'}
                              </span>
                            </div>
                          ))}
                          {ctxUpcoming.map(d => (
                            <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px' }}>
                              <Calendar size={12} strokeWidth={1.5} style={{ color: ctx.color, flexShrink: 0, marginTop: 1 }} />
                              <span style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))' }}>
                                {d.title}
                                <span style={{ marginLeft: 5 }}>· {formatDate(d.date)}</span>
                              </span>
                            </div>
                          ))}
                        </>
                      ) : (
                        <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', padding: '6px 14px' }}>All clear</span>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Aggregated upcoming dates card */}
              {allUpcoming.length > 0 && (
                <div className="card-shadow" style={{
                  background: 'hsl(var(--card))',
                  border: '0.5px solid hsl(var(--border))',
                  borderRadius: 12,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    padding: '10px 14px',
                    display: 'flex', alignItems: 'center', gap: 8,
                    borderBottom: '0.5px solid hsl(var(--border))',
                  }}>
                    <Calendar size={13} strokeWidth={1.5} style={{ color: 'hsl(var(--muted-foreground))' }} />
                    <span style={{ fontSize: 13, fontWeight: 500 }}>Upcoming</span>
                  </div>
                  <div style={{ padding: '8px 0' }}>
                    {allUpcoming.slice(0, 4).map(d => {
                      const ctx = userContexts.find(c => c.id === d.contextId)
                      const [year, month, day] = d.date.split('-').map(Number)
                      const dt = new Date(year, month - 1, day)
                      const monthLabel = dt.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()
                      const dayNum = dt.getDate()
                      return (
                        <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '5px 14px' }}>
                          <div style={{
                            background: ctx ? colorTint(ctx.color, 0.15) : 'hsl(var(--muted))',
                            border: `0.5px solid ${ctx ? colorTint(ctx.color, 0.3) : 'hsl(var(--border))'}`,
                            borderRadius: 6, padding: '2px 6px', textAlign: 'center',
                            flexShrink: 0, minWidth: 36,
                          }}>
                            <div style={{ fontSize: 8, fontWeight: 500, color: ctx?.color ?? 'hsl(var(--muted-foreground))', letterSpacing: 0.5 }}>{monthLabel}</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: ctx?.color ?? 'hsl(var(--foreground))', lineHeight: 1.1 }}>{dayNum}</div>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontSize: 13, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.title}</span>
                            <span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>
                              {ctx ? `${ctx.name} · ` : ''}
                              <span style={{ color: ctx?.color ?? 'hsl(var(--muted-foreground))' }}>
                                {getCountdown(d.date, today)}
                              </span>
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Pinned */}
        {(pinnedTodos.length > 0 || pinnedDates.length > 0) && (
          <section style={{ marginBottom: 40 }}>
            <p style={{
              fontSize: 11, fontWeight: 500, color: 'hsl(var(--muted-foreground))',
              letterSpacing: 0.8, textTransform: 'uppercase', margin: '0 0 12px',
            }}>
              Pinned
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8 }}>
              {pinnedTodos.map(todo => {
                const ctx = userContexts.find(c => c.id === todo.contextId)
                return (
                  <div key={todo.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px',
                    background: 'hsl(var(--card))',
                    border: '0.5px solid hsl(var(--border))',
                    borderRadius: 10,
                  }}>
                    <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>☐</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 13, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{todo.title}</span>
                      <span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>
                        Todo{ctx ? ` · ${ctx.name}` : ''}
                      </span>
                    </div>
                    {ctx && <span style={{ width: 7, height: 7, borderRadius: '50%', background: ctx.color, flexShrink: 0 }} />}
                  </div>
                )
              })}
              {pinnedDates.map(d => {
                const ctx = userContexts.find(c => c.id === d.contextId)
                return (
                  <div key={d.id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px',
                    background: 'hsl(var(--card))',
                    border: '0.5px solid hsl(var(--border))',
                    borderRadius: 10,
                  }}>
                    <Calendar size={14} strokeWidth={1.5} style={{ color: ctx?.color ?? 'hsl(var(--muted-foreground))', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 13, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.title}</span>
                      <span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>
                        Date{ctx ? ` · ${ctx.name}` : ''} · {formatDate(d.date)}
                      </span>
                    </div>
                    {ctx && <span style={{ width: 7, height: 7, borderRadius: '50%', background: ctx.color, flexShrink: 0 }} />}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Empty state */}
        {macros.length === 0 && (
          <div style={{ marginTop: 60 }}>
            <p style={{ fontSize: 15, fontWeight: 500, margin: 0 }}>No contexts yet</p>
            <p style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))', marginTop: 6, marginBottom: 0 }}>
              Add your first context using the button above.
            </p>
          </div>
        )}
      </div>

      {/* Micro sidebar — hidden on mobile */}
      {micros.length > 0 && (
        <aside className="page-pad hide-on-mobile" style={{
          width: 248,
          flexShrink: 0,
          borderLeft: '0.5px solid hsl(var(--border))',
          flexDirection: 'column',
        }}>
          <p style={{
            fontSize: 11, fontWeight: 500, color: 'hsl(var(--muted-foreground))',
            letterSpacing: 0.8, textTransform: 'uppercase', margin: '0 0 12px',
          }}>
            Micro
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {micros.map(ctx => {
              const ctxTodos = todosByCtx.get(ctx.id) ?? []
              const sortedTodos = [...ctxTodos].sort((a, b) => {
                const order = { high: 0, medium: 1, low: 2 }
                return order[a.priority] - order[b.priority]
              })
              const topItems = sortedTodos.slice(0, 2)

              return (
                <div key={ctx.id} className="card-shadow" style={{
                  background: 'hsl(var(--card))',
                  border: '0.5px solid hsl(var(--border))',
                  borderRadius: 10,
                  padding: '10px 12px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: topItems.length > 0 ? 7 : 0 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: ctx.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{ctx.name}</span>
                  </div>
                  {topItems.length > 0 ? topItems.map(todo => (
                    <div key={todo.id} style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 14, marginBottom: 3 }}>
                      <TodoCheckbox todoId={todo.id} color={ctx.color} size={13} />
                      <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {todo.title}
                      </span>
                    </div>
                  )) : (
                    <p style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', margin: 0, paddingLeft: 14 }}>All clear</p>
                  )}
                </div>
              )
            })}
          </div>
        </aside>
      )}
    </div>
  )
}
