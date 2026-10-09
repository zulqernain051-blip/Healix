import { useAppTheme, useThemeValue } from '../../theme/ThemeProvider';
import type { ThemeColors } from '../../theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { NurseOffer } from '../../types/marketplace';
import { OfferStatusBadge } from './OfferStatusBadge';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../theme';

interface Props {
  offer: NurseOffer;
  isPatientView?: boolean;
  onSelect?: (offerId: string) => void;
  onWithdraw?: (offerId: string) => void;
  onReject?: (offerId: string) => void;
  onFavorite?: (nurseId: string) => void;
  isFavorite?: boolean;
  busy?: boolean;
  isSelecting?: boolean;
  isWithdrawing?: boolean;
  style?: any;
}

export const OfferCard: React.FC<Props> = ({
  offer,
  isPatientView = false,
  onSelect,
  onWithdraw,
  onReject, onFavorite, isFavorite = false, busy = false,
  isSelecting = false,
  isWithdrawing = false,
  style,
}) => {
  const { colors: COLORS } = useAppTheme();
  const styles = useThemeValue(createStyles);

  const isPending = offer.status === 'PENDING' && Date.parse(offer.expiresAt) > Date.now();

  return (
    <Card style={[styles.card, style]}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.nurseName}>
              {isPatientView ? offer.nurse?.user?.fullName || 'Nurse' : 'Your Offer'}
            </Text>
            {isPatientView && offer.bestMatchScore !== undefined && (
              <Text style={styles.scoreText}>Comparison: {offer.bestMatchScore}/100</Text>
            )}
          </View>
          <OfferStatusBadge status={offer.status} />
        </View>

        {isPatientView && <View>
          <Text style={styles.value}>Patient ratings: {offer.reviewSummary?.averageStars==null?'No ratings recorded':`${offer.reviewSummary.averageStars.toFixed(1)}/5 · ${offer.reviewSummary.count} reviews`}</Text>
          <Text style={styles.value}>Experience: {offer.nurse.experience == null ? 'Not recorded' : `${offer.nurse.experience} years`}</Text>
          <Text style={styles.value}>Recorded performance: {offer.nurse.score ? `${Math.round(offer.nurse.score.compositeScore)} / 100` : 'Not assessed'}</Text>
          <Text style={styles.value}>Certified specialties: {offer.nurse.specializations?.filter(s => s.certified).map(s => s.specialization.replace(/_/g, ' ')).join(', ') || 'None recorded'}</Text>
          <Text style={styles.value}>Estimated service: PKR {offer.estimatedServiceCost ?? 'Unavailable'} for {offer.priceDurationMinutes ?? '—'} minutes{offer.priceDurationAssumed?' (comparison assumption)':''}</Text>
          <Text style={styles.value}>Platform fee ({offer.feePercentage ?? '—'}%): PKR {offer.estimatedPlatformFee ?? 'Unavailable'} · Total estimate: PKR {offer.estimatedTotal ?? 'Unavailable'}</Text>
          {offer.matchBasis && <Text style={styles.label}>{offer.matchBasis}</Text>}
          {onFavorite && <Button disabled={busy} onPress={() => onFavorite(offer.nurseId)}>{isFavorite ? 'Remove favorite' : 'Save nurse'}</Button>}
        </View>}

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
          {isPatientView && isPending && onReject && <Button disabled={busy || isSelecting} onPress={() => onReject(offer.id)}>Reject</Button>}
          {isPatientView && isPending && onSelect && (
            <Button
              mode="contained"
              onPress={() => onSelect(offer.id)}
              loading={isSelecting}
              disabled={isSelecting || busy}
              style={styles.selectBtn}
              buttonColor={COLORS.navy}
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

const createStyles = (COLORS: ThemeColors) => (StyleSheet.create({
  card: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
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
    color: COLORS.textDark,
  },
  scoreText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.emerald,
    fontWeight: 'bold',
    marginTop: 2,
  },
  detailsBox: {
    backgroundColor: COLORS.glassSurface,
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
    color: COLORS.textBody,
  },
  value: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  price: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textDark,
    fontWeight: 'bold',
  },
  priceType: {
    color: COLORS.textBody,
    fontWeight: 'normal',
    fontSize: 12,
  },
  messageBox: {
    marginTop: SPACING.sm,
  },
  messageLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textBody,
    marginBottom: 2,
  },
  messageText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textDark,
    fontStyle: 'italic',
  },
  actions: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    justifyContent: 'flex-end',
  },
  selectBtn: {
    borderRadius: RADIUS.sm,
  },
  withdrawBtn: {
    borderRadius: RADIUS.sm,
    borderColor: COLORS.red,
    width: '100%',
  },
}));
