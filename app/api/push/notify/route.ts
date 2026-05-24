import { db } from '@/server/db'
import { pushSubscriptions, todos } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT ?? 'mailto:admin@localhost',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '',
  process.env.VAPID_PRIVATE_KEY ?? '',
)

export async function POST(req: NextRequest) {
  const secret = process.env.NOTIFY_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Push notifications not configured' }, { status: 503 })
  }

  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date().toISOString().split('T')[0]

  const allSubs = await db.query.pushSubscriptions.findMany()
  if (allSubs.length === 0) return NextResponse.json({ sent: 0 })

  const userIds = [...new Set(allSubs.map(s => s.userId))]
  let sent = 0
  const expired: string[] = []

  for (const userId of userIds) {
    const dueTodos = await db.query.todos.findMany({
      where: (t, { and, eq, lte }) => and(
        eq(t.userId, userId),
        eq(t.done, false),
        lte(t.dueDate, today),
      ),
    })

    if (dueTodos.length === 0) continue

    const title = dueTodos.length === 1
      ? `Due today: ${dueTodos[0].title}`
      : `${dueTodos.length} items due today`

    const body = dueTodos.length > 1
      ? dueTodos.slice(0, 3).map(t => `· ${t.title}`).join('\n')
      : ''

    const payload = JSON.stringify({ title, body, url: '/' })
    const userSubs = allSubs.filter(s => s.userId === userId)

    for (const sub of userSubs) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload,
        )
        sent++
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode
        if (status === 410 || status === 404) {
          expired.push(sub.id)
        } else {
          console.error('[push/notify] send error:', err)
        }
      }
    }
  }

  for (const id of expired) {
    await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, id))
  }

  return NextResponse.json({ sent, expiredRemoved: expired.length })
}
