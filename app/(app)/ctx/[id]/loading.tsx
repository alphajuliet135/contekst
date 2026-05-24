export default function ContextLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      {/* Context header skeleton */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '0.5px solid hsl(var(--border))',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{
          width: 10, height: 10, borderRadius: '50%',
          background: 'hsl(var(--muted))',
          animation: 'pulse 1.5s ease-in-out infinite',
          flexShrink: 0,
        }} />
        <div style={{
          width: 140, height: 18, borderRadius: 5,
          background: 'hsl(var(--muted))',
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
        <div style={{
          width: 200, height: 13, borderRadius: 4,
          background: 'hsl(var(--muted))',
          animation: 'pulse 1.5s ease-in-out infinite',
          marginLeft: 8,
        }} />
      </div>

      {/* Widget grid skeleton */}
      <div className="page-pad" style={{ flex: 1 }}>
        <div className="widget-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card-shadow" style={{
              background: 'hsl(var(--card))',
              border: '0.5px solid hsl(var(--border))',
              borderRadius: 12,
              height: 200,
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}
