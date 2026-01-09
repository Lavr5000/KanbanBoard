/**
 * Mobile Onboarding Storage
 * Separate from desktop onboarding - uses different localStorage keys
 */

const MOBILE_ONBOARDING_COMPLETED_KEY = 'mobile_onboarding_completed';
const MOBILE_ONBOARDING_CURRENT_STEP_KEY = 'mobile_onboarding_current_step';

/**
 * Check if mobile onboarding is completed
 */
export function isMobileOnboardingCompleted(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(MOBILE_ONBOARDING_COMPLETED_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Set mobile onboarding completion status
 */
export function setMobileOnboardingCompleted(value: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MOBILE_ONBOARDING_COMPLETED_KEY, String(value));
  } catch (error) {
    console.error('Failed to save mobile onboarding status:', error);
  }
}

/**
 * Save current onboarding step (for resuming)
 */
export function saveMobileOnboardingProgress(step: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MOBILE_ONBOARDING_CURRENT_STEP_KEY, String(step));
  } catch (error) {
    console.error('Failed to save mobile onboarding progress:', error);
  }
}

/**
 * Get current onboarding step
 */
export function getMobileOnboardingProgress(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const saved = localStorage.getItem(MOBILE_ONBOARDING_CURRENT_STEP_KEY);
    return saved ? parseInt(saved, 10) : 0;
  } catch {
    return 0;
  }
}

/**
 * Clear mobile onboarding progress (for testing)
 */
export function clearMobileOnboardingProgress(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(MOBILE_ONBOARDING_COMPLETED_KEY);
    localStorage.removeItem(MOBILE_ONBOARDING_CURRENT_STEP_KEY);
  } catch (error) {
    console.error('Failed to clear mobile onboarding progress:', error);
  }
}
