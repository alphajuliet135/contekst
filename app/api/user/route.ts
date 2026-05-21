import { auth } from '@/lib/auth'
import { db } from '@/server/db'
import { users } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, currentPassword, newPassword } = body

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Update display name
  if (name !== undefined) {
    await db.update(users)
      .set({ name: name.trim() || null })
      .where(eq(users.id, session.user.id))
    return NextResponse.json({ ok: true })
  }

  // Change password
  if (currentPassword && newPassword) {
    const valid = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 })
    }
    const hash = await bcrypt.hash(newPassword, 12)
    await db.update(users)
      .set({ passwordHash: hash })
      .where(eq(users.id, session.user.id))
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
}
