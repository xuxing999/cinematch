import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 霓虹深色主題
        background: '#221f1f',
        foreground: '#ffffff',
        neon: {
          red: '#e50914',
          pink: '#ff006e',
          purple: '#8338ec',
          blue: '#3a86ff',
          cyan: '#06ffa5',
        },
        dark: {
          50: '#3d3a3a',
          100: '#2e2b2b',
          200: '#221f1f',
          300: '#1a1818',
          400: '#131111',
        },
      },
      boxShadow: {
        'neon-red': '0 0 10px rgba(229, 9, 20, 0.5), 0 0 20px rgba(229, 9, 20, 0.3)',
        'neon-pink': '0 0 10px rgba(255, 0, 110, 0.5), 0 0 20px rgba(255, 0, 110, 0.3)',
        'neon-cyan': '0 0 10px rgba(6, 255, 165, 0.5), 0 0 20px rgba(6, 255, 165, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(229, 9, 20, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(229, 9, 20, 0.8), 0 0 30px rgba(229, 9, 20, 0.5)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
