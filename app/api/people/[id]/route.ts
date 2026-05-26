import { withAuthParams } from '@/lib/api'
import { db } from '@/server/db'
import { people } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const DELETE = withAuthParams<{ id: string }>(async (userId, _req, { id }) => {
  await db.delete(people).where(and(eq(people.id, id), eq(people.userId, userId)))
  return NextResponse.json({ ok: true })
})
