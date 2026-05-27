import { withAuthParams } from '@/lib/api'
import { db } from '@/server/db'
import { todoLists, todos } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const PATCH = withAuthParams<{ id: string }>(async (userId, req, { id }) => {
  const body = await req.json()
  const { name, order } = body as { name?: string; order?: number }
  const updates: Partial<{ name: string; order: number }> = {}
  if (name !== undefined) {
    if (!name.trim()) return NextResponse.json({ error: 'name cannot be empty' }, { status: 400 })
    updates.name = name.trim()
  }
  if (order !== undefined) updates.order = order
  if (Object.keys(updates).length === 0) return NextResponse.json({ error: 'nothing to update' }, { status: 400 })
  const [row] = await db
    .update(todoLists)
    .set(updates)
    .where(and(eq(todoLists.id, id), eq(todoLists.userId, userId)))
    .returning()
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(row)
})

export const DELETE = withAuthParams<{ id: string }>(async (userId, _req, { id }) => {
  await db.update(todos).set({ listId: null }).where(eq(todos.listId, id))
  await db.delete(todoLists).where(and(eq(todoLists.id, id), eq(todoLists.userId, userId)))
  return NextResponse.json({ ok: true })
})
