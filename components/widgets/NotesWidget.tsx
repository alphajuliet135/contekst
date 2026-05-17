import { FileText, Plus } from 'lucide-react'
import type { Note } from '@/lib/types'

export function NotesWidget({ notes, color }: { notes: Note[]; color: string }) {
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
        <FileText size={14} strokeWidth={1.5} style={{ color }} />
        <span style={{ fontSize: 13, fontWeight: 500 }}>Notes</span>
        <button style={{
          marginLeft: 'auto', background: 'none', border: 'none',
          color: 'hsl(var(--muted-foreground))', fontSize: 12, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 3, padding: '2px 4px',
        }}>
          <Plus size={11} strokeWidth={2} />
          Add
        </button>
      </div>

      {notes.length === 0 ? (
        <div style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))' }}>No notes</span>
        </div>
      ) : (
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {notes.map((note, i) => (
            <div
              key={note.id}
              style={{
                fontSize: 14,
                lineHeight: 1.7,
                color: note.content ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                ...(i < notes.length - 1 ? {
                  borderBottom: '0.5px solid hsl(var(--border))',
                  paddingBottom: 14,
                } : {}),
              }}
            >
              {note.content || 'Empty note'}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
