import { auth } from '@/lib/auth'
import { db } from '@/server/db'
import { links } from '@/server/db/schema'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { contextId, title, url } = body

  if (!contextId || !title || !url) {
    return NextResponse.json({ error: 'contextId, title, and url required' }, { status: 400 })
  }

  const [row] = await db.insert(links).values({
    contextId,
    userId: session.user.id,
    title,
    url,
  }).returning()

  return NextResponse.json(row, { status: 201 })
}
