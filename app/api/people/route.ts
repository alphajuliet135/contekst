import { withAuth } from '@/lib/api'
import { db } from '@/server/db'
import { people } from '@/server/db/schema'
import { NextResponse } from 'next/server'

export const POST = withAuth(async (userId, req) => {
  const body = await req.json()
  const { contextId, name, note } = body

  if (!contextId || !name) {
    return NextResponse.json({ error: 'contextId and name required' }, { status: 400 })
  }

  const [row] = await db.insert(people).values({
    contextId,
    userId,
    name,
    note: note ?? null,
  }).returning()

  return NextResponse.json(row, { status: 201 })
})
