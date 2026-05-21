import { auth } from '@/lib/auth'
import { db } from '@/server/db'
import { dates } from '@/server/db/schema'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { contextId, title, date, note } = body

  if (!contextId || !title || !date) {
    return NextResponse.json({ error: 'contextId, title, and date required' }, { status: 400 })
  }

  const [row] = await db.insert(dates).values({
    contextId,
    userId: session.user.id,
    title,
    date,
    note: note ?? null,
  }).returning()

  return NextResponse.json(row, { status: 201 })
}
