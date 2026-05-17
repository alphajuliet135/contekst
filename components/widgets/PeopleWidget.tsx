import { Users, Plus } from 'lucide-react'
import type { Person } from '@/lib/types'
import { colorTint } from '@/lib/utils'

function initials(name: string) {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
}

export function PeopleWidget({ people, color }: { people: Person[]; color: string }) {
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
        <Users size={14} strokeWidth={1.5} style={{ color }} />
        <span style={{ fontSize: 13, fontWeight: 500 }}>People</span>
        <button style={{
          marginLeft: 'auto', background: 'none', border: 'none',
          color: 'hsl(var(--muted-foreground))', fontSize: 12, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 3, padding: '2px 4px',
        }}>
          <Plus size={11} strokeWidth={2} />
          Add
        </button>
      </div>

      {people.length === 0 ? (
        <div style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))' }}>No people</span>
        </div>
      ) : (
        <div style={{ padding: '6px 0' }}>
          {people.map(person => (
            <div key={person.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 16px',
            }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: colorTint(color, 0.15),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 500,
                color,
                flexShrink: 0,
              }}>
                {initials(person.name)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 13 }}>{person.name}</span>
                {person.note && (
                  <span style={{
                    fontSize: 12,
                    color: 'hsl(var(--muted-foreground))',
                    marginLeft: 8,
                  }}>
                    {person.note}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
