import { db } from '@/server/db'
import { users } from '@/server/db/schema'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  // Guard: only allow signup if no users exist yet
  const existing = await db.query.users.findFirst()
  if (existing) {
    return NextResponse.json({ error: 'Setup is already complete' }, { status: 403 })
  }

  const body = await req.json()
  const { name, email, password } = body

  if (!email?.trim()) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  if (!password || password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await db.insert(users).values({
    email: email.trim().toLowerCase(),
    passwordHash,
    name: name?.trim() || null,
  })

  return NextResponse.json({ ok: true }, { status: 201 })
}
