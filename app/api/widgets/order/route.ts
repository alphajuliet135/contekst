import { withAuth } from '@/lib/api'
import { db } from '@/server/db'
import { widgetConfigs, contexts } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import type { WidgetType } from '@/lib/types'

export const POST = withAuth(async (userId, req) => {
  const body = await req.json()
  const { contextId, order } = body as { contextId: string; order: WidgetType[] }

  if (!contextId || !Array.isArray(order)) {
    return NextResponse.json({ error: 'contextId and order array required' }, { status: 400 })
  }

  const ctx = await db.query.contexts.findFirst({
    where: and(eq(contexts.id, contextId), eq(contexts.userId, userId)),
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
})
