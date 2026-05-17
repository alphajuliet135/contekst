'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'

interface Props {
  todoId: string
  color: string
  size?: number
}

export function TodoCheckbox({ todoId, color, size = 15 }: Props) {
  const router = useRouter()
  const [done, setDone] = useState(false)

  async function tick() {
    if (done) return
    setDone(true)
    await fetch(`/api/todos/${todoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: true, completedAt: new Date().toISOString() }),
    })
    router.refresh()
  }

  return (
    <span
      onClick={tick}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: done ? 'none' : '1.5px solid hsl(var(--border))',
        background: done ? color : 'transparent',
        flexShrink: 0,
        cursor: done ? 'default' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 120ms, border 120ms',
      }}
    >
      {done && <Check size={Math.round(size * 0.6)} strokeWidth={3} style={{ color: 'white' }} />}
    </span>
  )
}
