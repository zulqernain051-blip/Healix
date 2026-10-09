


import { Text, Button } from 'react-native-paper';
import Constants from 'expo-constants';
import { WorkflowPage, useFlowStyles } from '../../../components/common/WorkflowPage';
import { navigate } from '../../../utils/navigation';
import { AppearanceSettings } from '../../../components/common/AppearanceSettings';
export default function SettingsScreen() {
  const s = useFlowStyles();

  return <WorkflowPage title="Account Settings"><Text style={s.title}>Account & security</Text><Button onPress={() => navigate('/auth/security')}>Two-step verification</Button><Button mode="contained" onPress={() => navigate('/auth/change-password')}>Change password</Button><Button onPress={() => navigate('/(patient)/profile/edit')}>Edit personal information</Button><Button onPress={() => navigate('/(patient)/profile/emergency-contacts')}>Emergency contacts</Button><Button onPress={() => navigate('/(patient)/notifications')}>Notification inbox</Button><Text style={s.body}>Language: English.</Text><AppearanceSettings /><Text style={s.title}>Using Healix</Text><Text style={s.body}>Use Requests to book care and compare nurse offers. Use Records and Health to review visits, prescribed medication and care plans. Messages connects you to an eligible care team.</Text><Text style={s.body}>Use Emergency Transport to follow an existing escalation. For an immediate emergency, call your local emergency service.</Text><Text style={s.title}>Privacy</Text><Text style={s.body}>Your care records are available to authorized care participants. Sign out on shared devices and keep your password private.</Text><Text style={s.body}>Healix {Constants.expoConfig?.version || '1.0.0'}</Text></WorkflowPage>;
}
