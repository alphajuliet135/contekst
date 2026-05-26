const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"

export function MantraStrip({ text }: { text: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 18,
      padding: '16px 20px',
      background: 'hsl(var(--card))',
      border: '0.5px solid hsl(var(--border))',
      borderLeft: '2px solid rgba(77,154,255,0.55)',
      borderRadius: 10,
      boxShadow: '0 1px 2px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.04)',
    }}>
      <span style={{ fontSize: 10, fontFamily: MONO, color: 'hsl(var(--muted-foreground))', letterSpacing: 1, textTransform: 'uppercase', flexShrink: 0 }}>
        Mantra
      </span>
      <span style={{ width: 1, height: 18, background: 'hsl(var(--border))', flexShrink: 0 }} />
      <p style={{ margin: 0, flex: 1, fontSize: 16, lineHeight: 1.45, color: 'hsl(var(--foreground))', fontStyle: 'italic', letterSpacing: -0.1 }}>
        {text}
      </p>
      <span style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', fontFamily: MONO, flexShrink: 0 }}>
        pinned · all contexts
      </span>
    </div>
  )
}
