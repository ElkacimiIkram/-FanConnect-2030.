/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: 'rgb(6 10 18 / <alpha-value>)',
          900: 'rgb(10 14 26 / <alpha-value>)',
          800: 'rgb(17 24 39 / <alpha-value>)',
          700: 'rgb(26 35 50 / <alpha-value>)',
          600: 'rgb(36 48 68 / <alpha-value>)',
          500: 'rgb(45 58 80 / <alpha-value>)',
        },
        surface: {
          DEFAULT: '#0f1419',
          card: 'rgba(255, 255, 255, 0.04)',
          muted: 'rgba(255, 255, 255, 0.06)',
          border: 'rgba(255, 255, 255, 0.08)',
          glass: 'rgba(17, 24, 39, 0.72)',
        },
        ink: {
          DEFAULT: '#f8fafc',
          muted: '#94a3b8',
          faint: '#64748b',
          dark: '#1a1f1c',
        },
        primary: {
          50: 'rgb(236 253 243 / <alpha-value>)',
          100: 'rgb(209 250 229 / <alpha-value>)',
          200: 'rgb(167 243 200 / <alpha-value>)',
          300: 'rgb(110 231 168 / <alpha-value>)',
          400: 'rgb(52 211 122 / <alpha-value>)',
          500: 'rgb(22 179 100 / <alpha-value>)',
          600: 'rgb(15 159 88 / <alpha-value>)',
          700: 'rgb(11 127 71 / <alpha-value>)',
          800: 'rgb(10 95 56 / <alpha-value>)',
          900: 'rgb(6 78 47 / <alpha-value>)',
        },
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#f5c842',
          500: '#d4af37',
          600: '#b8941f',
          700: '#92700f',
        },
        pitch: {
          600: '#0f9f58',
          700: '#0b7f47',
          800: '#0a5f38',
          900: '#064e2f',
          950: '#032a18',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Syne', 'Outfit', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['3.5rem', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '800' }],
        'display-lg': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md': ['1.75rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float 10s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'pulse-live': 'pulseLive 2s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        'gradient-shift': 'gradientShift 12s ease infinite',
        'bounce-soft': 'bounceSoft 2.5s ease-in-out infinite',
        'fade-up': 'fadeUp 0.55s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'scale-in': 'scaleIn 0.45s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'orbit': 'orbit 20s linear infinite',
        'spin-slow': 'spin 12s linear infinite',
        'glow-pulse': 'glowPulse 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-18px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.08)' },
        },
        pulseLive: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.5)' },
          '50%': { boxShadow: '0 0 0 12px rgba(239, 68, 68, 0)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(120px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(120px) rotate(-360deg)' },
        },
      },
      boxShadow: {
        soft: '0 2px 20px rgba(0, 0, 0, 0.25)',
        card: '0 8px 32px rgba(0, 0, 0, 0.35)',
        'card-hover': '0 16px 48px rgba(0, 0, 0, 0.45)',
        glow: '0 0 40px rgba(15, 159, 88, 0.35)',
        'glow-gold': '0 0 36px rgba(212, 175, 55, 0.3)',
        'glow-lg': '0 0 60px rgba(15, 159, 88, 0.25)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        sidebar: '4px 0 24px rgba(0, 0, 0, 0.3)',
      },
      dropShadow: {
        'glow-gold': '0 0 20px rgba(212, 175, 55, 0.45)',
        glow: '0 0 16px rgba(15, 159, 88, 0.4)',
      },
      backgroundImage: {
        'arena-mesh':
          'radial-gradient(ellipse 80% 60% at 20% 0%, rgba(15,159,88,0.22), transparent 55%), radial-gradient(ellipse 60% 50% at 90% 20%, rgba(212,175,55,0.14), transparent 50%), radial-gradient(ellipse 50% 40% at 50% 80%, rgba(15,159,88,0.08), transparent 50%)',
        'hero-pitch':
          'linear-gradient(160deg, #060a12 0%, #0a0e1a 30%, #064e2f 65%, #0f9f58 100%)',
        'hero-stadium':
          'radial-gradient(ellipse 100% 80% at 50% 100%, rgba(15,159,88,0.35), transparent 60%), radial-gradient(ellipse 60% 50% at 80% 20%, rgba(212,175,55,0.12), transparent 50%), linear-gradient(180deg, #0f172a 0%, #111827 45%, #064e2f 100%)',
        'mesh-hero':
          'radial-gradient(at 30% 20%, rgba(52,211,122,0.25) 0%, transparent 50%), radial-gradient(at 80% 10%, rgba(212,175,55,0.15) 0%, transparent 45%)',
        'glass-gradient':
          'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
        'gold-shine':
          'linear-gradient(135deg, #f5c842 0%, #d4af37 50%, #b8941f 100%)',
      },
      backdropBlur: {
        glass: '20px',
      },
    },
  },
  plugins: [],
};