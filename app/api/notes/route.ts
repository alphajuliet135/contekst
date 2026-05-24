import { withAuth } from '@/lib/api'
import { db } from '@/server/db'
import { notes } from '@/server/db/schema'
import { NextResponse } from 'next/server'

export const POST = withAuth(async (userId, req) => {
  const body = await req.json()
  const { contextId, content = '', title } = body

  if (!contextId) {
    return NextResponse.json({ error: 'contextId required' }, { status: 400 })
  }

  const [row] = await db.insert(notes).values({
    contextId,
    userId,
    content,
    title: title ?? null,
  }).returning()

  return NextResponse.json(row, { status: 201 })
})
