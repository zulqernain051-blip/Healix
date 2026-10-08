import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

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

  const staffInitials = staffName
    ? staffName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'DR';

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <View style={styles.titleRow}>
            <Ionicons name="calendar" size={16} color={COLORS.accentBlue} />
            <Text style={styles.sparkle}>{' '}✨</Text>
            <Text style={styles.title}> Your Next Care Visit</Text>
          </View>
        </View>

        {hasVisit ? (
          <View style={styles.visitContent}>
            <View style={styles.visitInfoRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="calendar-outline" size={20} color={COLORS.accentBlue} />
              </View>
              <View style={styles.visitTextWrap}>
                <Text style={styles.visitTime}>{scheduledAt}</Text>
                <Text style={styles.visitStaff}>{staffName}</Text>
              </View>
              <Avatar.Text
                size={48}
                label={staffInitials}
                style={styles.staffAvatar}
                labelStyle={styles.staffAvatarLabel}
                color="#FFFFFF"
              />
            </View>
            <TouchableOpacity style={styles.viewDetailsBtn} onPress={onPress} activeOpacity={0.85}>
              <Text style={styles.viewDetailsText}>View Details</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.emptyContent} onPress={onSeeAllPress} activeOpacity={0.85}>
            <Ionicons name="calendar-outline" size={24} color="rgba(255,255,255,0.5)" />
            <View style={styles.emptyTextWrap}>
              <Text style={styles.emptyTitle}>No Upcoming Visits</Text>
              <Text style={styles.emptySub}>You have no scheduled care visits right now.</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: -30,
    marginBottom: SPACING.lg,
    paddingHorizontal: 0,
    zIndex: 10,
  },
  card: {
    backgroundColor: COLORS.navy,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sparkle: {
    fontSize: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  visitContent: {},
  visitInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(41, 169, 245, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  visitTextWrap: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  visitTime: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  visitStaff: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
  },
  staffAvatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  staffAvatarLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  viewDetailsBtn: {
    backgroundColor: COLORS.navyDark,
    borderRadius: RADIUS.round,
    paddingVertical: SPACING.sm + 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  viewDetailsText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  emptyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  emptyTextWrap: {
    flex: 1,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  emptySub: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
  },
});
