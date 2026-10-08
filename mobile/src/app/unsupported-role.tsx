import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useLogout } from '../hooks/useAuth';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme';
export default function UnsupportedRoleScreen() {
  const logout = useLogout();
  return <View style={styles.container}>
    <Text style={styles.title}>Mobile access unavailable</Text>
    <Text style={styles.body}>This account role does not yet have a mobile workspace. Please contact your administrator for access to your work tools.</Text>
    <Button mode="contained" buttonColor={COLORS.navy} loading={logout.isPending} disabled={logout.isPending} onPress={() => logout.mutate()}>Sign out</Button>
  </View>;
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: SPACING.xxl, gap: SPACING.lg, backgroundColor: COLORS.surface },
  title: { color: COLORS.textDark, fontSize: TYPOGRAPHY.sizes.xl, fontWeight: TYPOGRAPHY.weights.bold },
  body: { color: COLORS.textBody, fontSize: TYPOGRAPHY.sizes.md },
});
