'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { X, LogOut, Sun, Moon, Monitor } from 'lucide-react'

// ── Theme helpers ──────────────────────────────────────────────────────────

type Theme = 'light' | 'dark' | 'system'

function readThemeCookie(): Theme {
  if (typeof window === 'undefined') return 'dark'
  const m = document.cookie.match(/(?:^|;\s*)theme=([^;]*)/)
  const v = m?.[1]
  return v === 'light' || v === 'dark' || v === 'system' ? v : 'dark'
}

function applyTheme(value: Theme) {
  const html = document.documentElement
  if (value === 'system') {
    html.removeAttribute('data-theme')
  } else {
    html.setAttribute('data-theme', value)
  }
  const maxAge = 365 * 24 * 60 * 60
  document.cookie = `theme=${value}; path=/; max-age=${maxAge}; SameSite=Lax`
}

const THEMES: { value: Theme; label: string; Icon: React.ElementType }[] = [
  { value: 'light',  label: 'Light',  Icon: Sun     },
  { value: 'dark',   label: 'Dark',   Icon: Moon    },
  { value: 'system', label: 'System', Icon: Monitor },
]

interface Props {
  user: { name: string | null; email: string }
  onClose: () => void
}

function Field({
  label, value, onChange, type = 'text', readOnly = false, placeholder,
}: {
  label: string
  value: string
  onChange?: (v: string) => void
  type?: string
  readOnly?: boolean
  placeholder?: string
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontSize: 12, color: 'hsl(var(--muted-foreground))', marginBottom: 5 }}>
        {label}
      </label>
      {readOnly ? (
        <div style={{
          padding: '8px 10px', borderRadius: 7,
          background: 'hsl(var(--muted))',
          border: '0.5px solid hsl(var(--border))',
          fontSize: 13, color: 'hsl(var(--muted-foreground))',
        }}>
          {value}
        </div>
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%', boxSizing: 'border-box',
            background: 'hsl(var(--background))',
            border: '0.5px solid hsl(var(--border))',
            borderRadius: 7, padding: '8px 10px',
            fontSize: 13, color: 'hsl(var(--foreground))',
            outline: 'none',
          }}
        />
      )}
    </div>
  )
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p style={{
      fontSize: 11, fontWeight: 500,
      color: 'hsl(var(--muted-foreground))',
      letterSpacing: 0.6, textTransform: 'uppercase',
      margin: '0 0 14px',
    }}>
      {children}
    </p>
  )
}

function SaveButton({ onClick, loading, disabled, children }: {
  onClick: () => void
  loading: boolean
  disabled: boolean
  children: string
}) {
  const active = !disabled && !loading
  return (
    <button
      onClick={onClick}
      disabled={!active}
      style={{
        padding: '7px 14px', borderRadius: 7, border: 'none',
        background: active ? 'hsl(var(--foreground))' : 'hsl(var(--muted))',
        color: active ? 'hsl(var(--background))' : 'hsl(var(--muted-foreground))',
        fontSize: 12, fontWeight: 500,
        cursor: active ? 'pointer' : 'not-allowed',
        opacity: loading ? 0.6 : 1,
      }}
    >
      {loading ? 'Saving…' : children}
    </button>
  )
}

