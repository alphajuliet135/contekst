'use client'

import { useState } from 'react'
import { MicroContextModal } from '@/components/micro/MicroContextModal'

export interface MicroCardData {
  id: string
  name: string
  color: string
  topTodo: string | null
  meta: string
  pulse: number[]
}

export function MicroPulse({ micros }: { micros: MicroCardData[] }) {
  const [peekId, setPeekId] = useState<string | null>(null)
  const peekCtx = micros.find(m => m.id === peekId)

  return (
    <>
      <div className="mc-micro-grid">
        {micros.map(m => (
          <div key={m.id} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '12px 14px',
            background: 'hsl(var(--card))',
            border: '0.5px solid hsl(var(--border))',
            borderRadius: 12,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</span>
                <button
                  onClick={() => setPeekId(m.id)}
                  style={{
                    fontSize: 10, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                    color: 'hsl(var(--muted-foreground))', marginLeft: 'auto',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  }}
                >
                  μ · peek
                </button>
              </div>
              {m.topTodo ? (
                <div style={{ fontSize: 13, color: 'hsl(var(--foreground))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  → {m.topTodo}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))' }}>all clear</div>
              )}
              <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>{m.meta}</div>
            </div>
            {/* Sparkline */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 26, flexShrink: 0 }}>
              {m.pulse.map((v, i) => (
                <span key={i} style={{
                  width: 4,
                  height: `${Math.max(v * 100, 12)}%`,
                  borderRadius: 1.5,
                  background: m.color,
                  opacity: 0.45 + v * 0.5,
                  display: 'inline-block',
                }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {peekCtx && (
        <MicroContextModal
          contextId={peekCtx.id}
          contextName={peekCtx.name}
          contextColor={peekCtx.color}
          onClose={() => setPeekId(null)}
        />
      )}
    </>
  )
}
