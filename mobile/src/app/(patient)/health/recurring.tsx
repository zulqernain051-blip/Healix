import { Redirect } from 'expo-router';
export default function RecurringVisitSetupScreen() {
  return <Redirect href={{ pathname: '/(patient)/requests/new', params: { scheduleType: 'RECURRING' } }} />;
}
