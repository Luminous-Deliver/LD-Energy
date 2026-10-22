import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Redesign tokens (prototype v7.2, scrollcraft/builds/home/tokens.css, approved 22/10/2026).
        // The shared parts use these; page bodies keep primary/secondary/accent until their own slice.
        slate: { 50: '#F5F6FC', 100: '#EBECF4', 200: '#D7DAE5', 300: '#B9BDCD', 400: '#9197AE', 500: '#6D738D', 600: '#4F546B', 700: '#33384F', 800: '#252834', 900: '#181A22', 950: '#0B1528' },
        sage: { 50: '#F1F9F5', 100: '#E7F1EB', 200: '#D3E2DA', 300: '#B7CEC1', 400: '#94B4A2', 500: '#6E9781', 600: '#4F7A64', 700: '#3A624E', 800: '#2C4A3B', 900: '#1E3328' },
        stone: { 50: '#FCFBF8', 100: '#F1EFE8', 200: '#E2E1DE', 300: '#CFCECA', 400: '#ACABA5', 500: '#88867E', 600: '#6B6961', 700: '#525049', 800: '#393833', 900: '#22221F' },
        ground: '#FCFBF8',
        band: '#F1EFE8',
        ink: { DEFAULT: '#33384F', quiet: '#4F546B' },
        rule: '#E2E1DE',
        night: { DEFAULT: '#0B1528', ink: '#F1EFE8', link: '#B7CEC1' },
        leaf: { DEFAULT: '#7FA182', light: '#9FBF98' },
        epc: { a: '#008054', b: '#19B459', c: '#8DCE46', d: '#FFD500', e: '#FCAA65', f: '#EF8023', g: '#E9153B' },
        // Brand navy, derived from the logo wordmark (#182848)
        primary: {
          50: '#F2F5FA',
          100: '#E1E9F4',
          200: '#C4D2E8',
          300: '#9BB2D4',
          400: '#6C8CBC',
          500: '#48699F',
          600: '#33507F',
          700: '#263E64',
          800: '#1D3050',
          900: '#182848',
          950: '#0D1729',
        },
        secondary: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
        // Brand green — elegant muted sage (#47846E), echoes the logo leaf
        accent: {
          50: '#F1F7F4',
          100: '#DDEBE4',
          200: '#BED8CC',
          300: '#95BFAD',
          400: '#6CA28C',
          500: '#47846E',
          600: '#386B59',
          700: '#2F5749',
          800: '#28463C',
          900: '#223A32',
          950: '#11221D',
        },
        // Warm tertiary (former brand orange) — use sparingly: cautionary
        // notes, fines/warnings, and future heating/electrical services
        warm: {
          50: '#FEF5EE',
          100: '#FDE7D4',
          200: '#FACDAA',
          400: '#F5923F',
          500: '#EF7A28',
          600: '#DC6314',
          700: '#B64F10',
          800: '#93400F',
        },
        success: '#386B59',
        warning: '#F59E0B',
        danger: '#EF4444',
        // Clean canvas — crisp near-white page, light grey for muted bands
        // The page ground, now the redesign's stone 50 so the header and every page share one paper.
        canvas: '#FCFBF8',
        sand: '#F1F3F6',
        // Dark brand band (footer, HowItWorks) — deep navy, was forest green
        forest: {
          900: '#091324',
          800: '#0D1B33',
          700: '#142644',
          accent: '#6CA28C',
        },
      },
      fontFamily: {
        // Brand fonts, self-hosted from app/fonts by next/font/local (app/layout.tsx).
        sans: ['var(--font-sans)', 'Futura', '"Century Gothic"', 'system-ui', 'sans-serif'],
        display: ['var(--font-sans)', 'Futura', '"Century Gothic"', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', '"Times New Roman"', 'serif'],
      },
      // The prototype's type scale (tokens.css): serif 400 throughout, Jost for text and labels.
      fontSize: {
        display: ['64px', { lineHeight: '1.04', letterSpacing: '-0.015em' }],
        heading: ['46px', { lineHeight: '1.08', letterSpacing: '-0.01em' }],
        subheading: ['30px', { lineHeight: '1.18' }],
        price: ['44px', { lineHeight: '1' }],
        body: ['18px', { lineHeight: '1.6' }],
        small: ['15px', { lineHeight: '1.5' }],
        label: ['12px', { lineHeight: '1.4', letterSpacing: '0.16em' }],
      },
      spacing: {
        head: 'var(--head-h)',
        'section-sm': '64px',
        section: '112px',
      },
      borderRadius: {
        btn: '6px',
        card: '12px',
      },
      maxWidth: {
        container: '80rem',
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out both',
        'fade-in': 'fadeIn 0.4s ease-out both',
      },
    },
  },
  plugins: [],
}

export default config
