import { withAuth } from '@/lib/api'
import { db } from '@/server/db'
import { contexts, widgetConfigs, todoLists, todos, dates, notes, habits, habitLogs, links, people } from '@/server/db/schema'
import { eq, inArray } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { version } from '../../../package.json'

export const GET = withAuth(async (userId) => {
  const ctxRows = await db.query.contexts.findMany({ where: eq(contexts.userId, userId) })
  const ctxIds  = ctxRows.map(c => c.id)

  const [wc, tl, td, dt, nt, hb, lk, pp] = ctxIds.length > 0
    ? await Promise.all([
        db.query.widgetConfigs.findMany({ where: inArray(widgetConfigs.contextId, ctxIds) }),
        db.query.todoLists.findMany({ where: eq(todoLists.userId, userId) }),
        db.query.todos.findMany({ where: eq(todos.userId, userId) }),
        db.query.dates.findMany({ where: eq(dates.userId, userId) }),
        db.query.notes.findMany({ where: eq(notes.userId, userId) }),
        db.query.habits.findMany({ where: eq(habits.userId, userId) }),
        db.query.links.findMany({ where: eq(links.userId, userId) }),
        db.query.people.findMany({ where: eq(people.userId, userId) }),
      ])
    : [[], [], [], [], [], [], [], []]

  const habitIds = (hb as { id: string }[]).map(h => h.id)
  const hl = habitIds.length > 0
    ? await db.query.habitLogs.findMany({ where: inArray(habitLogs.habitId, habitIds) })
    : []

  const payload = {
    version: '1',
    exportedAt: new Date().toISOString(),
    appVersion: version,
    contexts: ctxRows,
    widgetConfigs: wc,
    todoLists: tl,
    todos: td,
    dates: dt,
    notes: nt,
    habits: hb,
    habitLogs: hl,
    links: lk,
    people: pp,
  }

  const dateStr = new Date().toISOString().split('T')[0]
  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="contekst-backup-${dateStr}.json"`,
    },
  })
})