export function SettingsPanel({ user, onClose }: Props) {
  const router = useRouter()

  // Appearance
  const [theme, setTheme] = useState<Theme>('dark')
  useEffect(() => { setTheme(readThemeCookie()) }, [])

  function handleTheme(value: Theme) {
    setTheme(value)
    applyTheme(value)
  }

  // Profile
  const [name, setName]       = useState(user.name ?? '')
  const [nameLoading, setNameLoading] = useState(false)
  const [nameMsg, setNameMsg] = useState<{ text: string; ok: boolean } | null>(null)

  // Password
  const [currentPw, setCurrentPw]   = useState('')
  const [newPw, setNewPw]           = useState('')
  const [confirmPw, setConfirmPw]   = useState('')
  const [pwLoading, setPwLoading]   = useState(false)
  const [pwMsg, setPwMsg]           = useState<{ text: string; ok: boolean } | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function saveName() {
    setNameLoading(true)
    setNameMsg(null)
    const res = await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    setNameLoading(false)
    setNameMsg(res.ok
      ? { text: 'Saved', ok: true }
      : { text: 'Failed to save', ok: false }
    )
    if (res.ok) router.refresh()
  }

  async function changePassword() {
    setPwMsg(null)
    if (newPw !== confirmPw) {
      setPwMsg({ text: 'Passwords do not match', ok: false })
      return
    }
    if (newPw.length < 8) {
      setPwMsg({ text: 'New password must be at least 8 characters', ok: false })
      return
    }
    setPwLoading(true)
    const res = await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
    })
    setPwLoading(false)
    if (res.ok) {
      setPwMsg({ text: 'Password updated', ok: true })
      setCurrentPw('')
      setNewPw('')
      setConfirmPw('')
    } else {
      const data = await res.json().catch(() => ({}))
      setPwMsg({ text: (data as { error?: string }).error ?? 'Error updating password', ok: false })
    }
  }

  const pwFilled = currentPw.length > 0 && newPw.length > 0 && confirmPw.length > 0

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          zIndex: 100,
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed',
        top: 52, right: 0, bottom: 0,
        width: 320,
        zIndex: 101,
        background: 'hsl(var(--card))',
        borderLeft: '0.5px solid hsl(var(--border))',
        display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.4)',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 20px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '0.5px solid hsl(var(--border))',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.2 }}>Settings</span>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none',
              color: 'hsl(var(--muted-foreground))',
              cursor: 'pointer', padding: 4, borderRadius: 5,
              display: 'flex', alignItems: 'center',
            }}
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {/* Appearance */}
          <section style={{ marginBottom: 28 }}>
            <SectionLabel>Appearance</SectionLabel>
            <div style={{
              display: 'flex',
              background: 'hsl(var(--muted))',
              borderRadius: 8, padding: 3,
            }}>
              {THEMES.map(({ value, label, Icon }) => {
                const active = theme === value
                return (
                  <button
                    key={value}
                    onClick={() => handleTheme(value)}
                    style={{
                      flex: 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: 5,
                      padding: '7px 0',
                      borderRadius: 6, border: 'none',
                      background: active ? 'hsl(var(--card))' : 'transparent',
                      color: active ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                      fontSize: 12, fontWeight: active ? 500 : 400,
                      cursor: 'pointer',
                      boxShadow: active ? '0 1px 3px rgba(0,0,0,0.25)' : 'none',
                    }}
                  >
                    <Icon size={12} strokeWidth={active ? 2 : 1.5} />
                    {label}
                  </button>
                )
              })}
            </div>
          </section>

          <div style={{ borderTop: '0.5px solid hsl(var(--border))', marginBottom: 28 }} />

          {/* Profile */}
          <section style={{ marginBottom: 28 }}>
            <SectionLabel>Profile</SectionLabel>
            <Field
              label="Display name"
              value={name}
              onChange={v => { setName(v); setNameMsg(null) }}
              placeholder="Your name"
            />
            <Field label="Email" value={user.email} readOnly />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
              <SaveButton onClick={saveName} loading={nameLoading} disabled={false}>
                Save name
              </SaveButton>
              {nameMsg && (
                <span style={{ fontSize: 12, color: nameMsg.ok ? '#3DA05E' : '#d95f5f' }}>
                  {nameMsg.text}
                </span>
              )}
            </div>
          </section>

          <div style={{ borderTop: '0.5px solid hsl(var(--border))', marginBottom: 28 }} />

          {/* Security */}
          <section style={{ marginBottom: 28 }}>
            <SectionLabel>Security</SectionLabel>
            <Field
              label="Current password"
              value={currentPw}
              onChange={v => { setCurrentPw(v); setPwMsg(null) }}
              type="password"
            />
            <Field
              label="New password"
              value={newPw}
              onChange={v => { setNewPw(v); setPwMsg(null) }}
              type="password"
            />
            <Field
              label="Confirm new password"
              value={confirmPw}
              onChange={v => { setConfirmPw(v); setPwMsg(null) }}
              type="password"
            />
            {pwMsg && (
              <p style={{ fontSize: 12, color: pwMsg.ok ? '#3DA05E' : '#d95f5f', margin: '8px 0' }}>
                {pwMsg.text}
              </p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
              <SaveButton onClick={changePassword} loading={pwLoading} disabled={!pwFilled}>
                Update password
              </SaveButton>
            </div>
          </section>

          <div style={{ borderTop: '0.5px solid hsl(var(--border))', marginBottom: 28 }} />

          {/* Session */}
          <section>
            <SectionLabel>Session</SectionLabel>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 14px', borderRadius: 7,
                border: '0.5px solid rgba(217, 95, 95, 0.3)',
                background: 'rgba(217, 95, 95, 0.1)',
                color: '#d95f5f',
                fontSize: 13, fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <LogOut size={14} strokeWidth={1.75} />
              Sign out
            </button>
          </section>
        </div>
      </div>
    </>
  )
}
