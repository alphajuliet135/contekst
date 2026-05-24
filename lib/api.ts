import { NextRequest, NextResponse } from 'next/server'
import { auth } from './auth'

export function withAuth(
  handler: (userId: string, req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    try {
      return await handler(session.user.id, req)
    } catch (err) {
      console.error(err)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
}

export function withAuthParams<P extends Record<string, string>>(
  handler: (userId: string, req: NextRequest, params: P) => Promise<NextResponse>
) {
  return async (req: NextRequest, ctx: { params: Promise<P> }): Promise<NextResponse> => {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    try {
      const params = await ctx.params
      return await handler(session.user.id, req, params)
    } catch (err) {
      console.error(err)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
}
