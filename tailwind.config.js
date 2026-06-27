/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#09090B',
        night: '#111017',
        panel: '#17131B',
        burgundy: '#7B1123',
        garnet: '#A11A33',
        rose: '#D94B6A',
        text: '#F7F7F8',
        muted: '#9EA0A8',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      boxShadow: {
        panel:
          '0 0 0 1px rgba(217, 75, 106, 0.08), 0 28px 70px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255,255,255,0.03)',
        burgundy:
          '0 0 0 1px rgba(161, 26, 51, 0.28), 0 20px 60px rgba(123, 17, 35, 0.24), inset 0 1px 0 rgba(255,255,255,0.04)',
        tracking:
          '0 0 0 1px rgba(217,75,106,0.32), 0 0 0 8px rgba(123,17,35,0.08), 0 24px 70px rgba(123,17,35,0.26)',
      },
      fontFamily: {
        sans: ['"Sora"', 'ui-sans-serif', 'system-ui'],
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 0 1px rgba(217,75,106,0.18), 0 0 0 0 rgba(123,17,35,0.0)' },
          '50%': { boxShadow: '0 0 0 1px rgba(217,75,106,0.4), 0 0 0 10px rgba(123,17,35,0.12)' },
        },
        fadeRise: {
          '0%': { opacity: 0, transform: 'translateY(16px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        softPulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.03)' },
        },
      },
      animation: {
        glowPulse: 'glowPulse 2.8s ease-in-out infinite',
        fadeRise: 'fadeRise 500ms ease-out both',
        softPulse: 'softPulse 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
