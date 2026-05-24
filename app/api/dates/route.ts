import { withAuth } from '@/lib/api'
import { db } from '@/server/db'
import { dates } from '@/server/db/schema'
import { NextResponse } from 'next/server'

export const POST = withAuth(async (userId, req) => {
  const body = await req.json()
  const { contextId, title, date, note } = body

  if (!contextId || !title || !date) {
    return NextResponse.json({ error: 'contextId, title, and date required' }, { status: 400 })
  }

  const [row] = await db.insert(dates).values({
    contextId,
    userId,
    title,
    date,
    note: note ?? null,
  }).returning()

  return NextResponse.json(row, { status: 201 })
})
