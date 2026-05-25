import type { Metadata, Viewport } from 'next'
import { cookies } from 'next/headers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Contekst',
  description: 'Your life, structured.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Contekst',
  },
}

export const viewport: Viewport = {
  themeColor: '#171717',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const theme = cookieStore.get('theme')?.value ?? 'system'
  // For 'system' we write no attribute — the CSS media query handles OS preference
  const dataTheme = theme === 'system' ? undefined : (theme as 'light' | 'dark')

  return (
    <html lang="en" data-theme={dataTheme} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
