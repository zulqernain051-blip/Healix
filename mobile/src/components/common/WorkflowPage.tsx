import { PropsWithChildren } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Appbar, Text, Button, ActivityIndicator, PaperProvider, MD3LightTheme } from 'react-native-paper';
import { goBack } from '../../utils/navigation';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../theme';
export const workflowTheme = { ...MD3LightTheme, colors: { ...MD3LightTheme.colors, primary: COLORS.navy, background: COLORS.surface, surface: COLORS.surfaceCard, surfaceVariant: COLORS.surfaceCard, outline: COLORS.inputBorder, onSurface: COLORS.textDark, onSurfaceVariant: COLORS.textBody } };
export function WorkflowPage({ title, children, loading, error, retry }: PropsWithChildren<{ title: string; loading?: boolean; error?: string; retry?: () => void }>) {
  return <PaperProvider theme={workflowTheme}><SafeAreaView style={flowStyles.page}><Appbar.Header style={{ backgroundColor: COLORS.surfaceCard }}><Appbar.BackAction onPress={goBack} /><Appbar.Content title={title} /></Appbar.Header><ScrollView contentContainerStyle={flowStyles.content}>{loading && <ActivityIndicator color={COLORS.navy} />}{error && <View><Text style={{ color: COLORS.red }} accessibilityRole="alert">{error}</Text>{retry && <Button onPress={retry}>Retry</Button>}</View>}{children}</ScrollView></SafeAreaView></PaperProvider>;
}
export const flowStyles = StyleSheet.create({ page: { flex: 1, backgroundColor: COLORS.surface }, content: { padding: SPACING.lg, gap: SPACING.lg, paddingBottom: SPACING.xxxl }, card: { backgroundColor: COLORS.surfaceCard, padding: SPACING.lg, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.inputBorder, gap: SPACING.sm }, title: { color: COLORS.textDark, fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold }, body: { color: COLORS.textBody }, input: { backgroundColor: COLORS.surfaceCard }, row: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm } });
