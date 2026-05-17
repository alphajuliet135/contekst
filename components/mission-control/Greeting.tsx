'use client'

import { useState, useEffect } from 'react'

export function Greeting({ firstName }: { firstName?: string | null }) {
  const [text, setText] = useState('')

  useEffect(() => {
    const h = new Date().getHours()
    const base = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
    setText(firstName ? `${base}, ${firstName}` : base)
  }, [firstName])

  return (
    <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.5, margin: 0, lineHeight: 1.15 }}>
      {/* Space keeps the row height stable during hydration before useEffect fires */}
      {text || ' '}
    </h1>
  )
}
