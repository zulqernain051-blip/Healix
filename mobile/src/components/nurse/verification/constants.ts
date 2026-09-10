import { CheckItem } from './types';

export const PALETTE = {
  bg: '#0A1628',
  surface: '#111C2E',
  card: '#162032',
  border: '#1E2D45',
  teal: '#0D9488',
  emerald: '#10B981',
  amber: '#F59E0B',
  blue: '#3B82F6',
  red: '#EF4444',
  grey: '#6B7280',
  white: '#F1F5F9',
  muted: '#94A3B8',
  overlay: 'rgba(0,0,0,0.75)',
};

export const CHECK_ITEMS: CheckItem[] = [
  { key: 'CNIC_FRONT', label: 'CNIC – Front Side', icon: '🪪' },
  { key: 'CNIC_BACK', label: 'CNIC – Back Side', icon: '🪪' },
  { key: 'NURSE_LICENSE', label: 'Nurse License', icon: '📋' },
  { key: 'DEGREE', label: 'Degree Certificate', icon: '🎓' },
  { key: 'BACKGROUND_CHECK', label: 'Background Check', icon: '🔍' },
];
