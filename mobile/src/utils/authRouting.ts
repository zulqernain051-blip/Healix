export function getDashboardRoute(role: string): string {
  switch (role) {
    case 'PATIENT': return '/(patient)/(tabs)/home';
    case 'NURSE': return '/(nurse)/(tabs)/home';
    case 'DOCTOR': return '/(doctor)/(tabs)/home';
    case 'ADMIN': return '/admin';
    case 'PARAMEDIC': return '/(paramedic)';
    default: return '/unsupported-role';
  }
}

export function getAuthRedirect(role: string | undefined, segments: readonly string[], status?: string): string | null {
  const [group, page] = segments;
  if (!role) return group === 'auth' ? null : '/auth/login';
  if (role === 'NURSE' && status === 'PENDING_VERIFICATION') {
    return (group === '(nurse)' && ((segments[1] === 'profile' && segments[2] === 'verification') || (segments[1] === '(tabs)' && segments[2] === 'profile'))) ? null : '/(nurse)/profile/verification';
  }
  const dashboard = getDashboardRoute(role);
  if (group === 'auth') return ['change-password', 'security'].includes(page) ? null : dashboard;
  const requiredRole: Record<string, string> = { '(patient)': 'PATIENT', '(nurse)': 'NURSE', '(doctor)': 'DOCTOR', '(paramedic)': 'PARAMEDIC', admin: 'ADMIN' };
  if (requiredRole[group] && role !== requiredRole[group]) return dashboard;
  if (group === 'unsupported-role' && dashboard !== '/unsupported-role') return dashboard;
  return null;
}
