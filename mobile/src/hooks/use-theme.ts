/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useAppTheme } from '@/theme/ThemeProvider';

export function useTheme() {
  const { colors } = useAppTheme();
  return { text: colors.textDark, background: colors.surface, backgroundElement: colors.surfaceCard, backgroundSelected: colors.surfaceMuted, textSecondary: colors.textBody };
}
