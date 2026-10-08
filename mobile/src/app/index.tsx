import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/auth';
import { getDashboardRoute } from '../utils/authRouting';
export default function Index() {
  const { user, isInitializing } = useAuthStore();
  if (isInitializing) return null;
  return <Redirect href={(user ? getDashboardRoute(user.role) : '/auth/login') as any} />;
}
