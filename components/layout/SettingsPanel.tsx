'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { X, LogOut, Sun, Moon, Monitor, Bell, BellOff } from 'lucide-react'
import { version } from '../../package.json'

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr
}

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

  // Backup / restore
  const [backupLoading, setBackupLoading]   = useState(false)
  const [lastBackup, setLastBackup]         = useState<string | null>(null)
  const [restoreFile, setRestoreFile]       = useState<File | null>(null)
  const [restoreConfirm, setRestoreConfirm] = useState(false)
  const [restoreLoading, setRestoreLoading] = useState(false)
  const [restoreMsg, setRestoreMsg]         = useState<{ text: string; ok: boolean } | null>(null)

  useEffect(() => {
    setLastBackup(localStorage.getItem('contekst_last_backup'))
  }, [])

  async function downloadBackup() {
    setBackupLoading(true)
    const res = await fetch('/api/backup')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contekst-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    const now = new Date().toISOString()
    localStorage.setItem('contekst_last_backup', now)
    setLastBackup(now)
    setBackupLoading(false)
  }

  async function runRestore() {
    if (!restoreFile) return
    setRestoreLoading(true)
    setRestoreMsg(null)
    const text = await restoreFile.text()
    let parsed
    try { parsed = JSON.parse(text) }
    catch { setRestoreMsg({ text: 'Invalid JSON file', ok: false }); setRestoreLoading(false); return }
    const res = await fetch('/api/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed),
    })
    setRestoreLoading(false)
    if (res.ok) {
      setRestoreMsg({ text: 'Restored — reloading…', ok: true })
      setRestoreConfirm(false)
      setRestoreFile(null)
      setTimeout(() => window.location.reload(), 1200)
    } else {
      const data = await res.json().catch(() => ({}))
      setRestoreMsg({ text: (data as { error?: string }).error ?? 'Restore failed', ok: false })
    }
  }

  // Notifications
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | null>(null)
  const [notifLoading, setNotifLoading] = useState(false)
  const [notifMsg, setNotifMsg] = useState<{ text: string; ok: boolean } | null>(null)

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setNotifPermission(Notification.permission)
    }
  }, [])

  async function enableNotifications() {
    setNotifLoading(true)
    setNotifMsg(null)
    try {
      const permission = await Notification.requestPermission()
      setNotifPermission(permission)
      if (permission !== 'granted') {
        setNotifMsg({ text: 'Permission denied', ok: false })
        setNotifLoading(false)
        return
      }
      const reg = await navigator.serviceWorker.ready
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) {
        setNotifMsg({ text: 'Push not configured on this server', ok: false })
        setNotifLoading(false)
        return
      }
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })
      const json = sub.toJSON()
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
      })
      setNotifMsg({ text: 'Notifications enabled', ok: true })
    } catch (err) {
      console.error('[notifications] subscribe error:', err)
      setNotifMsg({ text: 'Failed to enable notifications', ok: false })
    }
    setNotifLoading(false)
  }

  async function disableNotifications() {
    setNotifLoading(true)
    setNotifMsg(null)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
        await sub.unsubscribe()
      }
      setNotifMsg({ text: 'Notifications disabled', ok: true })
    } catch (err) {
      console.error('[notifications] unsubscribe error:', err)
      setNotifMsg({ text: 'Failed to disable notifications', ok: false })
    }
    setNotifLoading(false)
  }

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
            {/* Segmented control with animated sliding pill */}
            <div style={{ position: 'relative', display: 'flex', background: 'hsl(var(--muted))', borderRadius: 8, padding: 3 }}>
              {/* Sliding indicator */}
              <div style={{
                position: 'absolute', top: 3, bottom: 3, left: 3,
                width: 'calc((100% - 6px) / 3)',
                borderRadius: 6,
                background: 'hsl(var(--card))',
                boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                transform: `translateX(calc(${THEMES.findIndex(t => t.value === theme)} * 100%))`,
                transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                pointerEvents: 'none',
              }} />
              {THEMES.map(({ value, label, Icon }) => {
                const active = theme === value
                return (
                  <button
                    key={value}
                    onClick={() => handleTheme(value)}
                    style={{
                      flex: 1, position: 'relative', zIndex: 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: 5,
                      padding: '7px 0',
                      borderRadius: 6, border: 'none',
                      background: 'transparent',
                      color: active ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                      fontSize: 12, fontWeight: active ? 500 : 400,
                      cursor: 'pointer',
                      transition: 'color 150ms ease',
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

          {/* Data — backup & restore */}
          <section style={{ marginBottom: 28 }}>
            <SectionLabel>Data</SectionLabel>
            <p style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', margin: '0 0 10px' }}>
              Download a full backup of your contexts, tasks, notes, and all other data.
            </p>
            <button
              onClick={downloadBackup}
              disabled={backupLoading}
              style={{
                padding: '7px 14px', borderRadius: 7,
                border: '0.5px solid hsl(var(--border))',
                background: 'transparent', color: 'hsl(var(--foreground))',
                fontSize: 12, fontWeight: 500,
                cursor: backupLoading ? 'default' : 'pointer',
                opacity: backupLoading ? 0.6 : 1, marginBottom: 20,
              }}
            >
              {backupLoading ? 'Preparing…' : 'Export backup'}
            </button>
            <p style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', margin: '-14px 0 20px', opacity: 0.7 }}>
              {lastBackup
                ? `Last backup: ${new Date(lastBackup).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}, ${new Date(lastBackup).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
                : 'Never backed up on this device'}
            </p>

            <p style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', margin: '0 0 8px' }}>
              Restore from a backup file.{' '}
              <strong style={{ color: '#d95f5f' }}>This replaces all current data.</strong>
            </p>
            <label style={{
              display: 'inline-block', padding: '7px 14px', borderRadius: 7,
              border: '0.5px solid hsl(var(--border))', background: 'transparent',
              color: 'hsl(var(--muted-foreground))', fontSize: 12, cursor: 'pointer', marginBottom: 8,
            }}>
              {restoreFile ? restoreFile.name : 'Choose backup file…'}
              <input
                type="file" accept=".json" style={{ display: 'none' }}
                onChange={e => {
                  setRestoreFile(e.target.files?.[0] ?? null)
                  setRestoreConfirm(false)
                  setRestoreMsg(null)
                }}
              />
            </label>

            {restoreFile && !restoreConfirm && (
              <div style={{ marginTop: 8 }}>
                <button
                  onClick={() => setRestoreConfirm(true)}
                  style={{
                    padding: '6px 12px', borderRadius: 7, border: 'none',
                    background: 'rgba(217, 95, 95, 0.15)', color: '#d95f5f',
                    fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  }}
                >
                  Restore — replace all data
                </button>
              </div>
            )}

            {restoreConfirm && (
              <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  onClick={runRestore}
                  disabled={restoreLoading}
                  style={{
                    padding: '6px 12px', borderRadius: 7, border: 'none',
                    background: '#d95f5f', color: 'white',
                    fontSize: 12, fontWeight: 500,
                    cursor: restoreLoading ? 'default' : 'pointer',
                    opacity: restoreLoading ? 0.6 : 1,
                  }}
                >
                  {restoreLoading ? 'Restoring…' : 'Yes, replace all data'}
                </button>
                <button
                  onClick={() => { setRestoreConfirm(false); setRestoreFile(null) }}
                  style={{ background: 'none', border: 'none', fontSize: 12, color: 'hsl(var(--muted-foreground))', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            )}

            {restoreMsg && (
              <p style={{ fontSize: 12, color: restoreMsg.ok ? '#3DA05E' : '#d95f5f', marginTop: 8, marginBottom: 0 }}>
                {restoreMsg.text}
              </p>
            )}
          </section>

          <div style={{ borderTop: '0.5px solid hsl(var(--border))', marginBottom: 28 }} />

          {/* Notifications */}
          {notifPermission !== null && (
            <>
              <section style={{ marginBottom: 28 }}>
                <SectionLabel>Notifications</SectionLabel>
                <p style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', margin: '0 0 12px' }}>
                  Receive a daily reminder for todos due today.
                </p>
                {notifPermission === 'granted' ? (
                  <button
                    onClick={disableNotifications}
                    disabled={notifLoading}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '7px 14px', borderRadius: 7,
                      border: '0.5px solid hsl(var(--border))',
                      background: 'transparent', color: 'hsl(var(--muted-foreground))',
                      fontSize: 12, fontWeight: 500,
                      cursor: notifLoading ? 'default' : 'pointer',
                      opacity: notifLoading ? 0.6 : 1,
                    }}
                  >
                    <BellOff size={13} strokeWidth={1.75} />
                    {notifLoading ? 'Disabling…' : 'Disable notifications'}
                  </button>
                ) : (
                  <button
                    onClick={enableNotifications}
                    disabled={notifLoading || notifPermission === 'denied'}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '7px 14px', borderRadius: 7,
                      border: 'none',
                      background: 'hsl(var(--foreground))',
                      color: 'hsl(var(--background))',
                      fontSize: 12, fontWeight: 500,
                      cursor: (notifLoading || notifPermission === 'denied') ? 'default' : 'pointer',
                      opacity: (notifLoading || notifPermission === 'denied') ? 0.5 : 1,
                    }}
                  >
                    <Bell size={13} strokeWidth={1.75} />
                    {notifLoading ? 'Enabling…' : notifPermission === 'denied' ? 'Blocked by browser' : 'Enable notifications'}
                  </button>
                )}
                {notifMsg && (
                  <p style={{ fontSize: 12, color: notifMsg.ok ? '#3DA05E' : '#d95f5f', margin: '8px 0 0' }}>
                    {notifMsg.text}
                  </p>
                )}
              </section>

              <div style={{ borderTop: '0.5px solid hsl(var(--border))', marginBottom: 28 }} />
            </>
          )}

          {/* Session */}
          <section style={{ marginBottom: 28 }}>
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

          <div style={{ borderTop: '0.5px solid hsl(var(--border))', marginBottom: 28 }} />

          {/* About */}
          <section>
            <SectionLabel>About</SectionLabel>
            <span style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>
              Contekst v{version}
            </span>
          </section>
        </div>
      </div>
    </>
  )
}
