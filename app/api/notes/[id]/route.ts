import { withAuthParams } from '@/lib/api'
import { db } from '@/server/db'
import { notes } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const PATCH = withAuthParams<{ id: string }>(async (userId, req, { id }) => {
  const body = await req.json()

  const [row] = await db
    .update(notes)
    .set(body)
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .returning()

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(row)
})

export const DELETE = withAuthParams<{ id: string }>(async (userId, _req, { id }) => {
  await db.delete(notes).where(and(eq(notes.id, id), eq(notes.userId, userId)))
  return NextResponse.json({ ok: true })
})
