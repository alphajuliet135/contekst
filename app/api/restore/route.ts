import { withAuth } from '@/lib/api'
import { db } from '@/server/db'
import { contexts, widgetConfigs, todoLists, todos, dates, notes, habits, habitLogs, links, people } from '@/server/db/schema'
import { eq, sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const POST = withAuth(async (userId, req) => {
  const body = await req.json()
  if (body?.version !== '1') {
    return NextResponse.json({ error: 'Unrecognised backup format' }, { status: 400 })
  }

  const { contexts: ctx, widgetConfigs: wc, todoLists: tl, todos: td, dates: dt,
          notes: nt, habits: hb, habitLogs: hl, links: lk, people: pp } = body

  // Backups store the original account's UUID. When restoring to a new account
  // (e.g. after a DB reset), remap every userId field to the current user.
  const backupUserId: string | undefined =
    ctx?.[0]?.userId ?? td?.[0]?.userId ?? dt?.[0]?.userId

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function remap(arr: any[] | undefined): any[] {
    if (!arr?.length) return []
    if (!backupUserId || backupUserId === userId) return arr
    return arr.map((item: { userId?: string }) =>
      item.userId === backupUserId ? { ...item, userId } : item
    )
  }

  // Disable FK checks for the bulk restore — SQLite enforces constraints
  // row-by-row which can fail when restoring across schema versions or when
  // ordering differs from what the constraint checker expects.
  await db.run(sql`PRAGMA foreign_keys = OFF`)

  try {
    // Delete all existing user data — CASCADE handles all child rows
    await db.delete(contexts).where(eq(contexts.userId, userId))

    // Re-insert in dependency order (widgetConfigs/todoLists/habitLogs have no userId)
    if (ctx?.length)  await db.insert(contexts).values(remap(ctx))
    if (wc?.length)   await db.insert(widgetConfigs).values(wc)
    if (tl?.length)   await db.insert(todoLists).values(tl)
    if (td?.length)   await db.insert(todos).values(remap(td))
    if (dt?.length)   await db.insert(dates).values(remap(dt))
    if (nt?.length)   await db.insert(notes).values(remap(nt))
    if (hb?.length)   await db.insert(habits).values(remap(hb))
    if (hl?.length)   await db.insert(habitLogs).values(hl)
    if (lk?.length)   await db.insert(links).values(remap(lk))
    if (pp?.length)   await db.insert(people).values(remap(pp))
  } finally {
    await db.run(sql`PRAGMA foreign_keys = ON`)
  }

  return NextResponse.json({ ok: true })
})
