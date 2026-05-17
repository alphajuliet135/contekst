'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

const INPUT_STYLE = {
  border: '0.5px solid hsl(var(--border))',
  borderRadius: 8,
  padding: '8px 12px',
  fontSize: 14,
  background: 'hsl(var(--background))',
  color: 'hsl(var(--foreground))',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box' as const,
}

export default function SignupPage() {
  const [name, setName]           = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    // Client-side validation
    if (!email.trim()) { setError('Email is required'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }

    setLoading(true)

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() || undefined, email, password }),
    })

    if (res.status === 403) {
      setError('Setup is already complete.')
      setLoading(false)
      return
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError((data as { error?: string }).error ?? 'Something went wrong')
      setLoading(false)
      return
    }

    // Auto sign-in after account creation
    await signIn('credentials', { email, password, callbackUrl: '/' })
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'hsl(var(--background))' }}
    >
      <div style={{
        background: 'hsl(var(--card))',
        border: '0.5px solid hsl(var(--border))',
        borderRadius: 16,
        padding: '40px 36px',
        width: 360,
        maxWidth: 'calc(100vw - 32px)',
      }}>
        {/* Logo */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 20, fontWeight: 500, letterSpacing: -0.3, margin: 0 }}>
            conte<span style={{ color: 'hsl(var(--muted-foreground))', fontWeight: 400 }}>k</span>st
          </h1>
          <p style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))', marginTop: 4, marginBottom: 0 }}>
            Create your account to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>
              Name <span style={{ opacity: 0.6 }}>(optional)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              style={INPUT_STYLE}
            />
          </div>

          {/* Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={INPUT_STYLE}
            />
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="At least 8 characters"
              style={INPUT_STYLE}
            />
          </div>

          {/* Confirm password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>Confirm password</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
              style={INPUT_STYLE}
            />
          </div>

          {/* Error */}
          {error && (
            <p style={{ fontSize: 12, color: '#d95f5f', margin: 0 }}>
              {error}{' '}
              {error.includes('already complete') && (
                <Link href="/login" style={{ color: '#d95f5f' }}>Sign in →</Link>
              )}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              background: 'hsl(var(--foreground))',
              color: 'hsl(var(--background))',
              border: 'none',
              borderRadius: 8,
              padding: '9px 16px',
              fontSize: 13,
              fontWeight: 500,
              cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        {/* Sign-in link */}
        <p style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', marginTop: 20, marginBottom: 0, textAlign: 'center' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'hsl(var(--foreground))' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
