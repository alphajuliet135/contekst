import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a lighter tint from a hex color for theming
export function colorTint(hex: string, opacity = 0.12): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

export function colorBorder(hex: string, opacity = 0.3): string {
  return colorTint(hex, opacity)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

export function isOverdue(dateStr: string): boolean {
  return new Date(dateStr) < new Date()
}

export function isDueSoon(dateStr: string, days = 7): boolean {
  const due = new Date(dateStr)
  const soon = new Date()
  soon.setDate(soon.getDate() + days)
  return due <= soon && due >= new Date()
}
