import { auth } from '@/lib/auth'
import { db } from '@/server/db'
import { widgetConfigs, contexts } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import type { WidgetType } from '@/lib/types'

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { contextId, widgetType, enabled } = body as {
    contextId: string
    widgetType: WidgetType
    enabled: boolean
  }

  if (!contextId || !widgetType || enabled === undefined) {
    return NextResponse.json({ error: 'contextId, widgetType, and enabled required' }, { status: 400 })
  }

  const ctx = await db.query.contexts.findFirst({
    where: and(eq(contexts.id, contextId), eq(contexts.userId, session.user.id)),
  })
  if (!ctx) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const existing = await db.query.widgetConfigs.findFirst({
    where: and(
      eq(widgetConfigs.contextId, contextId),
      eq(widgetConfigs.widgetType, widgetType),
    ),
  })

  if (existing) {
    await db.update(widgetConfigs).set({ enabled }).where(eq(widgetConfigs.id, existing.id))
  } else {
    await db.insert(widgetConfigs).values({ contextId, widgetType, enabled })
  }

  return NextResponse.json({ ok: true })
}
