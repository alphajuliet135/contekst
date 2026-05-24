export function Greeting({ firstName }: { firstName?: string | null }) {
  const h = new Date().getHours()
  const base = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  const text = firstName ? `${base}, ${firstName}` : base

  return (
    <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.5, margin: 0, lineHeight: 1.15 }}>
      {text}
    </h1>
  )
}
