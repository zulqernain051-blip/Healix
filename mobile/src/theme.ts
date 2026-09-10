import { Platform } from 'react-native';

export const COLORS = {
  // 90% Neutral Base (Obsidian, deep slates, clean subtle borders)
  bg: '#030712',            // Deepest Obsidian Black
  card: '#0B1527',          // Night Slate for main elements
  cardElevated: '#112239',  // Slightly lighter slate for layered dialogs/active headers
  border: 'rgba(255, 255, 255, 0.06)',     // Subtle border line
  borderActive: 'rgba(255, 255, 255, 0.12)', // Active element boundaries
  textPrimary: '#F9FAFB',   // Off-white high visibility text
  textSecondary: '#9CA3AF', // Gray for labels and descriptions
  textMuted: '#6B7280',     // Dark gray for placeholders and help texts

  // 8% Primary & Action Branding
  teal: '#0D9488',          // Clinical Teal (Brand theme)
  tealLight: 'rgba(13, 148, 136, 0.15)',
  tealDark: '#065F56',      // Darker teal for headers/overlays
  blue: '#2563EB',          // Electric Blue for navigation and main interactions
  blueLight: 'rgba(37, 99, 235, 0.15)',
  emerald: '#10B981',        // Success states, approved badges
  emeraldLight: 'rgba(16, 185, 129, 0.12)',

  // 2% Emergency & Warnings
  red: '#EF4444',           // Critical alert red (SOS calls)
  redLight: 'rgba(239, 68, 68, 0.15)',
  amber: '#F59E0B',         // Warning/pending alerts
  amberLight: 'rgba(245, 158, 11, 0.12)',

  // Surfaces & Inputs (Design language adoption)
  surface: '#F8FAFC',       // Light surface for white-body areas
  surfaceCard: '#FFFFFF',   // Pure white cards
  surfaceMuted: '#F1F5F9',  // Muted surface for input backgrounds
  inputBorder: '#E2E8F0',   // Subtle input border
  textDark: '#1E293B',      // Dark text on light surfaces
  textDarkSecondary: '#64748B', // Secondary text on light surfaces
  dividerLight: '#E2E8F0',  // Divider on light backgrounds
  headerBg: '#0A3D3F',      // Header background (deep teal)
  headerText: '#FFFFFF',    // White text on headers
  successBg: 'rgba(16, 185, 129, 0.08)', // Subtle success background

  // Aliases for standardized components
  primary: '#0D9488',
  background: '#030712',
  text: '#F9FAFB',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
};

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

export const TYPOGRAPHY = {
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  // Aliases for standardized components
  h1: { fontSize: 28, fontWeight: '800' as const },
  h2: { fontSize: 22, fontWeight: '700' as const },
  h3: { fontSize: 18, fontWeight: '600' as const },
  bodyMedium: { fontSize: 15, fontWeight: '400' as const },
  bodySmall: { fontSize: 13, fontWeight: '400' as const },
};

export const MOTION = {
  curves: {
    easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
    springPreset: {
      tension: 135,
      friction: 14,
    },
  },
};

export const ACCESSIBILITY = {
  minTouchTarget: 48,
  screenReaderLabel: (label: string, hint?: string) => ({
    accessible: true,
    accessibilityLabel: label,
    accessibilityHint: hint,
  }),
};
