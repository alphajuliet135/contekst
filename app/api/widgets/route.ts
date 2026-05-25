import { withAuth } from '@/lib/api'
import { db } from '@/server/db'
import { widgetConfigs, contexts } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import type { WidgetType } from '@/lib/types'

export const PATCH = withAuth(async (userId, req) => {
  const body = await req.json()
  const { contextId, widgetType, widgetId, enabled, settings } = body as {
    contextId?: string
    widgetType?: WidgetType
    widgetId?: string
    enabled?: boolean
    settings?: Record<string, unknown>
  }

  if (enabled === undefined && settings === undefined) {
    return NextResponse.json({ error: 'Either enabled or settings required' }, { status: 400 })
  }

  let existing = widgetId
    ? await db.query.widgetConfigs.findFirst({ where: eq(widgetConfigs.id, widgetId) })
    : (contextId && widgetType)
      ? await db.query.widgetConfigs.findFirst({
          where: and(eq(widgetConfigs.contextId, contextId), eq(widgetConfigs.widgetType, widgetType)),
        })
      : null

  if (!existing && (!contextId || !widgetType)) {
    return NextResponse.json({ error: 'contextId + widgetType or widgetId required' }, { status: 400 })
  }

  if (existing) {
    const ctx = await db.query.contexts.findFirst({
      where: and(eq(contexts.id, existing.contextId), eq(contexts.userId, userId)),
    })
    if (!ctx) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } else {
    const ctx = await db.query.contexts.findFirst({
      where: and(eq(contexts.id, contextId!), eq(contexts.userId, userId)),
    })
    if (!ctx) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const setFields: Record<string, unknown> = {}
  if (enabled !== undefined) setFields.enabled = enabled
  if (settings !== undefined) {
    const existingSettings = (existing?.settings as Record<string, unknown>) ?? {}
    setFields.settings = { ...existingSettings, ...settings }
  }

  if (existing) {
    await db.update(widgetConfigs).set(setFields).where(eq(widgetConfigs.id, existing.id))
  } else {
    await db.insert(widgetConfigs).values({
      contextId: contextId!,
      widgetType: widgetType!,
      enabled: enabled ?? true,
      settings: settings ?? null,
    })
  }

  return NextResponse.json({ ok: true })
})
