'use client';

import { GlassPanel } from '@/shared/ui/glass';

export default function TestPanelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Animated background orbs for visual context */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-purple-500/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-500/30 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500/20 blur-3xl" />
      </div>

      {/* Test panels */}
      <div className="relative z-10 flex w-full max-w-4xl gap-6 p-8">
        {/* Default variant */}
        <div className="flex-1">
          <GlassPanel variant="default">
            <h2 className="mb-2 text-xl font-semibold text-white">
              Default Panel
            </h2>
            <p className="text-white/70">
              Standard glass effect with backdrop blur and border.
            </p>
            <p className="mt-4 text-sm text-white/50">
              Uses: glass glass-optimized classes
            </p>
          </GlassPanel>
        </div>

        {/* Light variant */}
        <div className="flex-1">
          <GlassPanel variant="light">
            <h2 className="mb-2 text-xl font-semibold text-white">
              Light Panel
            </h2>
            <p className="text-white/70">
              Brighter variant for high visibility areas.
            </p>
            <p className="mt-4 text-sm text-white/50">
              Uses: glass-card class
            </p>
          </GlassPanel>
        </div>

        {/* Dark variant */}
        <div className="flex-1">
          <GlassPanel variant="dark">
            <h2 className="mb-2 text-xl font-semibold text-white">
              Dark Panel
            </h2>
            <p className="text-white/70">
              Subtler variant for background containers.
            </p>
            <p className="mt-4 text-sm text-white/50">
              Uses: glass-dark class
            </p>
          </GlassPanel>
        </div>
      </div>

      {/* Info text */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-sm text-white/40">
          Verify: backdrop blur visible, borders visible, distinct variants
        </p>
      </div>
    </div>
  );
}
