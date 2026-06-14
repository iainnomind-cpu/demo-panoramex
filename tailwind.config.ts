import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Base surfaces
        'background': '#fbf8fd',
        'surface': '#fbf8fd',
        'surface-dim': '#dbd9de',
        'surface-bright': '#fbf8fd',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f5f3f8',
        'surface-container': '#efedf2',
        'surface-container-high': '#e9e7ec',
        'surface-container-highest': '#e4e2e6',
        'surface-variant': '#e4e2e6',
        // Text / On
        'on-surface': '#1b1b1f',
        'on-surface-variant': '#45464f',
        'on-background': '#1b1b1f',
        'on-primary': '#ffffff',
        'on-secondary': '#ffffff',
        'on-tertiary': '#ffffff',
        'on-error': '#ffffff',
        // Primary (Navy)
        'primary': '#021848',
        'primary-container': '#1c2e5e',
        'primary-fixed': '#dbe1ff',
        'primary-fixed-dim': '#b4c5fe',
        'on-primary-container': '#8697cd',
        'on-primary-fixed': '#021848',
        'on-primary-fixed-variant': '#344576',
        'inverse-primary': '#b4c5fe',
        // Secondary (Coral/Red)
        'secondary': '#b6231b',
        'secondary-container': '#fd5747',
        'secondary-fixed': '#ffdad5',
        'secondary-fixed-dim': '#ffb4a9',
        'on-secondary-container': '#5c0002',
        'on-secondary-fixed': '#410001',
        'on-secondary-fixed-variant': '#930105',
        // Tertiary
        'tertiary': '#410004',
        'tertiary-container': '#69000b',
        'tertiary-fixed': '#ffdad7',
        'tertiary-fixed-dim': '#ffb3ae',
        'on-tertiary-container': '#ff6661',
        'on-tertiary-fixed': '#410004',
        'on-tertiary-fixed-variant': '#920215',
        // Error
        'error': '#ba1a1a',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',
        // Outline
        'outline': '#757680',
        'outline-variant': '#c5c6d0',
        // Inverse
        'inverse-surface': '#303034',
        'inverse-on-surface': '#f2f0f5',
        // Surface tint
        'surface-tint': '#4c5c8f',
        // Panoramex custom
        'bg-base': '#F7F8FA',
        'bg-surface-alt': '#F0F2F6',
        'bg-navy-deep': '#0F1D40',
        'bg-navy-soft': '#E8EDF8',
        // Semáforo de prospectos
        'status-qualified': '#16A34A',
        'status-process': '#D97706',
        'status-no-response': '#DC2626',
        'status-new': '#6B7280',
        'status-confirmed': '#2563EB',
        'status-converted': '#0D9488',
        // Coral brand
        'coral': '#E8483A',
        'coral-hover': '#C73D30',
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        full: '9999px',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        xxl: '32px',
        giant: '48px',
      },
      fontFamily: {
        'display': ['"Plus Jakarta Sans"', 'sans-serif'],
        'display-xl': ['"Plus Jakarta Sans"', 'sans-serif'],
        'display-lg': ['"Plus Jakarta Sans"', 'sans-serif'],
        'headline-h1': ['"Plus Jakarta Sans"', 'sans-serif'],
        'headline-h2': ['"Plus Jakarta Sans"', 'sans-serif'],
        'headline-h3': ['"Plus Jakarta Sans"', 'sans-serif'],
        'label-caps': ['"Plus Jakarta Sans"', 'sans-serif'],
        'body-lg': ['Inter', 'sans-serif'],
        'body-md': ['Inter', 'sans-serif'],
        'mono': ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'display-xl': ['48px', { lineHeight: '52.8px', fontWeight: '800' }],
        'display-lg': ['36px', { lineHeight: '43.2px', fontWeight: '700' }],
        'headline-h1': ['30px', { lineHeight: '39px', fontWeight: '700' }],
        'headline-h2': ['24px', { lineHeight: '33.6px', fontWeight: '600' }],
        'headline-h3': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '25.6px', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '22.4px', fontWeight: '400' }],
        'label-caps': ['12px', { lineHeight: '16.8px', letterSpacing: '0.05em', fontWeight: '700' }],
        'mono': ['13px', { lineHeight: '19.5px', fontWeight: '400' }],
      },
      keyframes: {
        'modal-enter': {
          from: { opacity: '0', transform: 'scale(0.96) translateY(8px)' },
          to: { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'toast-slide': {
          from: { opacity: '0', transform: 'translateX(100%)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-once': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
        },
      },
      animation: {
        'modal-enter': 'modal-enter 200ms ease-out',
        'toast-slide': 'toast-slide 200ms ease-out',
        shimmer: 'shimmer 1.4s infinite linear',
        'pulse-once': 'pulse-once 300ms ease',
      },
    },
  },
  plugins: [],
}

export default config
