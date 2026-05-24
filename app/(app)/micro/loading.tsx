export default function MicroLoading() {
  return (
    <div className="page-pad">
      {/* Page heading skeleton */}
      <div style={{ marginBottom: 36 }}>
        <div style={{
          width: 80, height: 22, borderRadius: 5,
          background: 'hsl(var(--muted))',
          marginBottom: 8,
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
        <div style={{
          width: 260, height: 13, borderRadius: 4,
          background: 'hsl(var(--muted))',
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
      </div>

      {/* Micro card grid skeleton */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 12,
      }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="card-shadow" style={{
            background: 'hsl(var(--card))',
            border: '0.5px solid hsl(var(--border))',
            borderRadius: 12,
            height: 160,
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        ))}
      </div>
    </div>
  )
}
