import { withAuth } from '@/lib/api'
import { db } from '@/server/db'
import { contexts, widgetConfigs, todoLists, todos, dates, notes, habits, habitLogs, links, people } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const POST = withAuth(async (userId, req) => {
  const body = await req.json()
  if (body?.version !== '1') {
    return NextResponse.json({ error: 'Unrecognised backup format' }, { status: 400 })
  }

  const { contexts: ctx, widgetConfigs: wc, todoLists: tl, todos: td, dates: dt,
          notes: nt, habits: hb, habitLogs: hl, links: lk, people: pp } = body

  // Delete all existing user data — CASCADE handles all child rows
  await db.delete(contexts).where(eq(contexts.userId, userId))

  // Re-insert in dependency order
  if (ctx?.length)  await db.insert(contexts).values(ctx)
  if (wc?.length)   await db.insert(widgetConfigs).values(wc)
  if (tl?.length)   await db.insert(todoLists).values(tl)
  if (td?.length)   await db.insert(todos).values(td)
  if (dt?.length)   await db.insert(dates).values(dt)
  if (nt?.length)   await db.insert(notes).values(nt)
  if (hb?.length)   await db.insert(habits).values(hb)
  if (hl?.length)   await db.insert(habitLogs).values(hl)
  if (lk?.length)   await db.insert(links).values(lk)
  if (pp?.length)   await db.insert(people).values(pp)

  return NextResponse.json({ ok: true })
})
