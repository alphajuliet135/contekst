import { signIn } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function LoginPage() {
  const session = await auth()
  if (session) redirect('/')

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(var(--background))' }}>
      <div style={{
        background: 'hsl(var(--card))',
        border: '0.5px solid hsl(var(--border))',
        borderRadius: 16,
        padding: '40px 36px',
        width: 360,
      }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 20, fontWeight: 500, letterSpacing: -0.3 }}>
            conte<span style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 400 }}>k</span>st
          </h1>
          <p style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))', marginTop: 4 }}>
            Sign in to your space
          </p>
        </div>

        <form
          action={async (formData) => {
            'use server'
            await signIn('credentials', {
              email: formData.get('email'),
              password: formData.get('password'),
              redirectTo: '/',
            })
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>Email</label>
            <input
              name="email"
              type="email"
              required
              style={{
                border: '0.5px solid hsl(var(--border))',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 14,
                background: 'hsl(var(--background))',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>Password</label>
            <input
              name="password"
              type="password"
              required
              style={{
                border: '0.5px solid hsl(var(--border))',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 14,
                background: 'hsl(var(--background))',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: 8,
              background: 'hsl(var(--foreground))',
              color: 'hsl(var(--background))',
              border: 'none',
              borderRadius: 8,
              padding: '9px 16px',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  )
}
