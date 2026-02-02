'use client';

import { GlassCard } from '@/shared/ui/glass';

export default function GlassTestPage() {
  return (
    <main className="min-h-screen bg-background p-8">
      {/* Background elements for glass effect demonstration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-blue/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-purple/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header with Space Grotesk */}
        <header className="text-center space-y-2">
          <h1 className="font-display text-5xl font-bold text-white">
            Glassmorphism Foundation
          </h1>
          <p className="text-white/60 font-sans">
            Testing typography, glass effects, and animations
          </p>
        </header>

        {/* GlassCard variants */}
        <div className="grid gap-6 md:grid-cols-3">
          <GlassCard variant="default" interactive className="p-6">
            <h2 className="font-display text-xl font-semibold mb-2">Default Glass</h2>
            <p className="text-sm text-white/70">
              Standard glass effect with backdrop blur and subtle border.
            </p>
          </GlassCard>

          <GlassCard variant="light" interactive className="p-6">
            <h2 className="font-display text-xl font-semibold mb-2">Light Glass</h2>
            <p className="text-sm text-white/70">
              Brighter glass with gradient overlay and stronger border.
            </p>
          </GlassCard>

          <GlassCard variant="dark" interactive className="p-6">
            <h2 className="font-display text-xl font-semibold mb-2">Dark Glass</h2>
            <p className="text-sm text-white/70">
              Darker glass with reduced opacity for subtle contrast.
            </p>
          </GlassCard>
        </div>

        {/* Blur level demonstration */}
        <div className="space-y-4">
          <h2 className="font-display text-2xl font-semibold">Blur Levels</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <GlassCard blurLevel="md" className="p-4">
              <span className="text-white/60">Medium blur (backdrop-blur-md)</span>
            </GlassCard>
            <GlassCard blurLevel="xl" className="p-4">
              <span className="text-white/60">Extra large blur (backdrop-blur-xl)</span>
            </GlassCard>
          </div>
        </div>

        {/* Animation demo */}
        <GlassCard interactive className="p-6">
          <h2 className="font-display text-2xl font-semibold mb-4">Interactive Demo</h2>
          <p className="text-white/70 mb-4">
            Hover over this card to see the spring-physics animation feel.
            The transition uses CSS variables defined in globals.css.
          </p>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-accent-blue/20 hover:bg-accent-blue/30 rounded-lg transition-colors duration-[var(--duration-normal)]">
              Button 1
            </button>
            <button className="px-4 py-2 bg-accent-purple/20 hover:bg-accent-purple/30 rounded-lg transition-colors duration-[var(--duration-normal)]">
              Button 2
            </button>
          </div>
        </GlassCard>

        {/* Success criteria checklist */}
        <GlassCard variant="dark" className="p-6">
          <h2 className="font-display text-xl font-semibold mb-4">Verification Checklist</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span className="text-accent-green">✓</span>
              <span>Headings use Space Grotesk (geometric, distinctive)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-accent-green">✓</span>
              <span>Body text uses Inter (clean, readable)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-accent-green">✓</span>
              <span>Cards show visible blur and transparency</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-accent-green">✓</span>
              <span>Background orbs are visible through glass</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-accent-green">✓</span>
              <span>Hover animations use CSS variable timing</span>
            </li>
          </ul>
        </GlassCard>
      </div>
    </main>
  );
}
