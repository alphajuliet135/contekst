import { auth } from '@/lib/auth'
import { db } from '@/server/db'
import { widgetConfigs, contexts } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import type { WidgetType } from '@/lib/types'

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { contextId, widgetType, enabled, settings } = body as {
    contextId: string
    widgetType: WidgetType
    enabled?: boolean
    settings?: Record<string, unknown>
  }

  if (!contextId || !widgetType || (enabled === undefined && settings === undefined)) {
    return NextResponse.json({ error: 'contextId, widgetType, and either enabled or settings required' }, { status: 400 })
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

  const setFields: Record<string, unknown> = {}
  if (enabled !== undefined) setFields.enabled = enabled
  if (settings !== undefined) {
    // Merge with existing settings to avoid wiping unrelated keys (e.g. MantraWidget's text)
    const existingSettings = (existing?.settings as Record<string, unknown>) ?? {}
    setFields.settings = { ...existingSettings, ...settings }
  }

  if (existing) {
    await db.update(widgetConfigs).set(setFields).where(eq(widgetConfigs.id, existing.id))
  } else {
    await db.insert(widgetConfigs).values({
      contextId,
      widgetType,
      enabled: enabled ?? true,
      settings: settings ?? null,
    })
  }

  return NextResponse.json({ ok: true })
}
