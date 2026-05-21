import { auth } from '@/lib/auth'
import { db } from '@/server/db'
import { habits, habitLogs } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  // Verify ownership
  const habit = await db.query.habits.findFirst({
    where: and(eq(habits.id, id), eq(habits.userId, session.user.id)),
  })
  if (!habit) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const { date, completed } = body as { date: string; completed: boolean }

  // Upsert the habit log for this habit + date
  const existing = await db.query.habitLogs.findFirst({
    where: and(eq(habitLogs.habitId, id), eq(habitLogs.date, date)),
  })

  if (existing) {
    await db.update(habitLogs).set({ completed }).where(eq(habitLogs.id, existing.id))
  } else {
    await db.insert(habitLogs).values({ habitId: id, date, completed })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await db.delete(habits).where(and(eq(habits.id, id), eq(habits.userId, session.user.id)))
  return NextResponse.json({ ok: true })
}
