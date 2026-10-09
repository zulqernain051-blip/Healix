import { AppThemeProvider, useAppTheme, usePaperTheme } from '../theme/ThemeProvider';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '../store/auth';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { AppDialogs } from '../components/common/AppDialogs';
import { getAuthRedirect } from '../utils/authRouting';

export default function RootLayout() {
  return <AppThemeProvider><ThemedRootLayout /></AppThemeProvider>;
}

function ThemedRootLayout() {
  const { colors: COLORS, dark, ready } = useAppTheme();
  const paperTheme = usePaperTheme();

  const { user, isInitializing, loadUser } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const redirect = isInitializing ? null : getAuthRedirect(user?.role, segments, user?.status);
  useEffect(() => { void loadUser(); }, [loadUser]);
  useEffect(() => { void SystemUI.setBackgroundColorAsync(COLORS.bg).catch(() => {}); }, [COLORS.bg]);
  useEffect(() => { if (redirect) router.replace(redirect as any); }, [redirect, router]);
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={paperTheme}>
        <StatusBar style={dark ? 'light' : 'dark'} />
        <Slot />
        <AppDialogs />
        {(!ready || isInitializing || redirect) && (
          <View pointerEvents="auto" style={{ position: 'absolute', inset: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg }}>
            <ActivityIndicator size="large" color={COLORS.primaryText} />
          </View>
        )}
      </PaperProvider>
    </QueryClientProvider>
  );
}
