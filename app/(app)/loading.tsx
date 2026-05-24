export default function MissionControlLoading() {
  const skel = (w: number | string, h: number): React.CSSProperties => ({
    width: w,
    height: h,
    borderRadius: 6,
    background: 'hsl(var(--muted))',
    animation: 'pulse 1.5s ease-in-out infinite',
  })

  return (
    <div style={{ display: 'flex', flex: 1 }}>
      <div className="page-pad" style={{ flex: 1, minWidth: 0 }}>
        {/* Greeting row */}
        <div style={{ marginBottom: 36, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={skel(180, 28)} />
          <div style={skel(90, 14)} />
        </div>

        {/* Section label */}
        <div style={{ ...skel(100, 11), marginBottom: 12 }} />

        {/* Card grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 10,
          marginBottom: 40,
        }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="card-shadow" style={{
              background: 'hsl(var(--card))',
              border: '0.5px solid hsl(var(--border))',
              borderRadius: 12,
              height: 120,
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          ))}
        </div>

        {/* Second section label */}
        <div style={{ ...skel(120, 11), marginBottom: 12 }} />

        {/* Full-width card */}
        <div className="card-shadow" style={{
          background: 'hsl(var(--card))',
          border: '0.5px solid hsl(var(--border))',
          borderRadius: 12,
          height: 160,
          animation: 'pulse 1.5s ease-in-out infinite',
        }} />
      </div>
    </div>
  )
}
