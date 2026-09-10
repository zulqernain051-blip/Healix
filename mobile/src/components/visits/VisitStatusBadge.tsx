import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { VisitStatus } from '../../types/visit';

interface VisitStatusBadgeProps {
  status: VisitStatus;
}

const STATUS_CONFIG: Record<VisitStatus, { label: string; color: string; bg: string }> = {
  SCHEDULED: { label: 'Scheduled', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  ACCEPTED: { label: 'Accepted', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  IN_PROGRESS: { label: 'In Progress', color: '#00E676', bg: 'rgba(0,230,118,0.12)' },
  COMPLETED: { label: 'Completed', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  DECLINED: { label: 'Declined', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
};

export const VisitStatusBadge: React.FC<VisitStatusBadgeProps> = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.SCHEDULED;
  return (
    <View style={[styles.badge, { backgroundColor: config.bg, borderColor: config.color }]}>
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
  },
});
