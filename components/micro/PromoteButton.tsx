'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function PromoteButton({ contextId }: { contextId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function promote() {
    setLoading(true)
    await fetch(`/api/contexts/${contextId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'macro' }),
    })
    router.push(`/ctx/${contextId}`)
    router.refresh()
  }

  return (
    <button
      onClick={promote}
      disabled={loading}
      style={{
        padding: '3px 8px',
        borderRadius: 5,
        border: '0.5px solid hsl(var(--border))',
        background: 'transparent',
        fontSize: 11,
        color: 'hsl(var(--muted-foreground))',
        cursor: loading ? 'default' : 'pointer',
        whiteSpace: 'nowrap',
        opacity: loading ? 0.5 : 1,
      }}
    >
      Promote
    </button>
  )
}
