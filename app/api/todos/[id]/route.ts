import { withAuthParams } from '@/lib/api'
import { db } from '@/server/db'
import { todos } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const PATCH = withAuthParams<{ id: string }>(async (userId, req, { id }) => {
  const body = await req.json()

  const [row] = await db
    .update(todos)
    .set(body)
    .where(and(eq(todos.id, id), eq(todos.userId, userId)))
    .returning()

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(row)
})

export const DELETE = withAuthParams<{ id: string }>(async (userId, _req, { id }) => {
  await db.delete(todos).where(and(eq(todos.id, id), eq(todos.userId, userId)))
  return NextResponse.json({ ok: true })
})
