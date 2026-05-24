import { withAuth } from '@/lib/api'
import { db } from '@/server/db'
import { links } from '@/server/db/schema'
import { NextResponse } from 'next/server'

export const POST = withAuth(async (userId, req) => {
  const body = await req.json()
  const { contextId, title, url } = body

  if (!contextId || !title || !url) {
    return NextResponse.json({ error: 'contextId, title, and url required' }, { status: 400 })
  }

  const [row] = await db.insert(links).values({
    contextId,
    userId,
    title,
    url,
  }).returning()

  return NextResponse.json(row, { status: 201 })
})
