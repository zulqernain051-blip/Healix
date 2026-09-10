import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

interface RequestCardProps {
  title: string;
  type: string;
  scheduledAt: string;
  status: string;
  onPress: () => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({
  title,
  type,
  scheduledAt,
  status,
  onPress,
}) => {
  const renderBadge = () => {
    switch (status) {
      case 'ASSIGNED':
        return (
          <View style={[styles.badge, { backgroundColor: 'rgba(0, 230, 118, 0.12)', borderColor: '#00E676' }]}>
            <Text style={[styles.badgeText, { color: '#00E676' }]}>Assigned</Text>
          </View>
        );
      case 'IN_PROGRESS':
        return (
          <View style={[styles.badge, { backgroundColor: 'rgba(245, 158, 11, 0.12)', borderColor: '#F59E0B' }]}>
            <Text style={[styles.badgeText, { color: '#F59E0B' }]}>In Progress</Text>
          </View>
        );
      case 'COMPLETED':
        return (
          <View style={[styles.badge, { backgroundColor: 'rgba(13, 148, 136, 0.15)', borderColor: '#0D9488' }]}>
            <Text style={[styles.badgeText, { color: '#0D9488' }]}>Completed</Text>
          </View>
        );
      case 'CANCELLED':
        return (
          <View style={[styles.badge, { backgroundColor: 'rgba(239, 68, 68, 0.12)', borderColor: '#EF4444' }]}>
            <Text style={[styles.badgeText, { color: '#EF4444' }]}>Cancelled</Text>
          </View>
        );
      default:
        return (
          <View style={[styles.badge, { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: '#94A3B8' }]}>
            <Text style={[styles.badgeText, { color: '#94A3B8' }]}>{status}</Text>
          </View>
        );
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={styles.iconBg}>
          <Text style={styles.iconText}>🩺</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.reqId}>{title}</Text>
          <Text style={styles.reqType}>{type}</Text>
          <Text style={styles.reqDate}>{scheduledAt}</Text>
        </View>
        {renderBadge()}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0A2D28',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.15)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBg: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 230, 118, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  iconText: {
    fontSize: 20,
  },
  info: {
    flex: 1,
  },
  reqId: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '700',
  },
  reqType: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  reqDate: {
    color: '#6B8E8A',
    fontSize: 10,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.round,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
