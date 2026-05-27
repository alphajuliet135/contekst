import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/server/db'
import { contexts, todos, dates, users, widgetConfigs } from '@/server/db/schema'
import { eq, and, lte, gte, inArray } from 'drizzle-orm'
import { BriefingHero } from '@/components/mission-control/BriefingHero'
import { MantraStrip } from '@/components/mission-control/MantraStrip'
import { PinnedStrip, type PinnedItemShape } from '@/components/mission-control/PinnedStrip'
import { NowColumn, type TodoWithCtx } from '@/components/mission-control/NowColumn'
import { WeekTimeline, type AheadDay, type AheadItem } from '@/components/mission-control/WeekTimeline'
import { MicroPulse, type MicroCardData } from '@/components/mission-control/MicroPulse'
import type { Priority } from '@/lib/types'
import type { WeekDay } from '@/components/mission-control/WeekStrip'

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function MissionControlPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  const userId = session.user.id

  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { name: true },
  })
  const firstName = dbUser?.name?.split(' ')[0] ?? null

  const userContexts = await db.query.contexts.findMany({
    where: eq(contexts.userId, userId),
    orderBy: (c, { asc }) => [asc(c.order)],
  })
  const macros = userContexts.filter(c => c.type === 'macro')
  const micros  = userContexts.filter(c => c.type === 'micro')
  const contextIds = userContexts.map(c => c.id)

  const today    = new Date().toISOString().split('T')[0]
  const in6days  = new Date(Date.now() +  6 * 86400000).toISOString().split('T')[0]
  const in14days = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  const cutoff7d = new Date(Date.now() -  7 * 86400000).toISOString()

  const [activeTodos, datesIn14d, pinnedDates, mantraConfigs, completedIn7d] = await Promise.all([
    db.query.todos.findMany({
      where: and(eq(todos.userId, userId), eq(todos.done, false)),
    }),
    db.query.dates.findMany({
      where: and(eq(dates.userId, userId), gte(dates.date, today), lte(dates.date, in14days)),
      orderBy: (d, { asc }) => [asc(d.date)],
    }),
    db.query.dates.findMany({
      where: and(eq(dates.userId, userId), eq(dates.pinned, true)),
    }),
    contextIds.length > 0
      ? db.query.widgetConfigs.findMany({
          where: and(
            eq(widgetConfigs.widgetType, 'mantra'),
            inArray(widgetConfigs.contextId, contextIds),
          ),
        })
      : Promise.resolve([]),
    db.query.todos.findMany({
      where: and(eq(todos.userId, userId), eq(todos.done, true), gte(todos.completedAt, cutoff7d)),
      columns: { contextId: true, completedAt: true },
    }),
  ])

  // ── Derived data ────────────────────────────────────────────────────────────

  const overdueTodos  = activeTodos.filter(t => t.dueDate && t.dueDate < today)
  const dueTodayTodos = activeTodos.filter(t => t.dueDate === today)

  const upcoming7dCount =
    datesIn14d.filter(d => d.date >= today && d.date <= in6days).length +
    activeTodos.filter(t => t.dueDate && t.dueDate > today && t.dueDate <= in6days).length

  // topContextByLoad — macro with most overdue+dueToday items
  const loadByCtx = new Map<string, number>()
  for (const t of [...overdueTodos, ...dueTodayTodos]) {
    loadByCtx.set(t.contextId, (loadByCtx.get(t.contextId) ?? 0) + 1)
  }
  const topCtxId = [...loadByCtx.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
  const topContextByLoad = topCtxId
    ? (macros.find(c => c.id === topCtxId)?.name ?? null)
    : null

  // Mantra — first non-empty text + the contextId that owns it (for editing)
  const mantraOwnerConfig = mantraConfigs.find(c => {
    const t = (c.settings as { text?: string } | null)?.text
    return t && t.trim().length > 0
  })
  const mantraText = mantraOwnerConfig
    ? (mantraOwnerConfig.settings as { text?: string }).text ?? null
    : null
  // Fallback contextId for editing when no mantra is set yet
  const mantraContextId = mantraOwnerConfig?.contextId ?? userContexts[0]?.id ?? null

  // WeekStrip — 7 days from today
  function makeWeekDays(): WeekDay[] {
    const priorityOpacity: Record<Priority, number> = { high: 1, medium: 0.65, low: 0.4 }
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(Date.now() + i * 86400000)
      const dateStr = d.toISOString().split('T')[0]
      const isToday = dateStr === today
      const dayLabel = d.toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase().slice(0, 3)
      const dateNum = d.getDate()
      const dots = [
        ...activeTodos
          .filter(t => t.dueDate === dateStr)
          .map(t => {
            const ctx = userContexts.find(c => c.id === t.contextId)
            return { color: ctx?.color ?? '#666', opacity: priorityOpacity[t.priority] }
          }),
        ...datesIn14d
          .filter(d2 => d2.date === dateStr)
          .map(d2 => {
            const ctx = userContexts.find(c => c.id === d2.contextId)
            return { color: ctx?.color ?? '#666', opacity: 0.7 }
          }),
      ]
      return { dayLabel, dateNum, isToday, dots }
    })
  }
  const weekDays = makeWeekDays()

  // Pinned items — up to 3
  const pinnedTodos = activeTodos.filter(t => t.pinned)
  const pinnedAll: PinnedItemShape[] = [
    ...pinnedTodos.map(t => ({ id: t.id, type: 'todo' as const, title: t.title, contextId: t.contextId })),
    ...pinnedDates.map(d => ({ id: d.id, type: 'date' as const, title: d.title, contextId: d.contextId })),
  ].slice(0, 3).map(item => {
    const ctx = userContexts.find(c => c.id === item.contextId)
    return { ...item, contextName: ctx?.name ?? '', contextColor: ctx?.color ?? '#666' }
  })

  // NowColumn data
  function withCtx(t: typeof activeTodos[number]): TodoWithCtx {
    const ctx = userContexts.find(c => c.id === t.contextId)
    return {
      id: t.id, title: t.title, priority: t.priority, dueDate: t.dueDate,
      contextName: ctx?.name ?? '', contextColor: ctx?.color ?? '#666',
    }
  }
  const overdueWithCtx  = overdueTodos.map(withCtx)
  const dueTodayWithCtx = dueTodayTodos.map(withCtx)

  // WeekTimeline — group todos/dates by day for tomorrow → +14 days
  function makeAheadDays(): AheadDay[] {
    const todayMonth = new Date(today).getMonth()
    const map = new Map<string, AheadItem[]>()

    for (const t of activeTodos) {
      if (!t.dueDate || t.dueDate <= today || t.dueDate > in14days) continue
      if (!map.has(t.dueDate)) map.set(t.dueDate, [])
      const ctx = userContexts.find(c => c.id === t.contextId)
      map.get(t.dueDate)!.push({
        kind: 'todo', id: t.id, title: t.title, priority: t.priority,
        contextColor: ctx?.color ?? '#666', contextName: ctx?.name ?? '',
      })
    }
    for (const d of datesIn14d) {
      if (d.date <= today) continue
      if (!map.has(d.date)) map.set(d.date, [])
      const ctx = userContexts.find(c => c.id === d.contextId)
      map.get(d.date)!.push({
        kind: 'date', id: d.id, title: d.title, subtitle: d.note ?? undefined,
        contextColor: ctx?.color ?? '#666', contextName: ctx?.name ?? '',
      })
    }

    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateStr, items]) => {
        const [y, mo, dy] = dateStr.split('-').map(Number)
        const dt = new Date(y, mo - 1, dy)
        const wd = dt.toLocaleDateString('en-GB', { weekday: 'short' })
        const day = dy
        const monthChanged = dt.getMonth() !== todayMonth
        const monthStr = monthChanged ? dt.toLocaleDateString('en-GB', { month: 'short' }) : ''
        const label = monthChanged
          ? `${wd}  ${String(day).padStart(2, ' ')} ${monthStr}`
          : `${wd} ${day}`
        return { label, items }
      })
  }
  const aheadDays = makeAheadDays()

  // MicroPulse data
  const microCards: MicroCardData[] = micros.map(ctx => {
    const ctxTodos = activeTodos
      .filter(t => t.contextId === ctx.id)
      .sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority]))
    const topTodo = ctxTodos[0]?.title ?? null
    const count = ctxTodos.length
    const meta = count > 0 ? `${count} todo${count !== 1 ? 's' : ''}` : 'all clear'

    const days7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(Date.now() - (6 - i) * 86400000).toISOString().split('T')[0]
      return completedIn7d.filter(t => t.contextId === ctx.id && t.completedAt?.startsWith(d)).length
    })
    const maxVal = Math.max(...days7, 1)
    const pulse = days7.map(v => v / maxVal)
    return { id: ctx.id, name: ctx.name, color: ctx.color, topTodo, meta, pulse }
  })

  // ── Render ──────────────────────────────────────────────────────────────────

  const SECTION_LABEL: React.CSSProperties = {
    fontSize: 11, fontWeight: 500, color: 'hsl(var(--muted-foreground))',
    letterSpacing: 0.8, textTransform: 'uppercase', margin: 0,
  }
  const MONO: React.CSSProperties = {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    fontSize: 11, color: 'hsl(var(--muted-foreground))',
  }

  return (
    <div className="page-pad" style={{ flex: 1, paddingBottom: 40 }}>

      <BriefingHero
        firstName={firstName}
        overdueCount={overdueTodos.length}
        dueTodayCount={dueTodayTodos.length}
        upcoming7dCount={upcoming7dCount}
        topContextByLoad={topContextByLoad}
        weekDays={weekDays}
      />

      {/* Mantra — always shown when contexts exist so users can set/clear it */}
      {mantraContextId && (
        <section style={{ marginBottom: 22 }}>
          <MantraStrip text={mantraText} contextId={mantraContextId} />
        </section>
      )}

      {/* Pinned */}
      {pinnedAll.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={SECTION_LABEL}>Pinned</p>
          </div>
          <PinnedStrip items={pinnedAll} />
        </section>
      )}

      {/* Now / Ahead */}
      {(overdueWithCtx.length > 0 || dueTodayWithCtx.length > 0 || aheadDays.length > 0) && (
        <section className="mc-body-grid" style={{ marginBottom: 24 }}>
          {(overdueWithCtx.length > 0 || dueTodayWithCtx.length > 0) ? (
            <NowColumn overdue={overdueWithCtx} dueToday={dueTodayWithCtx} />
          ) : (
            <div style={{
              background: 'hsl(var(--card))',
              border: '0.5px solid hsl(var(--border))',
              borderRadius: 14,
              padding: '14px 18px',
            }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 8px', letterSpacing: -0.2 }}>Now</h2>
              <p style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))', margin: 0 }}>All clear — nothing overdue or due today.</p>
            </div>
          )}
          <WeekTimeline days={aheadDays} />
        </section>
      )}

      {/* Micro pulse */}
      {microCards.length > 0 && (
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={SECTION_LABEL}>Micro pulse</p>
            <span style={MONO}>{microCards.length} micro{microCards.length !== 1 ? 's' : ''} · ticking along</span>
          </div>
          <MicroPulse micros={microCards} />
        </section>
      )}

      {/* Empty state */}
      {userContexts.length === 0 && (
        <div style={{ marginTop: 60 }}>
          <p style={{ fontSize: 15, fontWeight: 500, margin: 0 }}>No contexts yet</p>
          <p style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))', marginTop: 6, marginBottom: 0 }}>
            Add your first context using the button above.
          </p>
        </div>
      )}
    </div>
  )
}
