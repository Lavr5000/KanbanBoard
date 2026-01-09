'use client'

import { create } from 'zustand'

interface MobileUIState {
  // Drawer states
  isLeftDrawerOpen: boolean
  isRightDrawerOpen: boolean

  // FAB state
  isFabMenuOpen: boolean

  // Active column for mobile navigation
  activeColumnIndex: number

  // Onboarding state
  isMobileOnboardingActive: boolean
  mobileOnboardingStep: number

  // Actions
  openLeftDrawer: () => void
  closeLeftDrawer: () => void
  toggleLeftDrawer: () => void

  openRightDrawer: () => void
  closeRightDrawer: () => void
  toggleRightDrawer: () => void

  openFabMenu: () => void
  closeFabMenu: () => void
  toggleFabMenu: () => void

  setActiveColumnIndex: (index: number) => void
  nextColumn: (totalColumns: number) => void
  prevColumn: () => void

  startMobileOnboarding: () => void
  nextOnboardingStep: () => void
  prevOnboardingStep: () => void
  completeMobileOnboarding: () => void
  skipMobileOnboarding: () => void
}

export const useMobileUIStore = create<MobileUIState>((set, get) => ({
  // Initial states
  isLeftDrawerOpen: false,
  isRightDrawerOpen: false,
  isFabMenuOpen: false,
  activeColumnIndex: 0,
  isMobileOnboardingActive: false,
  mobileOnboardingStep: 0,

  // Left drawer actions
  openLeftDrawer: () => set({ isLeftDrawerOpen: true, isRightDrawerOpen: false, isFabMenuOpen: false }),
  closeLeftDrawer: () => set({ isLeftDrawerOpen: false }),
  toggleLeftDrawer: () => set(state => ({
    isLeftDrawerOpen: !state.isLeftDrawerOpen,
    isRightDrawerOpen: false,
    isFabMenuOpen: false,
  })),

  // Right drawer actions
  openRightDrawer: () => set({ isRightDrawerOpen: true, isLeftDrawerOpen: false, isFabMenuOpen: false }),
  closeRightDrawer: () => set({ isRightDrawerOpen: false }),
  toggleRightDrawer: () => set(state => ({
    isRightDrawerOpen: !state.isRightDrawerOpen,
    isLeftDrawerOpen: false,
    isFabMenuOpen: false,
  })),

  // FAB menu actions
  openFabMenu: () => set({ isFabMenuOpen: true }),
  closeFabMenu: () => set({ isFabMenuOpen: false }),
  toggleFabMenu: () => set(state => ({ isFabMenuOpen: !state.isFabMenuOpen })),

  // Column navigation
  setActiveColumnIndex: (index) => set({ activeColumnIndex: index }),
  nextColumn: (totalColumns) => set(state => ({
    activeColumnIndex: Math.min(state.activeColumnIndex + 1, totalColumns - 1),
  })),
  prevColumn: () => set(state => ({
    activeColumnIndex: Math.max(state.activeColumnIndex - 1, 0),
  })),

  // Onboarding actions
  startMobileOnboarding: () => set({ isMobileOnboardingActive: true, mobileOnboardingStep: 0 }),
  nextOnboardingStep: () => set(state => ({ mobileOnboardingStep: state.mobileOnboardingStep + 1 })),
  prevOnboardingStep: () => set(state => ({ mobileOnboardingStep: Math.max(0, state.mobileOnboardingStep - 1) })),
  completeMobileOnboarding: () => {
    set({ isMobileOnboardingActive: false, mobileOnboardingStep: 0 })
    // Save to localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mobile_onboarding_completed', 'true')
    }
  },
  skipMobileOnboarding: () => {
    set({ isMobileOnboardingActive: false, mobileOnboardingStep: 0 })
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('mobile_onboarding_completed', 'true')
    }
  },
}))

// Helper to check if mobile onboarding was completed
export const isMobileOnboardingCompleted = (): boolean => {
  if (typeof localStorage === 'undefined') return false
  return localStorage.getItem('mobile_onboarding_completed') === 'true'
}

// Helper to reset mobile onboarding (for testing)
export const resetMobileOnboarding = () => {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('mobile_onboarding_completed')
  }
}
