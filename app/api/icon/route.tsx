import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export function GET(req: NextRequest) {
  const size = Math.min(512, Math.max(16, parseInt(req.nextUrl.searchParams.get('size') ?? '192')))
  const radius = Math.round(size * 0.18)
  const fontSize = Math.round(size * 0.62)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#171717',
          borderRadius: radius,
        }}
      >
        <span
          style={{
            color: 'white',
            fontSize,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          c
        </span>
      </div>
    ),
    { width: size, height: size }
  )
}
