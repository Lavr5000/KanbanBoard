/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./entities/**/*.{js,ts,jsx,tsx,mdx}",
    "./shared/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // New premium color palette based on zinc scale
        canvas: "#09090b",       // Main background (deep anthracite)
        sidebar: "#0c0c0e",      // Sidebar background
        card: "#18181b",         // Card background (zinc-900)
        elevated: "#27272a",     // Elevated surfaces (zinc-800)

        // Text colors
        'text-primary': "#f4f4f5",    // zinc-100
        'text-secondary': "#a1a1aa",  // zinc-400
        'text-muted': "#71717a",      // zinc-500
        'text-subtle': "#52525b",     // zinc-600

        // Accent colors - sophisticated indigo/violet
        accent: "#6366f1",       // indigo-500 (primary accent)
        'accent-hover': "#818cf8", // indigo-400
        'accent-muted': "#4f46e5", // indigo-600

        // Status colors
        success: "#10b981",      // emerald-500
        warning: "#f59e0b",      // amber-500
        error: "#ef4444",        // red-500
        info: "#3b82f6",         // blue-500

        // Border colors - subtle
        'border-subtle': "rgba(255, 255, 255, 0.06)",
        'border-default': "rgba(255, 255, 255, 0.1)",
        'border-hover': "rgba(255, 255, 255, 0.15)",

        // Legacy support
        board: "#09090b",
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      borderRadius: {
        'card': '8px',
        'container': '12px',
        'button': '6px',
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'glow': '0 0 20px rgba(99, 102, 241, 0.15)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      },
      backdropBlur: {
        'glass': '12px',
      },
    },
  },
  plugins: [],
}
