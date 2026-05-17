import { Link2, ExternalLink, Plus } from 'lucide-react'
import type { Link } from '@/lib/types'

export function LinksWidget({ links, color }: { links: Link[]; color: string }) {
  return (
    <div className="card-shadow" style={{
      background: 'hsl(var(--card))',
      border: '0.5px solid hsl(var(--border))',
      borderRadius: 12,
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 16px',
        borderBottom: '0.5px solid hsl(var(--border))',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <Link2 size={14} strokeWidth={1.5} style={{ color }} />
        <span style={{ fontSize: 13, fontWeight: 500 }}>Links</span>
        <button style={{
          marginLeft: 'auto', background: 'none', border: 'none',
          color: 'hsl(var(--muted-foreground))', fontSize: 12, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 3, padding: '2px 4px',
        }}>
          <Plus size={11} strokeWidth={2} />
          Add
        </button>
      </div>

      {links.length === 0 ? (
        <div style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))' }}>No links</span>
        </div>
      ) : (
        <div style={{ padding: '6px 0' }}>
          {links.map(link => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '7px 16px',
                textDecoration: 'none',
                color: 'hsl(var(--foreground))',
              }}
            >
              <ExternalLink size={12} strokeWidth={1.5} style={{ color, flexShrink: 0 }} />
              <span style={{
                fontSize: 13,
                flex: 1,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {link.title}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
