import Link from 'next/link'
import { CheckSquare, Calendar } from 'lucide-react'
import { colorTint, colorBorder } from '@/lib/utils'

export interface PinnedItemShape {
  id: string
  type: 'todo' | 'date'
  title: string
  contextId: string
  contextName: string
  contextColor: string
}

export function PinnedStrip({ items }: { items: PinnedItemShape[] }) {
  return (
    <div className="mc-pinned-strip">
      {items.map(item => (
        <Link key={item.id} href={`/ctx/${item.contextId}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '11px 14px',
            background: 'hsl(var(--card))',
            border: '0.5px solid hsl(var(--border))',
            borderRadius: 10,
            height: '100%',
            boxSizing: 'border-box',
          }}>
            {/* Glyph tile */}
            <div style={{
              width: 26, height: 26, borderRadius: 6, flexShrink: 0,
              background: colorTint(item.contextColor, 0.12),
              border: `0.5px solid ${colorBorder(item.contextColor, 0.25)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: item.contextColor,
            }}>
              {item.type === 'todo'
                ? <CheckSquare size={13} strokeWidth={1.75} />
                : <Calendar size={13} strokeWidth={1.75} />
              }
            </div>
            {/* Title + subtitle */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.title}
              </div>
              <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))' }}>
                {item.type === 'todo' ? 'Todo' : 'Date'} · {item.contextName}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
