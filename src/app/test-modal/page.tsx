'use client';

import { useState } from 'react';
import { GlassModal } from '@/shared/ui/glass';

export default function TestModalPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Animated background orbs for visual context */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-purple-500/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-500/30 blur-3xl" />
      </div>

      {/* Test content behind modal to demonstrate blur effect */}
      <div className="relative z-10 text-center">
        <h1 className="mb-4 text-4xl font-bold text-white">
          GlassModal Test Page
        </h1>
        <p className="mb-8 text-white/70">
          Click the button below to test the modal animation
        </p>

        <button
          onClick={() => setIsOpen(true)}
          className="rounded-xl bg-white/10 px-6 py-3 text-lg font-medium text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-105"
        >
          Open Modal
        </button>

        {/* Test different sizes */}
        <div className="mt-8 flex gap-4 justify-center">
          <button
            onClick={() => setIsOpen(true)}
            className="rounded-lg bg-blue-500/20 px-4 py-2 text-sm text-white backdrop-blur-sm hover:bg-blue-500/30"
          >
            Small
          </button>
          <button
            onClick={() => setIsOpen(true)}
            className="rounded-lg bg-purple-500/20 px-4 py-2 text-sm text-white backdrop-blur-sm hover:bg-purple-500/30"
          >
            Medium
          </button>
          <button
            onClick={() => setIsOpen(true)}
            className="rounded-lg bg-pink-500/20 px-4 py-2 text-sm text-white backdrop-blur-sm hover:bg-pink-500/30"
          >
            Large
          </button>
        </div>

        <p className="mt-8 text-sm text-white/50">
          Try: Escape key, click outside, close button
        </p>
      </div>

      {/* Test Modal - Small */}
      <GlassModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Small Modal"
        size="sm"
      >
        <p className="mb-4">
          This is a small modal with glassmorphism effect.
        </p>
        <p className="text-white/60">
          The background behind this modal should be blurred.
        </p>
      </GlassModal>
    </div>
  );
}
