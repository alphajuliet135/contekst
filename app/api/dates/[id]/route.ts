import { withAuthParams } from '@/lib/api'
import { db } from '@/server/db'
import { dates } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const PATCH = withAuthParams<{ id: string }>(async (userId, req, { id }) => {
  const body = await req.json()

  const [row] = await db
    .update(dates)
    .set(body)
    .where(and(eq(dates.id, id), eq(dates.userId, userId)))
    .returning()

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(row)
})

export const DELETE = withAuthParams<{ id: string }>(async (userId, _req, { id }) => {
  await db.delete(dates).where(and(eq(dates.id, id), eq(dates.userId, userId)))
  return NextResponse.json({ ok: true })
})
