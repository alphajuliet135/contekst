import { colorTint } from '@/lib/utils'

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"

interface Props {
  count: number | string
  color: string
  dim?: boolean
}

export function CountPill({ count, color, dim = false }: Props) {
  if (count === undefined || count === null) return null
  return (
    <span style={{
      fontSize: 10, fontFamily: MONO, fontWeight: 500,
      padding: '1px 6px', borderRadius: 4, lineHeight: 1.4,
      background: dim ? 'hsl(var(--muted))' : colorTint(color, 0.14),
      border: `0.5px solid ${dim ? 'hsl(var(--border))' : colorTint(color, 0.25)}`,
      color: dim ? 'hsl(var(--muted-foreground))' : color,
    }}>
      {count}
    </span>
  )
}
