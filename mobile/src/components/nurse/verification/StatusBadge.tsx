import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { DocStatus } from './types';
import { PALETTE } from './constants';

interface StatusBadgeProps {
  status: DocStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config: Record<DocStatus, { label: string; bg: string; color: string; icon: string }> = {
    NOT_SUBMITTED: { label: 'Not Submitted', bg: PALETTE.grey + '22', color: PALETTE.grey, icon: '?' },
    PENDING: { label: 'Pending', bg: PALETTE.amber + '22', color: PALETTE.amber, icon: '?' },
    APPROVED: { label: 'Approved', bg: PALETTE.emerald + '22', color: PALETTE.emerald, icon: '?' },
    REJECTED: { label: 'Rejected', bg: PALETTE.red + '22', color: PALETTE.red, icon: '?' },
  };
  const c = config[status];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeIcon, { color: c.color }]}>{c.icon}</Text>
      <Text style={[styles.badgeText, { color: c.color }]}>{c.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  badgeIcon: {
    fontSize: 10,
    marginRight: 4,
    fontWeight: '800',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
