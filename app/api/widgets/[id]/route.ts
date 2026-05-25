import { withAuthParams } from '@/lib/api'
import { db } from '@/server/db'
import { widgetConfigs, todoLists } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const DELETE = withAuthParams<{ id: string }>(async (_userId, _req, { id }) => {
  const config = await db.query.widgetConfigs.findFirst({
    where: eq(widgetConfigs.id, id),
  })
  if (!config) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const listId = (config.settings as { listId?: string } | null)?.listId
  if (listId) {
    await db.delete(todoLists).where(eq(todoLists.id, listId))
  }

  await db.delete(widgetConfigs).where(eq(widgetConfigs.id, id))

  return NextResponse.json({ ok: true })
})
