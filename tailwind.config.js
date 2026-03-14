/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0B0F19',
        surface: '#121826',
        card: '#1B2233',
        elevated: '#232D42',
        primary: '#4F8CFF',
        ai: '#00E5A8',
        warning: '#FFB020',
        danger: '#FF4D6D',
        success: '#00E5A8',
        'text-muted': '#8B95A5',
        'text-soft': '#6B7689',
        border: 'rgba(255,255,255,0.06)',
        'glass-bg': 'rgba(27,34,51,0.65)',
        'glass-border': 'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        heading: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(79, 140, 255, 0.35)',
        'glow-ai': '0 0 40px rgba(0, 229, 168, 0.35)',
        card: '0 4px 24px rgba(0, 0, 0, 0.4)',
      },
      borderRadius: {
        card: '12px',
        'card-sm': '8px',
      },
      animation: {
        'progress': 'progress 1s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease',
      },
      keyframes: {
        progress: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--tw-progress-width, 0%)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
