/**
 * AnimatedGradient - Animated gradient mesh background component
 *
 * Purpose: Provides slowly shifting gradient background for atmospheric effect.
 * Background is fixed position (doesn't scroll with content).
 *
 * Features:
 * - Purple to blue gradient (brand colors)
 * - 30-second animation cycle (subtle, not distracting)
 * - GPU-optimized with CSS transforms
 * - Fixed positioning for non-scrolling background
 */
export function AnimatedGradient() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-slate-900/40" />

      {/* Animated gradient layer with 400% size for smooth shifting */}
      <div
        className="absolute inset-0 animate-gradient-shift bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-pink-500/20 bg-[length:400%_400%]"
        style={{ willChange: 'background-position' }}
      />
    </div>
  );
}
