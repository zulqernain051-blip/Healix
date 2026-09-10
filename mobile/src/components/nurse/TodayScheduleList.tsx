import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

interface ScheduleItem {
  id: string;
  patientName: string;
  scheduledTime: string;
  visitType: string;
  status: string;
}

interface TodayScheduleListProps {
  schedule: ScheduleItem[];
  onVisitPress: (visitId: string) => void;
  onViewAllPress: () => void;
}

export const TodayScheduleList: React.FC<TodayScheduleListProps> = ({ schedule, onVisitPress, onViewAllPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Today's Schedule</Text>
        <TouchableOpacity onPress={onViewAllPress}>
          <Text style={styles.viewAllText}>View All ›</Text>
        </TouchableOpacity>
      </View>

      {schedule && schedule.length > 0 ? (
        <View style={styles.list}>
          {schedule.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => onVisitPress(item.id)}
              activeOpacity={0.8}
            >
              <View style={styles.timeCol}>
                <Text style={styles.timeText}>{item.scheduledTime}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoCol}>
                <Text style={styles.patientName}>{item.patientName}</Text>
                <Text style={styles.visitType}>{item.visitType}</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No visits scheduled for today.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
  },
  viewAllText: {
    color: '#00E676',
    fontSize: 12,
    fontWeight: '700',
  },
  list: {
    gap: SPACING.sm,
  },
  card: {
    backgroundColor: '#0A2D28',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.15)',
  },
  timeCol: {
    width: 70,
  },
  timeText: {
    color: '#00E676',
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: SPACING.sm,
  },
  infoCol: {
    flex: 1,
  },
  patientName: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
  },
  visitType: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: 'rgba(0, 230, 118, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.round,
  },
  statusText: {
    color: '#00E676',
    fontSize: 10,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#0A2D28',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.15)',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 12,
  },
});
