import { auth } from '@/lib/auth'
import { db } from '@/server/db'
import { habits } from '@/server/db/schema'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { contextId, title, frequency = 'daily' } = body

  if (!contextId || !title) {
    return NextResponse.json({ error: 'contextId and title required' }, { status: 400 })
  }

  const [row] = await db.insert(habits).values({
    contextId,
    userId: session.user.id,
    title,
    frequency,
  }).returning()

  return NextResponse.json(row, { status: 201 })
}
