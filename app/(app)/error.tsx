'use client'

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AppError({ error, reset }: Props) {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 24px',
    }}>
      <div style={{
        background: 'hsl(var(--card))',
        border: '0.5px solid hsl(var(--border))',
        borderRadius: 12,
        padding: '28px 32px',
        maxWidth: 420,
        width: '100%',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: 13,
          fontWeight: 500,
          color: 'hsl(var(--foreground))',
          margin: '0 0 6px',
        }}>
          Something went wrong
        </p>
        <p style={{
          fontSize: 12,
          color: 'hsl(var(--muted-foreground))',
          margin: '0 0 20px',
          lineHeight: 1.5,
        }}>
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <button
          onClick={reset}
          style={{
            border: 'none',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 500,
            padding: '6px 16px',
            background: 'hsl(var(--muted))',
            color: 'hsl(var(--foreground))',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </div>
    </div>
  )
}
