import { withAuthParams } from '@/lib/api'
import { db } from '@/server/db'
import { links } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const DELETE = withAuthParams<{ id: string }>(async (userId, _req, { id }) => {
  await db.delete(links).where(and(eq(links.id, id), eq(links.userId, userId)))
  return NextResponse.json({ ok: true })
})
