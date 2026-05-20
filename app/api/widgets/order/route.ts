import { auth } from '@/lib/auth'
import { db } from '@/server/db'
import { widgetConfigs, contexts } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import type { WidgetType } from '@/lib/types'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { contextId, order } = body as { contextId: string; order: WidgetType[] }

  if (!contextId || !Array.isArray(order)) {
    return NextResponse.json({ error: 'contextId and order array required' }, { status: 400 })
  }

  const ctx = await db.query.contexts.findFirst({
    where: and(eq(contexts.id, contextId), eq(contexts.userId, session.user.id)),
  })
  if (!ctx) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  for (let i = 0; i < order.length; i++) {
    const widgetType = order[i]
    const existing = await db.query.widgetConfigs.findFirst({
      where: and(eq(widgetConfigs.contextId, contextId), eq(widgetConfigs.widgetType, widgetType)),
    })
    if (existing) {
      await db.update(widgetConfigs).set({ order: i }).where(eq(widgetConfigs.id, existing.id))
    } else {
      await db.insert(widgetConfigs).values({ contextId, widgetType, enabled: true, order: i })
    }
  }

  return NextResponse.json({ ok: true })
}
