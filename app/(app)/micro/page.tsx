import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/server/db'
import { contexts, todos, dates } from '@/server/db/schema'
import { eq, and, gte, lte, inArray } from 'drizzle-orm'
import { Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { PromoteButton } from '@/components/micro/PromoteButton'

const priorityOrder = { high: 0, medium: 1, low: 2 } as const
const priorityColor = { high: '#d95f5f', medium: '#d4883a', low: '#a0a8b0' } as const

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
            const ctxDates = datesByCtx.get(ctx.id) ?? []

            const topTodo = ctxTodos[0] ?? null
            const topDate = ctxDates[0] ?? null

            // Primary: highest-priority todo, or next date if no todos
            // Secondary: next date if primary is a todo, else nothing
            const primary = topTodo
              ? { kind: 'todo' as const, item: topTodo }
              : topDate
                ? { kind: 'date' as const, item: topDate }
                : null

            const secondary = topTodo && topDate
              ? { kind: 'date' as const, item: topDate }
              : null

            const remainingTodos = ctxTodos.length - (topTodo ? 1 : 0)

            return (
              <div
                key={ctx.id}
                className="card-shadow"
                style={{
                  background: 'hsl(var(--card))',
                  border: '0.5px solid hsl(var(--border))',
                  borderRadius: 12,
                  overflow: 'hidden',
                }}
              >
                {/* Header */}
                <div style={{
                  padding: '11px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  borderBottom: '0.5px solid hsl(var(--border))',
                }}>
                  <span style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: ctx.color,
                    flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 13, fontWeight: 500, flex: 1, minWidth: 0 }}>
                    {ctx.name}
                  </span>
                  <PromoteButton contextId={ctx.id} />
                </div>

                {/* Body */}
                <div style={{
                  padding: '10px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 7,
                }}>
                  {primary === null ? (
                    <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>
                      All clear
                    </span>
                  ) : (
                    <>
                      {primary.kind === 'todo' && (
                        <TodoRow
                          title={primary.item.title}
                          priority={primary.item.priority}
                          dueDate={primary.item.dueDate ?? null}
                          today={today}
                        />
                      )}
                      {primary.kind === 'date' && (
                        <DateRow
                          title={primary.item.title}
                          date={primary.item.date}
                          color={ctx.color}
                        />
                      )}

                      {secondary?.kind === 'date' && (
                        <DateRow
                          title={secondary.item.title}
                          date={secondary.item.date}
                          color={ctx.color}
                        />
                      )}

                      {remainingTodos > 0 && (
                        <span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>
                          +{remainingTodos} more todo{remainingTodos === 1 ? '' : 's'}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function TodoRow({
  title,
  priority,
  dueDate,
  today,
}: {
  title: string
  priority: keyof typeof priorityColor
  dueDate: string | null
  today: string
}) {
  const isOverdue = dueDate != null && dueDate <= today
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      <span style={{
        marginTop: 5,
        width: 6,
        height: 6,
        borderRadius: '50%',
        flexShrink: 0,
        background: priorityColor[priority],
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          fontSize: 13,
          lineHeight: 1.4,
          display: 'block',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {title}
        </span>
        {dueDate && (
          <span style={{
            fontSize: 11,
            color: isOverdue ? '#d95f5f' : 'hsl(var(--muted-foreground))',
            display: 'block',
            marginTop: 1,
          }}>
            {isOverdue ? 'Overdue · ' : ''}{formatDate(dueDate)}
          </span>
        )}
      </div>
    </div>
  )
}

function DateRow({
  title,
  date,
  color,
}: {
  title: string
  date: string
  color: string
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Calendar
        size={11}
        strokeWidth={1.5}
        style={{ color, flexShrink: 0 }}
      />
      <span style={{
        fontSize: 13,
        color: 'hsl(var(--muted-foreground))',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {title}
        <span style={{ marginLeft: 5 }}>· {formatDate(date)}</span>
      </span>
    </div>
  )
}
