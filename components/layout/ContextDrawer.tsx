'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { LayoutGrid } from 'lucide-react'
import type { Context } from '@/lib/types'
import { colorTint } from '@/lib/utils'

interface Props {
  contexts: Context[]
  activeContextId: string | null
  isMissionControl: boolean
  isMicro: boolean
  isOpen: boolean
  onClose: () => void
}

export function ContextDrawer({ contexts, activeContextId, isMissionControl, isMicro, isOpen, onClose }: Props) {
  const macros = contexts.filter(c => c.type === 'macro')
  const hasMicros = contexts.some(c => c.type === 'micro')

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          background: 'rgba(0, 0, 0, 0.5)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 250ms ease',
        }}
      />

      {/* Drawer panel */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 201,
          background: 'hsl(var(--card))',
          borderTop: '0.5px solid hsl(var(--border))',
          borderRadius: '16px 16px 0 0',
          maxHeight: '80vh',
          overflowY: 'auto',
          paddingBottom: 'max(24px, var(--safe-bottom, 0px))',
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 280ms cubic-bezier(0.32, 0.72, 0, 1)',
          boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Drag pill */}
        <div style={{
          width: 32,
          height: 4,
          borderRadius: 2,
          background: 'hsl(var(--border))',
          margin: '12px auto 8px',
        }} />

        {/* Mission Control row */}
        <Link
          href="/"
          onClick={onClose}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 20px',
            textDecoration: 'none',
            color: 'hsl(var(--foreground))',
            background: isMissionControl ? 'hsl(var(--muted))' : undefined,
          }}
        >
          <span style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: isMissionControl ? 'hsl(var(--muted-foreground))' : 'hsl(var(--muted))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            color: isMissionControl ? 'hsl(var(--card))' : 'hsl(var(--muted-foreground))',
            flexShrink: 0,
          }}>
            C
          </span>
          <span style={{ fontSize: 15, fontWeight: isMissionControl ? 600 : 400 }}>
            contekst
          </span>
        </Link>

        {/* Macro context rows */}
        {macros.length > 0 && (
          <>
            <div style={{
              padding: '6px 20px 2px',
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              color: 'hsl(var(--muted-foreground))',
            }}>
              Macro
            </div>
            {macros.map(ctx => {
              const isActive = activeContextId === ctx.id
              return (
                <Link
                  key={ctx.id}
                  href={`/ctx/${ctx.id}`}
                  onClick={onClose}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '12px 20px',
                    textDecoration: 'none',
                    color: 'hsl(var(--foreground))',
                    background: isActive ? colorTint(ctx.color, 0.12) : undefined,
                  }}
                >
                  <span style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: ctx.color,
                    flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 15, fontWeight: isActive ? 500 : 400 }}>
                    {ctx.name}
                  </span>
                </Link>
              )
            })}
          </>
        )}

        {/* Micro shortcut */}
        {(hasMicros || macros.length > 0) && (
          <>
            <div style={{
              height: '0.5px',
              background: 'hsl(var(--border))',
              margin: '8px 20px',
            }} />
            <Link
              href="/micro"
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 20px',
                textDecoration: 'none',
                color: isMicro ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                background: isMicro ? 'hsl(var(--muted))' : undefined,
              }}
            >
              <LayoutGrid size={16} strokeWidth={1.75} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 15, fontWeight: isMicro ? 500 : 400 }}>
                Micro
              </span>
            </Link>
          </>
        )}
      </div>
    </>
  )
}
