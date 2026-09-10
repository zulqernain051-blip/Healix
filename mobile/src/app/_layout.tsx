import { Slot, useSegments } from 'expo-router';
import { navigate } from '../utils/navigation';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '../store/auth';
import { Provider as PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { COLORS } from '../theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Root Layout for the Expo Router.
 * Boots the user session state, and redirects routes dynamically based on roles.
 */
export default function RootLayout() {
  const { user, isInitializing, loadUser } = useAuthStore();
  const segments = useSegments();
  

  // Load session on startup
  useEffect(() => {
    loadUser();
  }, []);

  // Role-based dashboard routing
  const getDashboardRoute = (role: string): string => {
    switch (role) {
      case 'NURSE':   return '/(nurse)/home';  
      case 'DOCTOR':  return '/(doctor)/home'; 
      case 'ADMIN':   return '/admin';
      default:        return '/(patient)/home'; 
    }
  };

  // Handle routing redirects when auth state changes
  useEffect(() => {
    if (isInitializing) return;

    const seg0 = segments[0] as string;
    const inAuthGroup = seg0 === 'auth';
    const inNurseGroup = seg0 === 'nurse' || seg0 === '(nurse)';
    const inDoctorGroup = seg0 === 'doctor' || seg0 === '(doctor)';
    const inAdminGroup = seg0 === 'admin';
    const inPatientGroup = seg0 === '(patient)';

    if (!user && !inAuthGroup) {
      navigate('/auth/login');
    } else if (user && inAuthGroup) {
      // Redirect to correct dashboard after login
      navigate(getDashboardRoute(user.role) as any);
    } else if (user) {
      // Block cross-role access
      if (inNurseGroup && user.role !== 'NURSE' && user.role !== 'ADMIN') {
        navigate(getDashboardRoute(user.role) as any);
      } else if (inDoctorGroup && user.role !== 'DOCTOR' && user.role !== 'ADMIN') {
        navigate(getDashboardRoute(user.role) as any);
      } else if (inPatientGroup && user.role !== 'PATIENT' && user.role !== 'ADMIN') {
        navigate(getDashboardRoute(user.role) as any);
      }
    }
  }, [user, isInitializing, segments]);

  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg }}>
        <ActivityIndicator size="large" color={COLORS.teal} />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={MD3DarkTheme}>
        <Slot />
      </PaperProvider>
    </QueryClientProvider>
  );
}
