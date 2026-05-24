import { withAuth } from '@/lib/api'
import { db } from '@/server/db'
import { todos, contexts } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const GET = withAuth(async (userId, req) => {
  const contextId = req.nextUrl.searchParams.get('contextId')
  const rows = await db.query.todos.findMany({
    where: and(
      eq(todos.userId, userId),
      contextId ? eq(todos.contextId, contextId) : undefined,
    ),
    orderBy: (t, { desc }) => [desc(t.pinned), desc(t.createdAt)],
  })
  return NextResponse.json(rows)
})

export const POST = withAuth(async (userId, req) => {
  const body = await req.json()
  const { contextId, title, priority = 'medium', dueDate, listId } = body
  if (!contextId || !title) {
    return NextResponse.json({ error: 'contextId and title required' }, { status: 400 })
  }
  const ctx = await db.query.contexts.findFirst({
    where: and(eq(contexts.id, contextId), eq(contexts.userId, userId)),
  })
  if (!ctx) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const [row] = await db.insert(todos).values({
    contextId, userId, title, priority, dueDate, listId: listId ?? null,
  }).returning()
  return NextResponse.json(row, { status: 201 })
})
