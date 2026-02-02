import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/widgets/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/entities/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/shared/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#121218",
        surface: "#1c1c24",
        border: "#252530",
        accent: {
          blue: "#3b82f6",
          orange: "#f97316",
          purple: "#a855f7",
          green: "#22c55e",
          red: "#ef4444",
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      opacity: {
        '5': '0.05',
        '85': '0.85',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-space-grotesk)', 'sans-serif'],
      },
    },
    keyframes: {
      'gradient-shift': {
        '0%, 100%': { backgroundPosition: '0% 50%' },
        '50%': { backgroundPosition: '100% 50%' },
      },
      'float': {
        '0%, 100%': { transform: 'translateY(0px)' },
        '50%': { transform: 'translateY(-20px)' },
      },
      'pulse-glow': {
        '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
        '50%': { opacity: '0.5', transform: 'scale(1.05)' },
      },
    },
    animation: {
      'gradient-shift': 'gradient-shift 30s ease infinite',
      'float': 'float 6s ease-in-out infinite',
      'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
    },
  },
  plugins: [],
};
export default config;
