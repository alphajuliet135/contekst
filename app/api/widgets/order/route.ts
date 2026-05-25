import { withAuth } from '@/lib/api'
import { db } from '@/server/db'
import { widgetConfigs, contexts } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const POST = withAuth(async (userId, req) => {
  const body = await req.json()
  const { contextId, order } = body as { contextId: string; order: string[] }

  if (!contextId || !Array.isArray(order)) {
    return NextResponse.json({ error: 'contextId and order array required' }, { status: 400 })
  }

  const ctx = await db.query.contexts.findFirst({
    where: and(eq(contexts.id, contextId), eq(contexts.userId, userId)),
  })
  if (!ctx) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  for (let i = 0; i < order.length; i++) {
    await db.update(widgetConfigs)
      .set({ order: i })
      .where(and(eq(widgetConfigs.id, order[i]), eq(widgetConfigs.contextId, contextId)))
  }

  return NextResponse.json({ ok: true })
})
