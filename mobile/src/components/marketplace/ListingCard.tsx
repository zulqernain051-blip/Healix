import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import { MarketplaceListing } from '../../types/marketplace';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../theme';

interface Props {
  listing: MarketplaceListing;
  onPress?: () => void;
  style?: any;
}

export const ListingCard: React.FC<Props> = ({ listing, onPress, style }) => {
  const req = listing.careRequest;

  return (
    <Card style={[styles.card, style]} onPress={onPress}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleWrap}>
            <Text style={styles.patientName}>{req.patient.fullName}</Text>
            <Text style={styles.zoneText}>{req.patient.address}</Text>
          </View>
          <Chip
            style={styles.statusChip}
            textStyle={styles.statusText}
          >
            {listing.status}
          </Chip>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Service Type:</Text>
          <Text style={styles.value}>{req.type.replace(/_/g, ' ')}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Scheduled:</Text>
          <Text style={styles.value}>
            {new Date(req.scheduledAt).toLocaleDateString()} at{' '}
            {new Date(req.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        {!!listing.specializationRequired && (
          <View style={styles.row}>
            <Text style={styles.label}>Requires:</Text>
            <Text style={styles.value}>{listing.specializationRequired}</Text>
          </View>
        )}

        {!!req.notes && (
          <Text style={styles.notes} numberOfLines={2}>
            "{req.notes}"
          </Text>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  titleWrap: {
    flex: 1,
  },
  patientName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  zoneText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusChip: {
    backgroundColor: COLORS.tealLight,
    height: 24,
  },
  statusText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: 'bold',
    marginVertical: 0,
  },
  row: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  label: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    width: 90,
  },
  value: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    flex: 1,
    fontWeight: '500',
  },
  notes: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
});
