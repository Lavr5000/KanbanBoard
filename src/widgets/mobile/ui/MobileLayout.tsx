'use client'

import { useState, useCallback } from 'react'
import { MobileHeader } from './MobileHeader'
import { MobileLeftDrawer } from './MobileLeftDrawer'
import { MobileRightDrawer } from './MobileRightDrawer'
import { MobileFAB } from './MobileFAB'
import { MobileOnboarding } from '@/features/onboarding'
import { useMobileUIStore } from '@/entities/ui/model/mobileStore'
import { FeedbackModal } from '@/features/feedback'
import { DonationModal } from '@/features/donation'

interface MobileLayoutProps {
  children: React.ReactNode
  boardId: string | null
  progressPercentage: number
  onAddTask: () => void
}

export function MobileLayout({
  children,
  boardId,
  progressPercentage,
  onAddTask,
}: MobileLayoutProps) {
  const { openRightDrawer, startMobileOnboarding } = useMobileUIStore()

  const handleOpenRoadmap = useCallback(() => {
    openRightDrawer()
  }, [openRightDrawer])

  const handleStartOnboarding = useCallback(() => {
    startMobileOnboarding()
  }, [startMobileOnboarding])

  return (
    <div className="min-h-screen bg-[#121218] flex flex-col">
      {/* Mobile Header */}
      <MobileHeader progressPercentage={progressPercentage} />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>

      {/* Mobile Drawers */}
      <MobileLeftDrawer onStartOnboarding={handleStartOnboarding} />
      <MobileRightDrawer boardId={boardId} />

      {/* FAB Button */}
      <MobileFAB
        onAddTask={onAddTask}
        onOpenRoadmap={handleOpenRoadmap}
      />

      {/* Mobile Onboarding */}
      <MobileOnboarding />

      {/* Modals */}
      <FeedbackModal />
      <DonationModal />
    </div>
  )
}
