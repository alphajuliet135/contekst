import { auth, signOut } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/server/db'
import { contexts, users } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import { Topbar } from '@/components/layout/Topbar'
import UpdateBanner from '@/components/layout/UpdateBanner'
import { SwipeBack } from '@/components/layout/SwipeBack'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const [userContexts, dbUser] = await Promise.all([
    db.query.contexts.findMany({
      where: eq(contexts.userId, session.user.id),
      orderBy: (c, { asc }) => [asc(c.order)],
    }),
    db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: { name: true, email: true },
    }),
  ])

  // JWT token references a user that no longer exists in the DB (e.g. after data loss) —
  // clear the stale session so the user lands on login/signup cleanly.
  if (!dbUser) {
    await signOut({ redirectTo: '/login' })
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Topbar
        contexts={userContexts}
        user={{ name: dbUser?.name ?? null, email: dbUser?.email ?? session.user.email }}
      />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
      <UpdateBanner />
      <SwipeBack />
    </div>
  )
}
