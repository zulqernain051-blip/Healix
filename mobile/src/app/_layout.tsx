import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '../store/auth';
import { Provider as PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { COLORS } from '../theme';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { AppDialogs } from '../components/common/AppDialogs';
import { getAuthRedirect } from '../utils/authRouting';

export default function RootLayout() {
  const { user, isInitializing, loadUser } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const redirect = isInitializing ? null : getAuthRedirect(user?.role, segments, user?.status);
  useEffect(() => { void loadUser(); }, [loadUser]);
  useEffect(() => { if (redirect) router.replace(redirect as any); }, [redirect, router]);
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={MD3DarkTheme}>
        <Slot />
        <AppDialogs />
        {(isInitializing || redirect) && (
          <View pointerEvents="auto" style={{ position: 'absolute', inset: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg }}>
            <ActivityIndicator size="large" color={COLORS.navy} />
          </View>
        )}
      </PaperProvider>
    </QueryClientProvider>
  );
}
