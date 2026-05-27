import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/server/db'
import { contexts, todos, todoLists, dates, notes, habits, habitLogs, links, people, widgetConfigs } from '@/server/db/schema'
import { eq, and, inArray, gte } from 'drizzle-orm'
import type { Habit, HabitLog } from '@/lib/types'
import { MacroHero } from '@/components/macro/MacroHero'
import { MacroPriorities } from '@/components/macro/MacroPriorities'
import { MacroAhead } from '@/components/macro/MacroAhead'
import { MacroNotes } from '@/components/macro/MacroNotes'
import { ReferenceStrip } from '@/components/macro/ReferenceStrip'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ContextPage({ params }: Props) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  const userId = session.user.id

  const context = await db.query.contexts.findFirst({
    where: and(eq(contexts.id, id), eq(contexts.userId, userId)),
  })
  if (!context) notFound()

  const today     = new Date().toISOString().split('T')[0]
  const in30days  = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  const cutoff28d = new Date(Date.now() - 28 * 86400000).toISOString().split('T')[0]

  const [
    ctxTodos,
    ctxTodoLists,
    ctxDates,
    ctxNotes,
    ctxHabits,
    ctxLinks,
    ctxPeople,
    configs,
    completedIn28d,
  ] = await Promise.all([
    db.query.todos.findMany({
      where: and(eq(todos.contextId, id), eq(todos.userId, userId), eq(todos.done, false)),
    }),
    db.query.todoLists.findMany({
      where: and(eq(todoLists.contextId, id), eq(todoLists.userId, userId)),
      orderBy: (l, { asc }) => [asc(l.order)],
    }),
    db.query.dates.findMany({
      where: and(eq(dates.contextId, id), eq(dates.userId, userId), gte(dates.date, today)),
      orderBy: (d, { asc }) => [asc(d.date)],
    }),
    db.query.notes.findMany({
      where: and(eq(notes.contextId, id), eq(notes.userId, userId)),
      orderBy: (n, { desc }) => [desc(n.updatedAt)],
    }),
    db.query.habits.findMany({
      where: and(eq(habits.contextId, id), eq(habits.userId, userId)),
    }),
    db.query.links.findMany({
      where: and(eq(links.contextId, id), eq(links.userId, userId)),
    }),
    db.query.people.findMany({
      where: and(eq(people.contextId, id), eq(people.userId, userId)),
    }),
    db.query.widgetConfigs.findMany({
      where: eq(widgetConfigs.contextId, id),
    }),
    db.query.todos.findMany({
      where: and(eq(todos.contextId, id), eq(todos.userId, userId), eq(todos.done, true), gte(todos.completedAt, cutoff28d)),
      columns: { completedAt: true },
    }),
  ])

  // Sequential: habitLogs need habitIds first
  const habitIds = ctxHabits.map(h => h.id)
  const habitLogs28d: HabitLog[] = habitIds.length > 0
    ? await db.query.habitLogs.findMany({
        where: and(inArray(habitLogs.habitId, habitIds), gte(habitLogs.date, cutoff28d)),
      })
    : []

  // ── Derived stats ────────────────────────────────────────────────────────────

  const overdueCt   = ctxTodos.filter(t => t.dueDate && t.dueDate < today).length
  const highCt      = ctxTodos.filter(t => t.priority === 'high').length
  const upcoming30d = ctxDates.filter(d => d.date <= in30days).length
    + ctxTodos.filter(t => t.dueDate && t.dueDate >= today && t.dueDate <= in30days).length

  const nearestDate = ctxDates[0] ?? null
  const nextEventDays = nearestDate
    ? Math.ceil((new Date(nearestDate.date + 'T12:00:00').getTime() - Date.now()) / 86400000)
    : null
  const nextEventStr = nextEventDays != null
    ? nextEventDays <= 0 ? 'today' : nextEventDays === 1 ? '1d' : `${nextEventDays}d`
    : '—'

  function computeStreak(habitId: string, logs: HabitLog[]) {
    let s = 0
    for (let i = 0; i < 28; i++) {
      const d = new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
      if (logs.some(l => l.habitId === habitId && l.date === d && l.completed)) s++
      else break
    }
    return s
  }

  const topStreak = ctxHabits.length > 0
    ? Math.max(...ctxHabits.map(h => computeStreak(h.id, habitLogs28d)))
    : 0

  const habitsWithStreak = ctxHabits.map((h: Habit) => ({
    ...h,
    streak: computeStreak(h.id, habitLogs28d),
    completedToday: habitLogs28d.some(l => l.habitId === h.id && l.date === today && l.completed),
  }))

  // 28-day activity heatmap: 0|1 per day, oldest first
  const activity28d = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(Date.now() - (27 - i) * 86400000).toISOString().split('T')[0]
    return completedIn28d.some(t => t.completedAt?.startsWith(d)) ? 1 : 0
  })

  // Mantra
  const mantraConfig = configs.find(c => c.widgetType === 'mantra')
  const mantraText = (mantraConfig?.settings as { text?: string } | null)?.text ?? null

  // Section visibility
  const SECTION_TYPES = ['todos', 'dates', 'notes', 'habits', 'links', 'people', 'mantra'] as const
  const sectionEnabled = Object.fromEntries(
    SECTION_TYPES.map(type => [
      type,
      configs.find(c => c.widgetType === type)?.enabled ?? (type !== 'mantra'),
    ])
  ) as Record<string, boolean>

  const showPriorities = sectionEnabled.todos
  const showAhead      = sectionEnabled.dates
  const showNotes      = sectionEnabled.notes

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <MacroHero
        contextId={id}
        name={context.name}
        color={context.color}
        type={context.type}
        description={context.description ?? null}
        mantraText={mantraText}
        overdueCt={overdueCt}
        highCt={highCt}
        upcoming30d={upcoming30d}
        topStreak={topStreak}
        nextEventStr={nextEventStr}
        activity28d={activity28d}
        sectionEnabled={sectionEnabled}
      />
      <div className="page-pad" style={{ flex: 1, paddingBottom: 40 }}>
        {(showPriorities || showAhead) && (
          <div className="macro-body-grid" style={{ marginBottom: 16 }}>
            {showPriorities && (
              <MacroPriorities
                todos={ctxTodos}
                todoLists={ctxTodoLists}
                color={context.color}
                contextId={id}
              />
            )}
            {showAhead && (
              <MacroAhead
                todos={ctxTodos}
                dates={ctxDates}
                color={context.color}
                contextId={id}
                in30days={in30days}
              />
            )}
          </div>
        )}
        {showNotes && (
          <div style={{ marginBottom: 16 }}>
            <MacroNotes
              notes={ctxNotes}
              color={context.color}
              contextId={id}
            />
          </div>
        )}
        <ReferenceStrip
          habitsWithStreak={habitsWithStreak}
          links={ctxLinks}
          people={ctxPeople}
          color={context.color}
          contextId={id}
          sectionEnabled={sectionEnabled}
        />
      </div>
    </div>
  )
}
