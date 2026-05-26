import { withAuthParams } from '@/lib/api'
import { db } from '@/server/db'
import { contexts, todos, todoLists, dates, notes, habits, habitLogs, links, people, widgetConfigs } from '@/server/db/schema'
import { eq, and, inArray, or, gte } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import type { WidgetType, WidgetInstance } from '@/lib/types'

const ALL_WIDGET_TYPES: WidgetType[] = ['todos', 'dates', 'notes', 'habits', 'links', 'people', 'mantra']

export const GET = withAuthParams<{ id: string }>(async (userId, _req, { id }) => {
  const context = await db.query.contexts.findFirst({
    where: and(eq(contexts.id, id), eq(contexts.userId, userId)),
  })
  if (!context) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const today     = new Date().toISOString().split('T')[0]
  const cutoff    = new Date(Date.now() - 7 * 86400000).toISOString()
  const cutoff28d = new Date(Date.now() - 28 * 86400000).toISOString().split('T')[0]

  const [ctxTodos, ctxTodoLists, ctxDates, ctxNotes, ctxHabits, ctxLinks, ctxPeople, configs, completedIn28d] = await Promise.all([
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
    db.query.todos.findMany({
      where: and(eq(todos.contextId, id), eq(todos.userId, userId), eq(todos.done, true), gte(todos.completedAt, cutoff28d)),
      columns: { completedAt: true },
    }),
  ])

  const habitIds = ctxHabits.map(h => h.id)
  const [todayLogs, habitLogs28d] = await Promise.all([
    habitIds.length > 0
      ? db.query.habitLogs.findMany({
          where: and(eq(habitLogs.date, today), inArray(habitLogs.habitId, habitIds)),
        })
      : Promise.resolve([]),
    habitIds.length > 0
      ? db.query.habitLogs.findMany({
          where: and(inArray(habitLogs.habitId, habitIds), gte(habitLogs.date, cutoff28d)),
        })
      : Promise.resolve([]),
  ])

  const mantraConfig = configs.find(c => c.widgetType === 'mantra')
  const mantraText = (mantraConfig?.settings as { text?: string } | null)?.text ?? null

  const todosConfigs = configs.filter(c => c.widgetType === 'todos')
  const otherConfigs = configs.filter(c => c.widgetType !== 'todos')
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

  const sectionEnabled = Object.fromEntries(
    ALL_WIDGET_TYPES.map(type => [
      type,
      type === 'todos'
        ? (todosConfigs.some(c => c.enabled) || todosConfigs.length === 0)
        : isSingleEnabled(type as WidgetType),
    ])
  ) as Record<string, boolean>

  return NextResponse.json({
    contextId: context.id,
    contextColor: context.color,
    orderedInstances,
    initialEnabled,
    widgetSettings,
    todos: ctxTodos,
    todoLists: ctxTodoLists,
    dates: ctxDates,
    notes: ctxNotes,
    habits: ctxHabits,
    todayLogs,
    habitLogs28d,
    completedIn28d,
    links: ctxLinks,
    people: ctxPeople,
    mantraText,
    sectionEnabled,
  })
})
