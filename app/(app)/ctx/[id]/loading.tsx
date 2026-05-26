const CARD: React.CSSProperties = {
  borderRadius: 12,
  background: 'hsl(var(--card))',
  border: '0.5px solid hsl(var(--border))',
  animation: 'pulse 1.5s ease-in-out infinite',
}

export default function ContextLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      {/* Hero skeleton */}
      <div style={{
        height: 200,
        background: 'hsl(var(--muted))',
        animation: 'pulse 1.5s ease-in-out infinite',
        flexShrink: 0,
      }} />

      {/* Body skeleton */}
      <div className="page-pad" style={{ paddingTop: 24, paddingBottom: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Priorities + Ahead */}
        <div className="macro-body-grid">
          {[0, 1].map(i => (
            <div key={i} style={{ ...CARD, height: 180 }} />
          ))}
        </div>
        {/* Notes */}
        <div style={{ ...CARD, height: 120 }} />
        {/* ReferenceStrip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ ...CARD, height: 120 }} />
          ))}
        </div>
      </div>
    </div>
  )
}
