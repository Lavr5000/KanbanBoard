'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { StaggerChildren, itemVariants } from '@/shared/ui/animations';

export default function TestStaggerPage() {
  const [key, setKey] = useState(0);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Animated background orbs for visual context */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-purple-500/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-500/30 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-2xl p-8">
        <h1 className="mb-4 text-center text-4xl font-bold text-white">
          StaggerChildren Test
        </h1>
        <p className="mb-8 text-center text-white/70">
          Items should animate in sequence (cascading effect)
        </p>

        {/* Control buttons */}
        <div className="mb-8 flex justify-center gap-4">
          <button
            onClick={() => setKey((k) => k + 1)}
            className="rounded-xl bg-white/10 px-6 py-3 text-lg font-medium text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105"
          >
            Replay Animation
          </button>
          <button
            onClick={() => setKey((k) => k + 1)}
            className="rounded-xl bg-blue-500/20 px-6 py-3 text-lg font-medium text-white backdrop-blur-md transition-all hover:bg-blue-500/30 hover:scale-105"
          >
            Fast (0.05s)
          </button>
          <button
            onClick={() => setKey((k) => k + 1)}
            className="rounded-xl bg-purple-500/20 px-6 py-3 text-lg font-medium text-white backdrop-blur-md transition-all hover:bg-purple-500/30 hover:scale-105"
          >
            Slow (0.2s)
          </button>
        </div>

        {/* Stagger animation demo */}
        <StaggerChildren key={key} staggerDelay={0.1} className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={`${key}-${i}`}
              variants={itemVariants}
              className="rounded-xl bg-white/10 p-6 backdrop-blur-md border border-white/10"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-white">Item {i}</span>
                <span className="text-sm text-white/50">
                  Spring animation
                </span>
              </div>
            </motion.div>
          ))}
        </StaggerChildren>

        <p className="mt-8 text-center text-sm text-white/50">
          Verify: Items animate one by one, spring physics (bouncy), fade + slide up
        </p>
      </div>
    </div>
  );
}
