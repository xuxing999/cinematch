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
        // 極簡復古高級感主題
        background: '#1a1816',
        foreground: '#f0ece4',

        // 點綴色：保留 neon 類名但替換為低飽和復古色
        // neon.red   → 鐵鏽紅 Burnt Orange
        // neon.pink  → 古銅金 Brass
        // neon.purple→ 鼠尾草綠 Sage Green
        // neon.blue  → 深鼠尾草 Muted Sage
        // neon.cyan  → 暖棕褐 Warm Tan
        neon: {
          red: '#c14b2a',
          pink: '#c9a84c',
          purple: '#7d9b76',
          blue: '#8a9a7a',
          cyan: '#b8976e',
        },

        // 深色色階：保留 dark 類名，更新為暖炭灰調
        dark: {
          50: '#3a3530',
          100: '#2a2724',
          200: '#1e1c1a',
          300: '#161412',
          400: '#0e0c0a',
        },
      },

      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', '"Times New Roman"', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
      },

      boxShadow: {
        // 移除霓虹發光，改為細緻陰影
        'neon-red':  '0 2px 8px rgba(193, 75, 42, 0.25), 0 1px 3px rgba(0,0,0,0.4)',
        'neon-pink': '0 2px 8px rgba(201, 168, 76, 0.2),  0 1px 3px rgba(0,0,0,0.4)',
        'neon-cyan': '0 2px 8px rgba(125, 155, 118, 0.2), 0 1px 3px rgba(0,0,0,0.4)',
        'card':      '0 1px 3px rgba(0,0,0,0.5)',
        'card-hover':'0 4px 16px rgba(0,0,0,0.6)',
        'inset-border': 'inset 0 0 0 1px rgba(240,236,228,0.08)',
      },

      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':    'fadeIn 0.25s ease-out',
        'slide-up':   'slideUp 0.35s ease-out',
      },

      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
