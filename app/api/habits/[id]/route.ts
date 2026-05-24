import { withAuthParams } from '@/lib/api'
import { db } from '@/server/db'
import { habits, habitLogs } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const PATCH = withAuthParams<{ id: string }>(async (userId, req, { id }) => {
  const habit = await db.query.habits.findFirst({
    where: and(eq(habits.id, id), eq(habits.userId, userId)),
  })
  if (!habit) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const { date, completed } = body as { date: string; completed: boolean }

  const existing = await db.query.habitLogs.findFirst({
    where: and(eq(habitLogs.habitId, id), eq(habitLogs.date, date)),
  })

  if (existing) {
    await db.update(habitLogs).set({ completed }).where(eq(habitLogs.id, existing.id))
  } else {
    await db.insert(habitLogs).values({ habitId: id, date, completed })
  }

  return NextResponse.json({ ok: true })
})

export const DELETE = withAuthParams<{ id: string }>(async (userId, _req, { id }) => {
  await db.delete(habits).where(and(eq(habits.id, id), eq(habits.userId, userId)))
  return NextResponse.json({ ok: true })
})
