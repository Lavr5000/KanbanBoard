/**
 * NoiseTexture - Subtle noise texture overlay for glassmorphism depth
 *
 * Purpose: Adds grain texture overlay to glass components for visual depth.
 * Uses SVG filter with fractal turbulence for organic noise effect.
 *
 * Features:
 * - Very subtle opacity (0.03) - doesn't distract
 * - Fixed positioning (doesn't scroll)
 * - Pointer events pass through (clickable content underneath)
 * - Single-file solution using base64 SVG
 */
export function NoiseTexture() {
  // Base64 encoded SVG with fractal noise filter
  const noiseSvg =
    "data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E";

  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10 opacity-[0.03]"
      style={{
        backgroundImage: `url('${noiseSvg}')`,
        backgroundRepeat: 'repeat',
      }}
    />
  );
}
