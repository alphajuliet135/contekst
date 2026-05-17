import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/server/db'
import { contexts, todos, dates } from '@/server/db/schema'
import { eq, and, gte, lte, inArray } from 'drizzle-orm'
import { MicroCard } from '@/components/micro/MicroCard'

const priorityOrder = { high: 0, medium: 1, low: 2 } as const

export default async function MicroPage() {
  const session = await auth()
  if (!session) redirect('/login')
  const userId = session.user.id

  const microContexts = await db.query.contexts.findMany({
    where: and(eq(contexts.userId, userId), eq(contexts.type, 'micro')),
    orderBy: (c, { asc }) => [asc(c.order)],
  })

  const today = new Date().toISOString().split('T')[0]
  const in30days = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]

  const contextIds = microContexts.map(c => c.id)

  const [allTodos, allDates] = contextIds.length > 0
    ? await Promise.all([
        db.query.todos.findMany({
          where: and(
            eq(todos.userId, userId),
            eq(todos.done, false),
            inArray(todos.contextId, contextIds),
          ),
        }),
        db.query.dates.findMany({
          where: and(
            eq(dates.userId, userId),
            gte(dates.date, today),
            lte(dates.date, in30days),
            inArray(dates.contextId, contextIds),
          ),
          orderBy: (d, { asc }) => [asc(d.date)],
        }),
      ])
    : [[], []]

  const todosByCtx = new Map<string, typeof allTodos>()
  for (const t of allTodos) {
    if (!todosByCtx.has(t.contextId)) todosByCtx.set(t.contextId, [])
    todosByCtx.get(t.contextId)!.push(t)
  }

  const datesByCtx = new Map<string, typeof allDates>()
  for (const d of allDates) {
    if (!datesByCtx.has(d.contextId)) datesByCtx.set(d.contextId, [])
    datesByCtx.get(d.contextId)!.push(d)
  }

  return (
    <div style={{ padding: '40px 44px' }}>
      {/* Page header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, letterSpacing: -0.3, margin: 0 }}>
          Micro
        </h1>
        <p style={{
          fontSize: 13,
          color: 'hsl(var(--muted-foreground))',
          marginTop: 4,
          marginBottom: 0,
        }}>
          {microContexts.length > 0
            ? `${microContexts.length} context${microContexts.length === 1 ? '' : 's'} ticking in the background`
            : 'Low-footprint contexts that tick along without demanding attention'}
        </p>
      </div>

      {microContexts.length === 0 ? (
        <div>
          <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>No micro contexts</p>
          <p style={{
            fontSize: 13,
            color: 'hsl(var(--muted-foreground))',
            marginTop: 4,
            marginBottom: 0,
          }}>
            Demote any macro context to move it here.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 12,
        }}>
          {microContexts.map(ctx => {
            const ctxTodos = (todosByCtx.get(ctx.id) ?? [])
              .slice()
              .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
            const ctxDates = (datesByCtx.get(ctx.id) ?? [])
              .map(d => ({ id: d.id, title: d.title, date: d.date }))

            return (
              <MicroCard
                key={ctx.id}
                ctx={ctx}
                initialTodos={ctxTodos}
                initialDates={ctxDates}
                today={today}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
