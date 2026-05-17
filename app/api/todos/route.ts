import { auth } from '@/lib/auth'
import { db } from '@/server/db'
import { todos } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const contextId = req.nextUrl.searchParams.get('contextId')
  const rows = await db.query.todos.findMany({
    where: and(
      eq(todos.userId, session.user.id),
      contextId ? eq(todos.contextId, contextId) : undefined,
    ),
    orderBy: (t, { desc }) => [desc(t.pinned), desc(t.createdAt)],
  })

  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { contextId, title, priority = 'medium', dueDate } = body

  if (!contextId || !title) {
    return NextResponse.json({ error: 'contextId and title required' }, { status: 400 })
  }

  const [row] = await db.insert(todos).values({
    contextId,
    userId: session.user.id,
    title,
    priority,
    dueDate,
  }).returning()

  return NextResponse.json(row, { status: 201 })
}
