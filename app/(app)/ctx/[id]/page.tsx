import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import { db } from '@/server/db'
import {
  contexts, todos, todoLists, dates, notes, habits, habitLogs, links, people, widgetConfigs,
} from '@/server/db/schema'
import { eq, and, inArray, or, gte } from 'drizzle-orm'
import type { WidgetType, WidgetInstance } from '@/lib/types'
import { ContextHeader } from '@/components/layout/ContextHeader'
import { WidgetDashboard } from '@/components/widgets/WidgetDashboard'

const ALL_WIDGET_TYPES: WidgetType[] = ['todos', 'dates', 'notes', 'habits', 'links', 'people', 'mantra']

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

  const today = new Date().toISOString().split('T')[0]
  // Only show done tasks completed within the last 7 days
  const cutoff = new Date(Date.now() - 7 * 86400000).toISOString()

  const [
    ctxTodos,
    ctxTodoLists,
    ctxDates,
    ctxNotes,
    ctxHabits,
    ctxLinks,
    ctxPeople,
    configs,
  ] = await Promise.all([
    db.query.todos.findMany({
      where: and(
        eq(todos.contextId, id),
        eq(todos.userId, userId),
        or(
          eq(todos.done, false),
          and(eq(todos.done, true), gte(todos.completedAt, cutoff)),
        ),
      ),
    }),
    db.query.todoLists.findMany({
      where: and(eq(todoLists.contextId, id), eq(todoLists.userId, userId)),
      orderBy: (l, { asc }) => [asc(l.order)],
    }),
    db.query.dates.findMany({
      where: and(eq(dates.contextId, id), eq(dates.userId, userId)),
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
  ])

  const habitIds = ctxHabits.map(h => h.id)
  const todayLogs = habitIds.length > 0
    ? await db.query.habitLogs.findMany({
        where: and(eq(habitLogs.date, today), inArray(habitLogs.habitId, habitIds)),
      })
    : []

  // Mantra text from widget_configs.settings
  const mantraConfig = configs.find(c => c.widgetType === 'mantra')
  const mantraText = (mantraConfig?.settings as { text?: string } | null)?.text ?? null

  // Split configs: todos instances vs single-instance widget types
  const todosConfigs = configs.filter(c => c.widgetType === 'todos')
  const otherConfigs = configs.filter(c => c.widgetType !== 'todos')

  // For single-instance types: enabled state (keyed by type)
  const otherConfigMap = new Map(otherConfigs.map(c => [c.widgetType, c]))
  const isSingleEnabled = (type: WidgetType) => {
    const cfg = otherConfigMap.get(type)
    return cfg ? cfg.enabled : type !== 'mantra'
  }

  const initialEnabled = Object.fromEntries(
    ALL_WIDGET_TYPES.map(type => [
      type,
      type === 'todos' ? todosConfigs.some(c => c.enabled) : isSingleEnabled(type),
    ])
  ) as Record<WidgetType, boolean>

  // Todos: one instance per enabled config; fall back to a default if none exist
  const enabledTodosInstances: WidgetInstance[] = todosConfigs
    .filter(c => c.enabled)
    .sort((a, b) => a.order - b.order)
    .map(c => ({
      id: c.id,
      type: 'todos' as WidgetType,
      settings: (c.settings as Record<string, unknown>) ?? null,
      label: c.label ?? null,
    }))

  const defaultTodosInstance: WidgetInstance = { id: 'default-todos', type: 'todos', settings: null, label: null }
  const todosInstances = enabledTodosInstances.length > 0 ? enabledTodosInstances : [defaultTodosInstance]

  // Single-instance widget types: build ordered entries for enabled ones
  type WithOrder = WidgetInstance & { _order: number }
  const singleInstances: WithOrder[] = ALL_WIDGET_TYPES
    .filter(t => t !== 'todos' && isSingleEnabled(t))
    .map(type => {
      const cfg = otherConfigMap.get(type)
      return {
        id: cfg?.id ?? `default-${type}`,
        type,
        settings: (cfg?.settings as Record<string, unknown>) ?? null,
        label: cfg?.label ?? null,
        _order: cfg?.order ?? 99,
      }
    })

  const todosWithOrder: WithOrder[] = todosInstances.map((inst, i) => ({
    ...inst,
    _order: todosConfigs.find(c => c.id === inst.id)?.order ?? i,
  }))

  const orderedInstances: WidgetInstance[] = [...todosWithOrder, ...singleInstances]
    .sort((a, b) => a._order - b._order)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(({ _order, ...rest }) => rest)

  const widgetSettings = Object.fromEntries(
    otherConfigs.map(c => [c.widgetType, (c.settings as Record<string, unknown>) ?? {}])
  ) as Partial<Record<WidgetType, Record<string, unknown>>>

  // Header meta line
  const activeTodos = ctxTodos.filter(t => !t.done).length
  const metaParts = [
    activeTodos > 0 ? `${activeTodos} todo${activeTodos === 1 ? '' : 's'}` : null,
    ctxDates.length > 0 ? `${ctxDates.length} date${ctxDates.length === 1 ? '' : 's'}` : null,
    ctxHabits.length > 0 ? `${ctxHabits.length} habit${ctxHabits.length === 1 ? '' : 's'}` : null,
    ctxPeople.length > 0 ? `${ctxPeople.length} ${ctxPeople.length === 1 ? 'person' : 'people'}` : null,
  ].filter(Boolean)
  const meta = metaParts.join(' · ')

  // Next event countdown
  const nearestDate = ctxDates[0] ?? null
  const daysUntil = nearestDate
    ? Math.ceil((new Date(nearestDate.date + 'T12:00:00').getTime() - Date.now()) / 86400000)
    : null
  const nextEventText = daysUntil !== null
    ? daysUntil <= 0 ? 'Event today'
    : daysUntil === 1 ? 'Next event tomorrow'
    : `Next event in ${daysUntil} days`
    : null

  const fullMeta = [
    context.type === 'macro' ? 'Macro context' : 'Micro context',
    activeTodos > 0 ? `${activeTodos} open todo${activeTodos === 1 ? '' : 's'}` : null,
    nextEventText,
  ].filter(Boolean).join(' · ')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <ContextHeader
        contextId={id}
        name={context.name}
        color={context.color}
        type={context.type}
        description={context.description ?? null}
        meta={fullMeta}
      />

      <WidgetDashboard
        contextId={id}
        contextColor={context.color}
        orderedInstances={orderedInstances}
        initialEnabled={initialEnabled}
        widgetSettings={widgetSettings}
        todos={ctxTodos}
        todoLists={ctxTodoLists}
        dates={ctxDates}
        notes={ctxNotes}
        habits={ctxHabits}
        todayLogs={todayLogs}
        links={ctxLinks}
        people={ctxPeople}
        mantraText={mantraText}
      />
    </div>
  )
}
