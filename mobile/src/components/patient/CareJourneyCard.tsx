import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../theme';
import { CareRequestResponse } from '../../types/care';

interface CareJourneyCardProps {
  request: CareRequestResponse;
  onCardPress: () => void;
  onCheckInPress?: (visitId: string) => void;
  onCompareOffersPress?: (listingId: string) => void;
  onViewContractPress?: (contractId: string) => void;
  onRebookPress?: (nurseName?: string) => void;
}

export const CareJourneyCard: React.FC<CareJourneyCardProps> = ({
  request,
  onCardPress,
  onCheckInPress,
  onCompareOffersPress,
  onViewContractPress,
  onRebookPress,
}) => {
  const reqData = request as any;
  const visit = reqData?.visit || (reqData?.visits && reqData.visits.length > 0 ? reqData.visits[0] : null);
  const nurse = visit?.nurse?.user || reqData?.nurse?.user;
  const nurseName = nurse?.fullName || (request.type === 'NURSE_VISIT' ? 'Assigned Nurse' : 'Assigned Doctor');
  const serviceTitle = request.requirements || (request.type === 'NURSE_VISIT' ? 'Home Nurse Care' : 'Doctor Consultation');
  const latestAssessment = visit?.assessments && visit.assessments.length > 0 ? visit.assessments[0] : null;
  const latestVitals = visit?.vitals && visit.vitals.length > 0 ? visit.vitals[0] : null;
  
  const nurseInitials = nurseName
    ? nurseName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'RN';

  const scheduledDate = request.scheduledAt || visit?.scheduledAt || request.preferredDate;
  const formattedDate = scheduledDate
    ? new Date(scheduledDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : 'Date TBD';

  const formattedTime = scheduledDate
    ? new Date(scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const isToday = scheduledDate ? new Date(scheduledDate).toDateString() === new Date().toDateString() : false;

  // ─────────────────────────────────────────────────────────────
  // 1. UPCOMING WITH ASSIGNED VISIT
  // ─────────────────────────────────────────────────────────────
  if (request.status === 'ASSIGNED' || request.status === 'IN_PROGRESS' || (visit && request.status !== 'COMPLETED' && request.status !== 'CANCELLED')) {
    const visitTimingText = isToday
      ? `Visit today${formattedTime ? ` · ${formattedTime}` : ''}`
      : `Scheduled ${formattedDate}${formattedTime ? ` · ${formattedTime}` : ''}`;

    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.88} onPress={onCardPress}>
        <View style={styles.cardHeader}>
          <View style={styles.avatarRing}>
            <Avatar.Text
              size={48}
              label={nurseInitials}
              style={styles.avatarTeal}
              labelStyle={styles.avatarLabelTeal}
              color={COLORS.careEmerald}
            />
          </View>
          <View style={styles.headerInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
              <Text style={[styles.titleBold, { flex: 1 }]} numberOfLines={1}>
                {nurseName.startsWith('Nurse') || nurseName.startsWith('Dr') ? nurseName : `Nurse ${nurseName}`}
              </Text>
              {latestAssessment && (
                <View style={styles.cardRiskRow}>
                  <View
                    style={[
                      styles.miniRiskBadge,
                      {
                        backgroundColor:
                          latestAssessment.riskTier === 'HIGH' || latestAssessment.riskTier === 'CRITICAL'
                            ? 'rgba(239, 68, 68, 0.12)'
                            : latestAssessment.riskTier === 'MEDIUM'
                            ? 'rgba(245, 158, 11, 0.12)'
                            : 'rgba(16, 185, 129, 0.12)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.miniRiskText,
                        {
                          color:
                            latestAssessment.riskTier === 'HIGH' || latestAssessment.riskTier === 'CRITICAL'
                              ? '#DC2626'
                              : latestAssessment.riskTier === 'MEDIUM'
                              ? '#D97706'
                              : '#059669',
                        },
                      ]}
                    >
                      {latestAssessment.riskTier}
                    </Text>
                  </View>
                  <View style={styles.miniScoreBadge}>
                    <Text style={styles.miniScoreText}>
                      Score {Math.round(latestAssessment.fusedScore)}%
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <Text style={styles.serviceSub} numberOfLines={1}>
              {serviceTitle}
            </Text>
            <Text style={styles.timingAmber} numberOfLines={1}>
              {visitTimingText}
            </Text>
            {latestVitals && (
              <Text style={styles.vitalsSummaryText} numberOfLines={1}>
                🩺 {latestVitals.systolic}/{latestVitals.diastolic} mmHg · {latestVitals.heartRate} bpm · {latestVitals.oxygenSaturation}% SpO₂
              </Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryActionButton}
          activeOpacity={0.85}
          onPress={() => {
            if (visit?.id && onCheckInPress) {
              onCheckInPress(visit.id);
            } else {
              onCardPress();
            }
          }}
        >
          <Text style={styles.primaryActionText}>{visit?.id ? 'Show visit QR code' : 'View visit status'}</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. CONTRACT PENDING APPROVAL (AFTER OFFER SELECTION)
  // ─────────────────────────────────────────────────────────────
  if (request.contract && request.contract.status === 'PENDING_APPROVAL') {
    const contract = request.contract;
    const contractNurse = contract.nurse?.user?.fullName || nurseName || 'Nurse';
    const contractNurseInitials = contractNurse
      ? contractNurse
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase()
      : 'RN';

    const priceText = `PKR ${contract.price} · ${contract.priceType === 'HOURLY' ? 'Hourly rate' : 'Fixed rate'}`;
    const approvalStatusText = contract.patientApproved
      ? 'Awaiting nurse confirmation'
      : 'Contract ready for review';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.88}
        onPress={() => {
          if (onViewContractPress) {
            onViewContractPress(contract.id);
          } else {
            onCardPress();
          }
        }}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.avatarRing, { borderColor: 'rgba(41, 169, 245, 0.4)' }]}>
            <Avatar.Text
              size={48}
              label={contractNurseInitials}
              style={{ backgroundColor: 'rgba(41, 169, 245, 0.12)' }}
              labelStyle={[styles.avatarLabelTeal, { color: COLORS.accentBlue }]}
              color={COLORS.accentBlue}
            />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.titleBold} numberOfLines={1}>
              {approvalStatusText}
            </Text>
            <Text style={styles.serviceSub} numberOfLines={1}>
              {contractNurse.startsWith('Nurse') || contractNurse.startsWith('Dr') ? contractNurse : `Nurse ${contractNurse}`} · {serviceTitle}
            </Text>
            <Text style={[styles.timingAmber, { color: COLORS.accentBlue }]} numberOfLines={1}>
              {priceText}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.primaryActionButton, { backgroundColor: COLORS.navy }]}
          activeOpacity={0.85}
          onPress={() => {
            if (onViewContractPress) {
              onViewContractPress(contract.id);
            } else {
              onCardPress();
            }
          }}
        >
          <Text style={styles.primaryActionText}>
            {contract.patientApproved ? 'View contract details' : 'Review contract'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 3. OPEN REQUEST (AWAITING OFFERS OR HAS OFFERS)
  // ─────────────────────────────────────────────────────────────
  if (request.status === 'OPEN') {
    const listingId = request.marketplaceListing?.id || request.id;
    const offersCount = request.marketplaceListing?._count?.offers ?? 0;
    const hasOffers = offersCount > 0;
    const requestedTiming = request.createdAt
      ? `Requested ${new Date(request.createdAt).toLocaleDateString(undefined, { weekday: 'long' })}`
      : 'Requested recently';

    const actionText = offersCount === 1 ? 'See offers' : 'Compare offers';

    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.88} onPress={onCardPress}>
        <View style={styles.cardHeader}>
          {hasOffers ? (
            /* Stacked Avatars Visual — only when offers exist */
            <View style={styles.stackedAvatarsRow}>
              <View style={[styles.miniAvatar, { backgroundColor: '#E0E7FF', zIndex: 3 }]}>
                <Text style={[styles.miniAvatarText, { color: '#4338CA' }]}>HM</Text>
              </View>
              <View style={[styles.miniAvatar, { backgroundColor: '#E0F2FE', marginLeft: -12, zIndex: 2 }]}>
                <Text style={[styles.miniAvatarText, { color: '#0369A1' }]}>AR</Text>
              </View>
              {offersCount > 2 && (
                <View style={[styles.miniAvatar, { backgroundColor: '#FEF3C7', marginLeft: -12, zIndex: 1 }]}>
                  <Text style={[styles.miniAvatarText, { color: '#B45309' }]}>+{offersCount - 2}</Text>
                </View>
              )}
            </View>
          ) : (
            /* Waiting indicator when no offers yet */
            <View style={styles.waitingAvatarRing}>
              <View style={styles.waitingDot} />
            </View>
          )}

          <View style={styles.headerInfo}>
            <Text style={styles.titleBold} numberOfLines={1}>
              {hasOffers
                ? `${offersCount} offer${offersCount > 1 ? 's' : ''} available`
                : 'Awaiting nurse offers'}
            </Text>
            <Text style={styles.serviceSub} numberOfLines={1}>
              {serviceTitle}
            </Text>
            <Text style={styles.timingMuted} numberOfLines={1}>
              {requestedTiming}
            </Text>
          </View>
        </View>

        {hasOffers ? (
          <TouchableOpacity
            style={styles.primaryActionButton}
            activeOpacity={0.85}
            onPress={() => {
              if (onCompareOffersPress) {
                onCompareOffersPress(listingId);
              } else {
                onCardPress();
              }
            }}
          >
            <Text style={styles.primaryActionText}>{actionText}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.waitingBar}>
            <Text style={styles.waitingBarText}>Your request is live on the marketplace</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 3. COMPLETED CARE
  // ─────────────────────────────────────────────────────────────
  if (request.status === 'COMPLETED') {
    const completedDateText = request.updatedAt
      ? `Completed ${new Date(request.updatedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`
      : 'Completed';

    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.88} onPress={onCardPress}>
        <View style={styles.cardHeader}>
          <View style={styles.avatarRing}>
            <Avatar.Text
              size={48}
              label={nurseInitials}
              style={styles.avatarTeal}
              labelStyle={styles.avatarLabelTeal}
              color={COLORS.careEmerald}
            />
          </View>
          <View style={styles.headerInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
              <Text style={[styles.titleBold, { flex: 1 }]} numberOfLines={1}>
                {serviceTitle}
              </Text>
              {latestAssessment && (
                <View style={styles.cardRiskRow}>
                  <View
                    style={[
                      styles.miniRiskBadge,
                      {
                        backgroundColor:
                          latestAssessment.riskTier === 'HIGH' || latestAssessment.riskTier === 'CRITICAL'
                            ? 'rgba(239, 68, 68, 0.12)'
                            : latestAssessment.riskTier === 'MEDIUM'
                            ? 'rgba(245, 158, 11, 0.12)'
                            : 'rgba(16, 185, 129, 0.12)',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.miniRiskText,
                        {
                          color:
                            latestAssessment.riskTier === 'HIGH' || latestAssessment.riskTier === 'CRITICAL'
                              ? '#DC2626'
                              : latestAssessment.riskTier === 'MEDIUM'
                              ? '#D97706'
                              : '#059669',
                        },
                      ]}
                    >
                      {latestAssessment.riskTier}
                    </Text>
                  </View>
                  <View style={styles.miniScoreBadge}>
                    <Text style={styles.miniScoreText}>
                      Score {Math.round(latestAssessment.fusedScore)}%
                    </Text>
                  </View>
                </View>
              )}
            </View>

            <Text style={styles.serviceSub} numberOfLines={1}>
              {nurseName.startsWith('Nurse') || nurseName.startsWith('Dr') ? nurseName : `Nurse ${nurseName}`}
            </Text>
            <Text style={styles.timingMuted} numberOfLines={1}>
              {completedDateText}
            </Text>
            {latestVitals && (
              <Text style={styles.vitalsSummaryText} numberOfLines={1}>
                🩺 {latestVitals.systolic}/{latestVitals.diastolic} mmHg · {latestVitals.heartRate} bpm · {latestVitals.oxygenSaturation}% SpO₂
              </Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.outlinedActionButton}
          activeOpacity={0.85}
          onPress={() => {
            if (onRebookPress) {
              onRebookPress(nurseName);
            } else {
              onCardPress();
            }
          }}
        >
          <Text style={styles.outlinedActionText}>
            Book {nurseName.split(' ')[0]} again
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 4. CANCELLED / OTHER FALLBACK
  // ─────────────────────────────────────────────────────────────
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.88} onPress={onCardPress}>
      <View style={styles.cardHeader}>
        <View style={[styles.avatarRing, { borderColor: 'rgba(239, 68, 68, 0.25)' }]}>
          <Avatar.Text
            size={48}
            label={nurseInitials}
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
            labelStyle={styles.avatarLabelTeal}
            color={COLORS.red}
          />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.titleBold} numberOfLines={1}>
            {serviceTitle}
          </Text>
          <Text style={styles.serviceSub} numberOfLines={1}>
            Status: {request.status}
          </Text>
          <Text style={styles.timingMuted} numberOfLines={1}>
            {formattedDate}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.outlinedActionButton}
        activeOpacity={0.85}
        onPress={onCardPress}
      >
        <Text style={styles.outlinedActionText}>View details</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarRing: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarTeal: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  avatarLabelTeal: {
    fontSize: 16,
    fontWeight: '700',
  },
  stackedAvatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60,
    marginRight: SPACING.sm,
  },
  miniAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniAvatarText: {
    fontSize: 11,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
  },
  titleBold: {
    color: COLORS.textDark,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  serviceSub: {
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
    marginTop: 2,
  },
  timingAmber: {
    color: '#B45309', // Amber-700 for high-contrast visibility
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginTop: 3,
  },
  timingMuted: {
    color: COLORS.textMuted,
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 3,
  },
  primaryActionButton: {
    backgroundColor: '#6D28D9', // Deep royal indigo matching the screenshot button
    borderRadius: RADIUS.round,
    paddingVertical: SPACING.md - 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm + 1,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  outlinedActionButton: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: RADIUS.round,
    paddingVertical: SPACING.md - 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
  },
  outlinedActionText: {
    color: COLORS.textDark,
    fontSize: TYPOGRAPHY.sizes.sm + 1,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  waitingAvatarRing: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    backgroundColor: 'rgba(245, 158, 11, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  waitingDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#F59E0B',
  },
  waitingBar: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: RADIUS.round,
    paddingVertical: SPACING.md - 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  waitingBarText: {
    color: '#B45309',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  cardRiskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniRiskBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.round,
  },
  miniRiskText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  miniScoreBadge: {
    backgroundColor: 'rgba(11, 66, 104, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.round,
  },
  miniScoreText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.navy,
  },
  vitalsSummaryText: {
    fontSize: 11,
    color: COLORS.textBody,
    marginTop: 3,
    fontWeight: '500',
  },
});
