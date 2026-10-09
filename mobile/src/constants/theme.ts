/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';
import { THEMES } from '../theme';

export const Colors = {
  light: {
    text: THEMES['minimal-clean'].colors.textDark,
    background: THEMES['minimal-clean'].colors.surface,
    backgroundElement: THEMES['minimal-clean'].colors.surfaceCard,
    backgroundSelected: THEMES['minimal-clean'].colors.surfaceMuted,
    textSecondary: THEMES['minimal-clean'].colors.textBody,
  },
  dark: {
    text: THEMES['dark-futuristic'].colors.textDark,
    background: THEMES['dark-futuristic'].colors.surface,
    backgroundElement: THEMES['dark-futuristic'].colors.surfaceCard,
    backgroundSelected: THEMES['dark-futuristic'].colors.surfaceMuted,
    textSecondary: THEMES['dark-futuristic'].colors.textBody,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
