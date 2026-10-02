/**
 * Solace+ Design Tokens
 * Calming, therapeutic, accessible color palette and typography constants.
 */

export const colors = {
  // Brand / Core
  primary: {
    50: '#f0f7f7',
    100: '#d9eded',
    200: '#b3dbdc',
    300: '#83c2c4',
    400: '#54a3a6',
    500: '#38878a', // Primary Teal
    600: '#2c6c6f',
    700: '#26575a',
    800: '#224749',
    900: '#1f3c3e',
  },
  // Calming Soft Lavender / Sage accents
  accent: {
    sage: '#e2ece9',
    lavender: '#efeaf6',
    warmGold: '#fdf6e2',
  },
  // Clinical / Crisis Alert Colors (WCAG AAA compliant contrast)
  crisis: {
    light: '#fdf2f2',
    border: '#f8b4b4',
    text: '#981b1b',
    button: '#dc2626',
    buttonHover: '#b91c1c',
  },
  // Neutral Slate scale (Dark / Light support)
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
} as const;

export const typography = {
  fontFamily: {
    sans: 'var(--font-sans, "Plus Jakarta Sans", "Inter", system-ui, sans-serif)',
    heading: 'var(--font-heading, "Outfit", "Plus Jakarta Sans", system-ui, sans-serif)',
    mono: 'monospace',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
} as const;

export const spacing = {
  containerMax: '1280px',
  headerHeight: '4rem',
  sidebarWidth: '16rem',
} as const;

export const motion = {
  transitionFast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  transitionNormal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
  transitionSlow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
} as const;
