import { withAuthParams } from '@/lib/api'
import { db } from '@/server/db'
import { contexts } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const PATCH = withAuthParams<{ id: string }>(async (userId, req, { id }) => {
  const body = await req.json()
  const { name, type, color, icon, order, description } = body

  const updates: Record<string, unknown> = {}
  if (name !== undefined) updates.name = name
  if (type !== undefined) updates.type = type
  if (color !== undefined) updates.color = color
  if (icon !== undefined) updates.icon = icon
  if (order !== undefined) updates.order = order
  if (description !== undefined) updates.description = description

  const [row] = await db
    .update(contexts)
    .set(updates)
    .where(and(eq(contexts.id, id), eq(contexts.userId, userId)))
    .returning()

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(row)
})

export const DELETE = withAuthParams<{ id: string }>(async (userId, _req, { id }) => {
  await db
    .delete(contexts)
    .where(and(eq(contexts.id, id), eq(contexts.userId, userId)))
  return NextResponse.json({ ok: true })
})
