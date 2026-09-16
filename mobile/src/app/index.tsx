import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/auth';

export default function Index() {
  const { user } = useAuthStore();

  if (user) {
    switch (user.role) {
      case 'NURSE':
        return <Redirect href="/(nurse)/(tabs)/home" />;
      case 'DOCTOR':
        return <Redirect href="/(doctor)/(tabs)/home" />;
      case 'ADMIN':
        return <Redirect href="/admin" />;
      default:
        return <Redirect href="/(patient)/(tabs)/home" />;
    }
  }

  return <Redirect href="/auth/login" />;
}
