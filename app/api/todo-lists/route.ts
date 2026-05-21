import { auth } from '@/lib/auth'
import { db } from '@/server/db'
import { todoLists, contexts } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const contextId = req.nextUrl.searchParams.get('contextId')
    if (!contextId) return NextResponse.json({ error: 'contextId required' }, { status: 400 })
    const rows = await db.query.todoLists.findMany({
      where: and(eq(todoLists.contextId, contextId), eq(todoLists.userId, session.user.id)),
      orderBy: (l, { asc }) => [asc(l.order)],
    })
    return NextResponse.json(rows)
  } catch (err) {
    console.error('[GET /api/todo-lists]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const { contextId, name } = body
    if (!contextId || !name?.trim()) {
      return NextResponse.json({ error: 'contextId and name required' }, { status: 400 })
    }
    const ctx = await db.query.contexts.findFirst({
      where: and(eq(contexts.id, contextId), eq(contexts.userId, session.user.id)),
    })
    if (!ctx) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const existing = await db.query.todoLists.findMany({
      where: and(eq(todoLists.contextId, contextId), eq(todoLists.userId, session.user.id)),
    })
    const [row] = await db.insert(todoLists).values({
      contextId,
      userId: session.user.id,
      name: name.trim(),
      order: existing.length,
    }).returning()
    return NextResponse.json(row, { status: 201 })
  } catch (err) {
    console.error('[POST /api/todo-lists]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
