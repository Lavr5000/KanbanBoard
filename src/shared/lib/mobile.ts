/**
 * Mobile utilities for the application
 */

// Safe area insets for notched devices (iPhone X+, etc.)
export const getSafeAreaInsets = () => {
  if (typeof window === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 }
  }

  const style = getComputedStyle(document.documentElement)
  return {
    top: parseInt(style.getPropertyValue('--sat') || '0', 10),
    right: parseInt(style.getPropertyValue('--sar') || '0', 10),
    bottom: parseInt(style.getPropertyValue('--sab') || '0', 10),
    left: parseInt(style.getPropertyValue('--sal') || '0', 10),
  }
}

// Prevent body scroll when modal/drawer is open
export const lockBodyScroll = () => {
  if (typeof document === 'undefined') return

  document.body.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.body.style.width = '100%'
  document.body.style.top = `-${window.scrollY}px`
}

export const unlockBodyScroll = () => {
  if (typeof document === 'undefined') return

  const scrollY = document.body.style.top
  document.body.style.overflow = ''
  document.body.style.position = ''
  document.body.style.width = ''
  document.body.style.top = ''
  window.scrollTo(0, parseInt(scrollY || '0', 10) * -1)
}

// Haptic feedback (where supported)
export const hapticFeedback = (style: 'light' | 'medium' | 'heavy' = 'light') => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    const duration = style === 'light' ? 10 : style === 'medium' ? 20 : 30
    navigator.vibrate(duration)
  }
}

// Check if device is iOS
export const isIOS = () => {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream
}

// Check if device is Android
export const isAndroid = () => {
  if (typeof navigator === 'undefined') return false
  return /Android/.test(navigator.userAgent)
}

// Check if running as PWA
export const isPWA = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches
}

// Breakpoint values matching Tailwind
export const breakpoints = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

// Check if screen is below breakpoint
export const isBelowBreakpoint = (bp: keyof typeof breakpoints) => {
  if (typeof window === 'undefined') return false
  return window.innerWidth < breakpoints[bp]
}
