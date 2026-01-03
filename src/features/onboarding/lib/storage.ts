const ONBOARDING_COMPLETED_KEY = 'onboarding_completed'
const ONBOARDING_CURRENT_STEP_KEY = 'onboarding_current_step'

/**
 * Check if user has completed onboarding
 */
export function isOnboardingCompleted(): boolean {
  if (typeof window === 'undefined') return false

  try {
    return localStorage.getItem(ONBOARDING_COMPLETED_KEY) === 'true'
  } catch {
    return false
  }
}

/**
 * Mark onboarding as completed
 */
export function setOnboardingCompleted(value: boolean): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, String(value))
  } catch (error) {
    console.error('Failed to save onboarding status:', error)
  }
}

/**
 * Save current onboarding step progress
 */
export function saveOnboardingProgress(step: number): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(ONBOARDING_CURRENT_STEP_KEY, String(step))
  } catch (error) {
    console.error('Failed to save onboarding progress:', error)
  }
}

/**
 * Get saved onboarding step progress
 */
export function getOnboardingProgress(): number {
  if (typeof window === 'undefined') return 0

  try {
    const saved = localStorage.getItem(ONBOARDING_CURRENT_STEP_KEY)
    return saved ? parseInt(saved, 10) : 0
  } catch {
    return 0
  }
}

/**
 * Clear onboarding progress (for testing/replay)
 */
export function clearOnboardingProgress(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(ONBOARDING_COMPLETED_KEY)
    localStorage.removeItem(ONBOARDING_CURRENT_STEP_KEY)
  } catch (error) {
    console.error('Failed to clear onboarding progress:', error)
  }
}
