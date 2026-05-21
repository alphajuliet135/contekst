import { auth } from '@/lib/auth'
import { db } from '@/server/db'
import { todoLists, todos } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { id } = await params
    const body = await req.json()
    const { name } = body as { name?: string }
    if (!name?.trim()) return NextResponse.json({ error: 'name required' }, { status: 400 })
    const [row] = await db
      .update(todoLists)
      .set({ name: name.trim() })
      .where(and(eq(todoLists.id, id), eq(todoLists.userId, session.user.id)))
      .returning()
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(row)
  } catch (err) {
    console.error('[PATCH /api/todo-lists/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { id } = await params
    await db.update(todos).set({ listId: null }).where(eq(todos.listId, id))
    await db.delete(todoLists).where(and(eq(todoLists.id, id), eq(todoLists.userId, session.user.id)))
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[DELETE /api/todo-lists/[id]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
