'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function SwipeBack() {
  const router = useRouter()

  useEffect(() => {
    let startX = 0
    let startY = 0

    function onTouchStart(e: TouchEvent) {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }

    function onTouchEnd(e: TouchEvent) {
      if (window.innerWidth >= 640) return
      const dx = e.changedTouches[0].clientX - startX
      const dy = Math.abs(e.changedTouches[0].clientY - startY)
      if (startX <= 30 && dx >= 50 && dy < dx * 0.8) {
        router.back()
      }
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [router])

  return null
}
