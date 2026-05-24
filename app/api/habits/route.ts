import { withAuth } from '@/lib/api'
import { db } from '@/server/db'
import { habits } from '@/server/db/schema'
import { NextResponse } from 'next/server'

export const POST = withAuth(async (userId, req) => {
  const body = await req.json()
  const { contextId, title, frequency = 'daily' } = body

  if (!contextId || !title) {
    return NextResponse.json({ error: 'contextId and title required' }, { status: 400 })
  }

  const [row] = await db.insert(habits).values({
    contextId,
    userId,
    title,
    frequency,
  }).returning()

  return NextResponse.json(row, { status: 201 })
})
