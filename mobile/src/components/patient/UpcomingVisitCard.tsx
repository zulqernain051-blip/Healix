import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

interface UpcomingVisitCardProps {
  staffName?: string;
  scheduledAt?: string;
  status?: string;
  onPress: () => void;
  onSeeAllPress: () => void;
}

export const UpcomingVisitCard: React.FC<UpcomingVisitCardProps> = ({
  staffName,
  scheduledAt,
  status = 'Scheduled',
  onPress,
  onSeeAllPress,
}) => {
  const hasVisit = Boolean(staffName && staffName !== 'Assigned Staff' && scheduledAt && scheduledAt !== 'No upcoming visit');

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Upcoming Visit</Text>
        <TouchableOpacity onPress={onSeeAllPress}>
          <Text style={styles.seeAllText}>››</Text>
        </TouchableOpacity>
      </View>

      {hasVisit ? (
        <TouchableOpacity
          style={styles.upcomingCard}
          onPress={onPress}
          activeOpacity={0.85}
        >
          <View style={styles.nurseInfoRow}>
            <Avatar.Icon size={44} icon="account-heart" style={styles.nurseAvatarBg} color="#00E676" />
            <View style={styles.nurseTextWrap}>
              <Text style={styles.nurseName}>{staffName}</Text>
              <Text style={styles.nurseTime}>{scheduledAt}</Text>
            </View>
            <View style={styles.confirmedBadge}>
              <Text style={styles.confirmedText}>{status}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.emptyCard}
          onPress={onSeeAllPress}
          activeOpacity={0.85}
        >
          <Text style={styles.emptyIcon}>📅</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.emptyTitle}>No Upcoming Visits</Text>
            <Text style={styles.emptySub}>You have no scheduled care visits right now.</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
  },
  seeAllText: {
    color: '#00E676',
    fontSize: 16,
    fontWeight: '700',
  },
  upcomingCard: {
    backgroundColor: '#0A2D28',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.2)',
  },
  nurseInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nurseAvatarBg: {
    backgroundColor: '#051815',
  },
  nurseTextWrap: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  nurseName: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
  },
  nurseTime: {
    color: '#94A3B8',
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
  },
  confirmedBadge: {
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.round,
  },
  confirmedText: {
    color: '#00E676',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#0A2D28',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.15)',
  },
  emptyIcon: {
    fontSize: 24,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
  },
  emptySub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
});
