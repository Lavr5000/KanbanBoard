/**
 * Simple in-memory rate limiter for API routes
 * Limits requests per user within a time window
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store (reset on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  const entries = Array.from(rateLimitStore.entries())
  for (const [key, entry] of entries) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 5 * 60 * 1000)

/**
 * Check if request is within rate limit
 * @param identifier - Unique identifier (user ID, IP, etc.)
 * @param limit - Max requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if within limit, false otherwise
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  // Clean up expired entries
  if (entry && now > entry.resetTime) {
    rateLimitStore.delete(identifier)
  }

  const currentEntry = rateLimitStore.get(identifier)

  if (!currentEntry) {
    // First request in window
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs,
    }
    rateLimitStore.set(identifier, newEntry)
    return { allowed: true, remaining: limit - 1, resetTime: newEntry.resetTime }
  }

  if (currentEntry.count >= limit) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: currentEntry.resetTime,
    }
  }

  // Increment counter
  currentEntry.count++
  return {
    allowed: true,
    remaining: limit - currentEntry.count,
    resetTime: currentEntry.resetTime,
  }
}

/**
 * Get rate limit status without incrementing
 */
export function getRateLimitStatus(identifier: string): {
  remaining: number
  resetTime: number
} | null {
  const entry = rateLimitStore.get(identifier)
  if (!entry) return null

  const now = Date.now()
  if (now > entry.resetTime) {
    rateLimitStore.delete(identifier)
    return null
  }

  return {
    remaining: Math.max(0, 10 - entry.count),
    resetTime: entry.resetTime,
  }
}
