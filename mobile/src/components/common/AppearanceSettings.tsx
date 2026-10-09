import { View } from 'react-native';
import { RadioButton, Text } from 'react-native-paper';
import { THEMES, ThemeId } from '../../theme';
import { useAppTheme } from '../../theme/ThemeProvider';
import { useFlowStyles } from './WorkflowPage';

export function AppearanceSettings() {
  const { themeId, setTheme, persistenceError } = useAppTheme();
  const s = useFlowStyles();
  return <View style={s.card}>
    <Text style={s.title}>Appearance</Text>
    <RadioButton.Group value={themeId} onValueChange={id => { void setTheme(id as ThemeId); }}>
      {Object.entries(THEMES).map(([id, theme]) => <RadioButton.Item key={id} value={id} label={theme.name} labelStyle={s.body} />)}
    </RadioButton.Group>
    {persistenceError && <Text style={s.body} accessibilityRole="alert">{persistenceError}</Text>}
  </View>;
}
