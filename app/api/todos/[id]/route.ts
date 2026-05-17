import { auth } from '@/lib/auth'
import { db } from '@/server/db'
import { todos } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const [row] = await db
    .update(todos)
    .set(body)
    .where(and(eq(todos.id, id), eq(todos.userId, session.user.id)))
    .returning()

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(row)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await db.delete(todos).where(and(eq(todos.id, id), eq(todos.userId, session.user.id)))
  return NextResponse.json({ ok: true })
}
