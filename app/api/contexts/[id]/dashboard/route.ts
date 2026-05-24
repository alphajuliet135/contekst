import { withAuthParams } from '@/lib/api'
import { db } from '@/server/db'
import { contexts, todos, todoLists, dates, notes, habits, habitLogs, links, people, widgetConfigs } from '@/server/db/schema'
import { eq, and, inArray, or, gte } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import type { WidgetType } from '@/lib/types'

const ALL_WIDGET_TYPES: WidgetType[] = ['todos', 'dates', 'notes', 'habits', 'links', 'people', 'mantra']

export const GET = withAuthParams<{ id: string }>(async (userId, _req, { id }) => {
  const context = await db.query.contexts.findFirst({
    where: and(eq(contexts.id, id), eq(contexts.userId, userId)),
  })
  if (!context) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const today = new Date().toISOString().split('T')[0]
  const cutoff = new Date(Date.now() - 7 * 86400000).toISOString()

  const [ctxTodos, ctxTodoLists, ctxDates, ctxNotes, ctxHabits, ctxLinks, ctxPeople, configs] = await Promise.all([
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

  const mantraConfig = configs.find(c => c.widgetType === 'mantra')
  const mantraText = (mantraConfig?.settings as { text?: string } | null)?.text ?? null

  const configMap = new Map(configs.map(c => [c.widgetType, c.enabled]))
  const orderMap  = new Map(configs.map(c => [c.widgetType, c.order]))
  const isEnabled = (type: WidgetType) =>
    configMap.has(type) ? (configMap.get(type) ?? true) : type !== 'mantra'

  const orderedEnabledTypes = ALL_WIDGET_TYPES
    .map(type => ({ type, order: orderMap.get(type) ?? 99 }))
    .filter(({ type }) => isEnabled(type))
    .sort((a, b) => a.order - b.order)
    .map(({ type }) => type)

  const initialEnabled = Object.fromEntries(
    ALL_WIDGET_TYPES.map(type => [type, isEnabled(type)])
  ) as Record<WidgetType, boolean>

  const widgetSettings = Object.fromEntries(
    configs.map(c => [c.widgetType, (c.settings as Record<string, unknown>) ?? {}])
  ) as Partial<Record<WidgetType, Record<string, unknown>>>

  return NextResponse.json({
    contextId: context.id,
    contextColor: context.color,
    orderedEnabledTypes,
    initialEnabled,
    widgetSettings,
    todos: ctxTodos,
    todoLists: ctxTodoLists,
    dates: ctxDates,
    notes: ctxNotes,
    habits: ctxHabits,
    todayLogs,
    links: ctxLinks,
    people: ctxPeople,
    mantraText,
  })
})
