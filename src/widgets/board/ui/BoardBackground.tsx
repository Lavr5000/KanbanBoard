'use client';

import {
  AnimatedGradient,
  GlowOrb,
  NoiseTexture,
  MouseParallax,
} from '@/shared/ui/background';

/**
 * BoardBackground - Combined atmospheric background for Kanban board
 *
 * Purpose: Integrates all background components (gradient, orbs, noise, parallax)
 * into a single wrapper for the Kanban board. Creates atmospheric glassmorphism
 * effect with ambient lighting.
 *
 * Features:
 * - Animated gradient mesh (purple to blue, 30s cycle)
 * - 4 ambient glow orbs of varying sizes and colors
 * - Subtle noise texture for depth
 * - Mouse-tracking parallax (15px max shift)
 * - All elements fixed position (don't scroll with content)
 * - GPU-optimized rendering
 */
export function BoardBackground() {
  return (
    <MouseParallax strength={15} className="fixed inset-0 -z-10">
      {/* Base animated gradient */}
      <AnimatedGradient />

      {/* Ambient glow orbs - positioned around viewport */}
      <GlowOrb
        size={400}
        color="rgba(168, 85, 247, 0.3)"
        top="20%"
        left="20%"
        delay={0.2}
      />
      <GlowOrb
        size={300}
        color="rgba(59, 130, 246, 0.3)"
        bottom="30%"
        right="20%"
        delay={0.4}
      />
      <GlowOrb
        size={500}
        color="rgba(236, 72, 153, 0.2)"
        top="50%"
        left="50%"
        delay={0}
      />
      <GlowOrb
        size={250}
        color="rgba(34, 197, 94, 0.2)"
        top="70%"
        left="30%"
        delay={0.6}
      />

      {/* Noise texture overlay for glass depth */}
      <NoiseTexture />
    </MouseParallax>
  );
}
