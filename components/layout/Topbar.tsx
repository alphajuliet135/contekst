'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Plus, Settings, LayoutGrid } from 'lucide-react'
import type { Context } from '@/lib/types'
import { colorTint } from '@/lib/utils'

export function Topbar({ contexts }: { contexts: Context[] }) {
  const pathname = usePathname()

  const macros = contexts.filter(c => c.type === 'macro')
  const hasMicros = contexts.some(c => c.type === 'micro')

  const isMissionControl = pathname === '/'
  const isMicro = pathname === '/micro'
  const activeCtxId = pathname.startsWith('/ctx/') ? pathname.slice(5) : null

  return (
    <header
      style={{
        height: 52,
        background: 'hsl(var(--card))',
        borderBottom: '0.5px solid hsl(var(--border))',
        display: 'flex',
        alignItems: 'center',
        paddingInline: 16,
        gap: 2,
        position: 'sticky',
        top: 0,
        zIndex: 50,
        flexShrink: 0,
      }}
    >
      {/* Logo / Mission Control */}
      <Link
        href="/"
        className="nav-item"
        style={{
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: -0.3,
          color: 'hsl(var(--foreground))',
          textDecoration: 'none',
          padding: '4px 10px',
          borderRadius: 6,
          marginRight: 6,
          background: isMissionControl ? 'hsl(var(--muted))' : undefined,
        }}
      >
        contekst
      </Link>

      {/* Macro context tabs */}
      {macros.map(ctx => {
        const isActive = activeCtxId === ctx.id
        return (
          <Link
            key={ctx.id}
            href={`/ctx/${ctx.id}`}
            className="nav-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
              color: 'hsl(var(--foreground))',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              // Active tabs get a clearly visible colored fill; inactive get no background (hover handled by CSS)
              background: isActive ? colorTint(ctx.color, 0.25) : undefined,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: ctx.color,
                flexShrink: 0,
              }}
            />
            {ctx.name}
          </Link>
        )
      })}

      {/* Separator + Micro shortcut */}
      {(macros.length > 0 || hasMicros) && (
        <>
          <div
            style={{
              width: 1,
              height: 16,
              background: 'hsl(var(--border))',
              marginInline: 6,
              flexShrink: 0,
            }}
          />
          <Link
            href="/micro"
            className="nav-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
              color: isMicro ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
              textDecoration: 'none',
              background: isMicro ? 'hsl(var(--muted))' : undefined,
            }}
          >
            <LayoutGrid size={13} strokeWidth={1.75} />
            Micro
          </Link>
        </>
      )}

      {/* Right: actions */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
        <button
          className="nav-item"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 10px',
            borderRadius: 6,
            border: '0.5px solid hsl(var(--border))',
            fontSize: 13,
            color: 'hsl(var(--muted-foreground))',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <Plus size={13} strokeWidth={1.75} />
          Add context
        </button>
        <button
          className="nav-item"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: 6,
            border: 'none',
            color: 'hsl(var(--muted-foreground))',
            cursor: 'pointer',
          }}
        >
          <Settings size={15} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  )
}
