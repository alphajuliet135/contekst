import { auth } from '@/lib/auth'
import { db } from '@/server/db'
import { links } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

interface Params { params: Promise<{ id: string }> }

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await db.delete(links).where(and(eq(links.id, id), eq(links.userId, session.user.id)))
  return NextResponse.json({ ok: true })
}
