import { PropsWithChildren } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Appbar, Text, Button, ActivityIndicator, PaperProvider } from 'react-native-paper';
import { goBack } from '../../utils/navigation';
import { ThemeColors, SPACING, RADIUS, TYPOGRAPHY } from '../../theme';
import { useAppTheme, usePaperTheme, useThemeValue } from '../../theme/ThemeProvider';
export const useWorkflowTheme = usePaperTheme;
export function WorkflowPage({ title, children, loading, error, retry }: PropsWithChildren<{ title: string; loading?: boolean; error?: string; retry?: () => void }>) {
  const { colors: COLORS } = useAppTheme();
  const flowStyles = useFlowStyles();
  const workflowTheme = useWorkflowTheme();
  return <PaperProvider theme={workflowTheme}><SafeAreaView style={flowStyles.page}><Appbar.Header style={{ backgroundColor: COLORS.surfaceCard }}><Appbar.BackAction onPress={goBack} /><Appbar.Content title={title} /></Appbar.Header><ScrollView contentContainerStyle={flowStyles.content}>{loading && <ActivityIndicator color={COLORS.primaryText} />}{error && <View><Text style={{ color: COLORS.red }} accessibilityRole="alert">{error}</Text>{retry && <Button onPress={retry}>Retry</Button>}</View>}{children}</ScrollView></SafeAreaView></PaperProvider>;
}
const createFlowStyles = (COLORS: ThemeColors) => StyleSheet.create({ page: { flex: 1, backgroundColor: COLORS.surface }, content: { padding: SPACING.lg, gap: SPACING.lg, paddingBottom: SPACING.xxxl }, card: { backgroundColor: COLORS.surfaceCard, padding: SPACING.lg, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.inputBorder, gap: SPACING.sm }, title: { color: COLORS.textDark, fontSize: TYPOGRAPHY.sizes.lg, fontWeight: TYPOGRAPHY.weights.bold }, body: { color: COLORS.textBody }, input: { backgroundColor: COLORS.surfaceCard }, row: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm } });
export function useFlowStyles() { return useThemeValue(createFlowStyles); }
