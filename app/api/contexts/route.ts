import { withAuth } from '@/lib/api'
import { db } from '@/server/db'
import { contexts } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const GET = withAuth(async (userId) => {
  const rows = await db.query.contexts.findMany({
    where: eq(contexts.userId, userId),
    orderBy: (c, { asc }) => [asc(c.order)],
  })
  return NextResponse.json(rows)
})

export const POST = withAuth(async (userId, req) => {
  const body = await req.json()
  const { name, type = 'macro', color = '#378ADD', icon = 'circle' } = body

  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const [row] = await db.insert(contexts).values({
    userId,
    name,
    type,
    color,
    icon,
  }).returning()

  return NextResponse.json(row, { status: 201 })
})
