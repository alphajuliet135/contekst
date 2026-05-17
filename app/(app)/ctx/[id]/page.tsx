import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import { db } from '@/server/db'
import {
  contexts, todos, dates, notes, habits, habitLogs, links, people, widgetConfigs,
} from '@/server/db/schema'
import { eq, and, inArray } from 'drizzle-orm'
import type { WidgetType } from '@/lib/types'
import { colorTint } from '@/lib/utils'
import { TodosWidget } from '@/components/widgets/TodosWidget'
import { DatesWidget } from '@/components/widgets/DatesWidget'
import { NotesWidget } from '@/components/widgets/NotesWidget'
import { HabitsWidget } from '@/components/widgets/HabitsWidget'
import { LinksWidget } from '@/components/widgets/LinksWidget'
import { PeopleWidget } from '@/components/widgets/PeopleWidget'
import { WidgetToggleBar } from '@/components/widgets/WidgetToggleBar'

const ALL_WIDGET_TYPES: WidgetType[] = ['todos', 'dates', 'notes', 'habits', 'links', 'people']

interface Props {
  params: Promise<{ id: string }>
}

export default async function ContextPage({ params }: Props) {
  const { id } = await params
  const session = await auth()
  if (!session) redirect('/login')
  const userId = session.user.id

  const context = await db.query.contexts.findFirst({
    where: and(eq(contexts.id, id), eq(contexts.userId, userId)),
  })
  if (!context) notFound()

  const today = new Date().toISOString().split('T')[0]

  const [
    ctxTodos,
    ctxDates,
    ctxNotes,
    ctxHabits,
    ctxLinks,
    ctxPeople,
    configs,
  ] = await Promise.all([
    db.query.todos.findMany({
      where: and(eq(todos.contextId, id), eq(todos.userId, userId)),
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

  // Widget visibility: default all enabled, override from configs
  const configMap = new Map(configs.map(c => [c.widgetType, c.enabled]))
  const isEnabled = (type: WidgetType) =>
    configMap.has(type) ? (configMap.get(type) ?? true) : true

  const initialEnabled = Object.fromEntries(
    ALL_WIDGET_TYPES.map(type => [type, isEnabled(type)])
  ) as Record<WidgetType, boolean>

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
    'Macro context',
    activeTodos > 0 ? `${activeTodos} open todo${activeTodos === 1 ? '' : 's'}` : null,
    nextEventText,
  ].filter(Boolean).join(' · ')

  async function demoteToMicro() {
    'use server'
    await db.update(contexts).set({ type: 'micro' })
      .where(and(eq(contexts.id, id), eq(contexts.userId, userId)))
    redirect('/micro')
  }

  async function promoteToMacro() {
    'use server'
    await db.update(contexts).set({ type: 'macro' })
      .where(and(eq(contexts.id, id), eq(contexts.userId, userId)))
    redirect(`/ctx/${id}`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      {/* Colored header */}
      <div style={{
        background: colorTint(context.color, 0.12),
        borderBottom: `0.5px solid ${colorTint(context.color, 0.25)}`,
        padding: '20px 40px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 16,
        flexShrink: 0,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
            <span style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: context.color,
              flexShrink: 0,
            }} />
            <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: -0.4, margin: 0 }}>
              {context.name}
            </h1>
          </div>
          <p style={{
            fontSize: 13,
            color: context.color,
            margin: 0,
            paddingLeft: 20,
            opacity: 0.9,
          }}>
            {fullMeta || 'Macro context'}
          </p>
        </div>

        <form action={context.type === 'macro' ? demoteToMicro : promoteToMacro}>
          <button
            type="submit"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px',
              borderRadius: 7,
              border: `0.5px solid ${colorTint(context.color, 0.35)}`,
              background: colorTint(context.color, 0.08),
              fontSize: 12,
              color: 'hsl(var(--muted-foreground))',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              marginTop: 4,
            }}
          >
            {context.type === 'macro' ? 'Move to Micro' : 'Promote to Macro'}
          </button>
        </form>
      </div>

      {/* Widget grid */}
      <div style={{ flex: 1, padding: '20px 44px 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
        }}>
          {isEnabled('todos') && (
            <TodosWidget todos={ctxTodos} color={context.color} />
          )}
          {isEnabled('dates') && (
            <DatesWidget dates={ctxDates} color={context.color} />
          )}
          {isEnabled('notes') && (
            <div style={{ gridColumn: '1 / -1' }}>
              <NotesWidget notes={ctxNotes} color={context.color} />
            </div>
          )}
          {isEnabled('habits') && (
            <HabitsWidget habits={ctxHabits} logs={todayLogs} color={context.color} />
          )}
          {isEnabled('links') && (
            <LinksWidget links={ctxLinks} color={context.color} />
          )}
          {isEnabled('people') && (
            <PeopleWidget people={ctxPeople} color={context.color} />
          )}
        </div>
      </div>

      {/* Widget toggle bar */}
      <WidgetToggleBar contextId={id} color={context.color} initialEnabled={initialEnabled} />
    </div>
  )
}
