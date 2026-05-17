import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/server/db'
import { contexts } from '@/server/db/schema'
import { eq } from 'drizzle-orm'
import { Topbar } from '@/components/layout/Topbar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/login')

  const userContexts = await db.query.contexts.findMany({
    where: eq(contexts.userId, session.user.id),
    orderBy: (c, { asc }) => [asc(c.order)],
  })

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Topbar contexts={userContexts} />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
    </div>
  )
}
