'use client'

import { useEffect, useState } from 'react'

export default function UpdateBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [reg, setReg] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.register('/sw.js').then(registration => {
      setReg(registration)

      const handleUpdate = () => {
        if (registration.waiting) setShowBanner(true)
      }

      registration.addEventListener('updatefound', () => {
        const installing = registration.installing
        if (!installing) return
        installing.addEventListener('statechange', () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            setShowBanner(true)
          }
        })
      })

      if (registration.waiting) handleUpdate()
    })

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload()
    })
  }, [])

  function handleRefresh() {
    if (reg?.waiting) {
      reg.waiting.postMessage({ type: 'SKIP_WAITING' })
    }
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 'max(24px, env(safe-area-inset-bottom))',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      background: 'hsl(var(--card))',
      border: '0.5px solid hsl(var(--border))',
      borderRadius: 12,
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ fontSize: 13, color: 'hsl(var(--foreground))' }}>
        A new version is available
      </span>
      <button
        onClick={handleRefresh}
        style={{
          fontSize: 12,
          fontWeight: 500,
          padding: '4px 12px',
          borderRadius: 6,
          border: '0.5px solid hsl(var(--border))',
          background: 'hsl(var(--muted))',
          color: 'hsl(var(--foreground))',
          cursor: 'pointer',
        }}
      >
        Refresh
      </button>
      <button
        onClick={() => setShowBanner(false)}
        style={{
          fontSize: 12,
          color: 'hsl(var(--muted-foreground))',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 0',
        }}
      >
        Dismiss
      </button>
    </div>
  )
}
