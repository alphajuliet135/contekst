import { withAuth } from '@/lib/api'
import { db } from '@/server/db'
import { todoLists, contexts } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const GET = withAuth(async (userId, req) => {
  const contextId = req.nextUrl.searchParams.get('contextId')
  if (!contextId) return NextResponse.json({ error: 'contextId required' }, { status: 400 })
  const rows = await db.query.todoLists.findMany({
    where: and(eq(todoLists.contextId, contextId), eq(todoLists.userId, userId)),
    orderBy: (l, { asc }) => [asc(l.order)],
  })
  return NextResponse.json(rows)
})

export const POST = withAuth(async (userId, req) => {
  const body = await req.json()
  const { contextId, name } = body
  if (!contextId || !name?.trim()) {
    return NextResponse.json({ error: 'contextId and name required' }, { status: 400 })
  }
  const ctx = await db.query.contexts.findFirst({
    where: and(eq(contexts.id, contextId), eq(contexts.userId, userId)),
  })
  if (!ctx) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const existing = await db.query.todoLists.findMany({
    where: and(eq(todoLists.contextId, contextId), eq(todoLists.userId, userId)),
  })
  const [row] = await db.insert(todoLists).values({
    contextId,
    userId,
    name: name.trim(),
    order: existing.length,
  }).returning()
  return NextResponse.json(row, { status: 201 })
})
