'use client'

import { useState } from 'react'
import { formatDate } from '@/lib/utils'

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"

interface Props {
  activity28d: number[]
  color: string
}

function getLabel(i: number): string {
  const today = new Date()
  const d = new Date(Date.now() - (27 - i) * 86400000)
  const todayStr = today.toISOString().split('T')[0]
  const dStr = d.toISOString().split('T')[0]
  if (dStr === todayStr) return 'Today'
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  if (dStr === yesterdayStr) return 'Yesterday'
  return formatDate(dStr)
}

export function MacroActivityHeatmap({ activity28d, color }: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 500, color: 'hsl(var(--muted-foreground))', letterSpacing: 0.8, textTransform: 'uppercase' }}>Activity</span>
        <span style={{ fontSize: 10, color: 'hsl(var(--muted-foreground))', fontFamily: MONO }}>4w</span>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(14, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: 3,
      }}>
        {activity28d.map((v, i) => {
          const isToday = i === 27
          const isHovered = hoveredIndex === i
          return (
            <span
              key={i}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                position: 'relative',
                aspectRatio: '1', borderRadius: 2.5,
                background: v ? color : 'hsl(var(--muted))',
                opacity: v ? (isToday ? 1 : 0.55) : 1,
                border: isToday ? `0.5px solid ${color}` : 'none',
                display: 'block',
                cursor: 'default',
              }}
            >
              {isHovered && (
                <span style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 5px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'hsl(var(--card))',
                  border: '0.5px solid hsl(var(--border))',
                  borderRadius: 4,
                  padding: '2px 6px',
                  fontSize: 10,
                  whiteSpace: 'nowrap',
                  color: 'hsl(var(--foreground))',
                  pointerEvents: 'none',
                  zIndex: 10,
                  fontFamily: MONO,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                }}>
                  {getLabel(i)} · {v ? 'task done' : 'no activity'}
                </span>
              )}
            </span>
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: 'hsl(var(--muted-foreground))', fontFamily: MONO }}>
        <span>4w ago</span>
        <span>this week</span>
      </div>
    </div>
  )
}
