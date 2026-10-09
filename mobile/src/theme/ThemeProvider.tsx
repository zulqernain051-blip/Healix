import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { THEMES, ThemeColors, ThemeId, isThemeId } from '../theme';
import { secureStorage } from '../utils/secureStorage';

export const THEME_STORAGE_KEY = 'healix.appearance';
type ThemeContextValue = {
  themeId: ThemeId;
  colors: ThemeColors;
  dark: boolean;
  ready: boolean;
  persistenceError: string | null;
  setTheme: (id: ThemeId) => Promise<void>;
};
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const [themeId, setThemeId] = useState<ThemeId>('minimal-clean');
  const [ready, setReady] = useState(false);
  const [persistenceError, setPersistenceError] = useState<string | null>(null);
  const version = useRef(0);
  const writes = useRef<Promise<void>>(Promise.resolve());
  useEffect(() => {
    let mounted = true;
    const initialVersion = version.current;
    void secureStorage.getItemAsync(THEME_STORAGE_KEY).then(saved => {
      if (mounted && version.current === initialVersion && isThemeId(saved)) setThemeId(saved);
    }).catch(() => {
      if (mounted) setPersistenceError('Could not load your saved theme. You can choose it again below.');
    }).finally(() => { if (mounted) setReady(true); });
    return () => { mounted = false; };
  }, []);
  const value = useMemo<ThemeContextValue>(() => ({
    themeId, colors: THEMES[themeId].colors, dark: THEMES[themeId].dark, ready, persistenceError,
    setTheme: async id => {
      if (!isThemeId(id)) return;
      const selection = ++version.current;
      setThemeId(id);
      setPersistenceError(null);
      // Serialize writes so a slower earlier selection cannot overwrite the latest one.
      const write = writes.current.catch(() => {}).then(() => secureStorage.setItemAsync(THEME_STORAGE_KEY, id));
      writes.current = write;
      try { await write; } catch {
        if (version.current === selection) setPersistenceError('Theme applied, but could not be saved. Select it again to retry.');
      }
    },
  }), [themeId, ready, persistenceError]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useAppTheme must be used within AppThemeProvider');
  return value;
}

/** Recompute color-dependent styles/maps without changing component state or layout. */
export function useThemeValue<T>(factory: (colors: ThemeColors) => T): T {
  const { colors } = useAppTheme();
  return useMemo(() => factory(colors), [factory, colors]);
}

export function usePaperTheme() {
  const { colors: c, dark } = useAppTheme();
  return useMemo(() => {
    const base = dark ? MD3DarkTheme : MD3LightTheme;
    return { ...base, colors: { ...base.colors,
      primary: c.primaryText, onPrimary: dark ? c.bg : c.onAccent, primaryContainer: c.blueLight, onPrimaryContainer: c.primaryText,
      secondary: c.iconPurple, onSecondary: dark ? c.bg : c.onAccent, secondaryContainer: c.quickPurple, onSecondaryContainer: c.iconPurple,
      tertiary: c.teal, onTertiary: dark ? c.bg : c.onAccent, tertiaryContainer: c.tealLight, onTertiaryContainer: c.teal,
      background: c.surface, onBackground: c.textDark, surface: c.surfaceCard, onSurface: c.textDark,
      surfaceVariant: c.surfaceMuted, onSurfaceVariant: c.textBody, surfaceDisabled: c.surfaceMuted, onSurfaceDisabled: c.textMuted,
      outline: c.inputBorder, outlineVariant: c.dividerLight, error: c.red, onError: c.onAccent,
      errorContainer: c.redLight, onErrorContainer: c.red, inverseSurface: dark ? '#F4FAFF' : '#082139',
      inverseOnSurface: dark ? '#082139' : '#F4FAFF', inversePrimary: dark ? '#006BD6' : '#62CEFF',
      backdrop: c.modalBackdrop, elevation: { level0: 'transparent', level1: c.surfaceCard, level2: c.cardElevated, level3: c.cardElevated, level4: c.cardElevated, level5: c.cardElevated },
    } };
  }, [c, dark]);
}
