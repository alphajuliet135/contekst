import { withAuth } from '@/lib/api'
import { db } from '@/server/db'
import { widgetConfigs, todoLists, contexts } from '@/server/db/schema'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const POST = withAuth(async (userId, req) => {
  const body = await req.json()
  const { contextId, listName } = body as { contextId: string; listName: string }

  if (!contextId || !listName?.trim()) {
    return NextResponse.json({ error: 'contextId and listName required' }, { status: 400 })
  }

  const ctx = await db.query.contexts.findFirst({
    where: and(eq(contexts.id, contextId), eq(contexts.userId, userId)),
  })
  if (!ctx) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [newList] = await db.insert(todoLists).values({
    contextId,
    userId,
    name: listName.trim(),
    order: 0,
  }).returning()

  const [newWidget] = await db.insert(widgetConfigs).values({
    contextId,
    widgetType: 'todos',
    enabled: true,
    settings: { listId: newList.id },
    label: listName.trim(),
    order: 99,
  }).returning()

  return NextResponse.json({ widgetId: newWidget.id, listId: newList.id })
})
