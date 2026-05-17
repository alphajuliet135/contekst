import { auth } from '@/lib/auth'
import { db } from '@/server/db'
import { contexts } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await db.query.contexts.findMany({
    where: eq(contexts.userId, session.user.id),
    orderBy: (c, { asc }) => [asc(c.order)],
  })

  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, type = 'macro', color = '#378ADD', icon = 'circle' } = body

  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const [row] = await db.insert(contexts).values({
    userId: session.user.id,
    name,
    type,
    color,
    icon,
  }).returning()

  return NextResponse.json(row, { status: 201 })
}
