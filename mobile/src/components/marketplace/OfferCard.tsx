import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { NurseOffer } from '../../types/marketplace';
import { OfferStatusBadge } from './OfferStatusBadge';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../theme';

interface Props {
  offer: NurseOffer;
  isPatientView?: boolean;
  onSelect?: (offerId: string) => void;
  onWithdraw?: (offerId: string) => void;
  isSelecting?: boolean;
  isWithdrawing?: boolean;
  style?: any;
}

export const OfferCard: React.FC<Props> = ({
  offer,
  isPatientView = false,
  onSelect,
  onWithdraw,
  isSelecting = false,
  isWithdrawing = false,
  style,
}) => {
  const isPending = offer.status === 'PENDING';

  return (
    <Card style={[styles.card, style]}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.nurseName}>
              {isPatientView ? offer.nurse?.user?.fullName || 'Nurse' : 'Your Offer'}
            </Text>
            {isPatientView && offer.bestMatchScore !== undefined && (
              <Text style={styles.scoreText}>Match: {offer.bestMatchScore}%</Text>
            )}
          </View>
          <OfferStatusBadge status={offer.status} />
        </View>

        <View style={styles.detailsBox}>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Proposed Rate:</Text>
            <Text style={styles.price}>
              PKR {offer.price} <Text style={styles.priceType}>/ {offer.priceType}</Text>
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Start Time:</Text>
            <Text style={styles.value}>
              {new Date(offer.proposedStart).toLocaleDateString()} at{' '}
              {new Date(offer.proposedStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>

        {offer.message && (
          <View style={styles.messageBox}>
            <Text style={styles.messageLabel}>Message:</Text>
            <Text style={styles.messageText}>"{offer.message}"</Text>
          </View>
        )}
      </Card.Content>

      {(isPatientView && isPending && onSelect) || (!isPatientView && isPending && onWithdraw) ? (
        <Card.Actions style={styles.actions}>
          {isPatientView && isPending && onSelect && (
            <Button
              mode="contained"
              onPress={() => onSelect(offer.id)}
              loading={isSelecting}
              disabled={isSelecting}
              style={styles.selectBtn}
              buttonColor={COLORS.primary}
            >
              Select Offer
            </Button>
          )}
          {!isPatientView && isPending && onWithdraw && (
            <Button
              mode="outlined"
              onPress={() => onWithdraw(offer.id)}
              loading={isWithdrawing}
              disabled={isWithdrawing}
              textColor={COLORS.red}
              style={styles.withdrawBtn}
            >
              Withdraw Offer
            </Button>
          )}
        </Card.Actions>
      ) : null}
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
  headerLeft: {
    flex: 1,
  },
  nurseName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  scoreText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.emerald,
    fontWeight: 'bold',
    marginTop: 2,
  },
  detailsBox: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  label: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
  },
  value: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  price: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
  },
  priceType: {
    color: COLORS.textSecondary,
    fontWeight: 'normal',
    fontSize: 12,
  },
  messageBox: {
    marginTop: SPACING.sm,
  },
  messageLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  messageText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    fontStyle: 'italic',
  },
  actions: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    justifyContent: 'flex-end',
  },
  selectBtn: {
    borderRadius: RADIUS.sm,
    width: '100%',
  },
  withdrawBtn: {
    borderRadius: RADIUS.sm,
    borderColor: COLORS.red,
    width: '100%',
  },
});
