import { withAuth } from '@/lib/api'
import { db } from '@/server/db'
import { pushSubscriptions } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const POST = withAuth(async (userId, req) => {
  const body = await req.json()
  const { endpoint, keys } = body as { endpoint: string; keys: { p256dh: string; auth: string } }

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: 'endpoint and keys required' }, { status: 400 })
  }

  const existing = await db.query.pushSubscriptions.findFirst({
    where: eq(pushSubscriptions.endpoint, endpoint),
  })

  if (existing) {
    await db.update(pushSubscriptions)
      .set({ p256dh: keys.p256dh, auth: keys.auth, userId })
      .where(eq(pushSubscriptions.id, existing.id))
  } else {
    await db.insert(pushSubscriptions).values({
      userId,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    })
  }

  return NextResponse.json({ ok: true })
})

export const DELETE = withAuth(async (userId, req) => {
  const body = await req.json()
  const { endpoint } = body as { endpoint: string }

  if (!endpoint) {
    return NextResponse.json({ error: 'endpoint required' }, { status: 400 })
  }

  await db.delete(pushSubscriptions)
    .where(and(
      eq(pushSubscriptions.endpoint, endpoint),
      eq(pushSubscriptions.userId, userId),
    ))

  return NextResponse.json({ ok: true })
})
