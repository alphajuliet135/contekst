import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/server/db'
import { contexts, users } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import { Topbar } from '@/components/layout/Topbar'

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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Topbar
        contexts={userContexts}
        user={{ name: dbUser?.name ?? null, email: dbUser?.email ?? session.user.email }}
      />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
    </div>
  )
}
