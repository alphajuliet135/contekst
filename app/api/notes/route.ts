import { auth } from '@/lib/auth'
import { db } from '@/server/db'
import { notes } from '@/server/db/schema'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { contextId, content = '', title } = body

  if (!contextId) {
    return NextResponse.json({ error: 'contextId required' }, { status: 400 })
  }

  const [row] = await db.insert(notes).values({
    contextId,
    userId: session.user.id,
    content,
    title: title ?? null,
  }).returning()

  return NextResponse.json(row, { status: 201 })
}
