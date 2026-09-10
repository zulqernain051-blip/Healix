import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { Contract } from '../../types/contract';
import { ContractStatusBadge } from './ContractStatusBadge';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../theme';

interface Props {
  contract: Contract;
  isPatientView?: boolean;
  onPress?: () => void;
  style?: any;
}

export const ContractCard: React.FC<Props> = ({ contract, isPatientView = false, onPress, style }) => {
  const otherPartyName = isPatientView
    ? contract.nurse?.user?.fullName || 'Nurse'
    : contract.patient?.user?.fullName || 'Patient';

  return (
    <Card style={[styles.card, style]} onPress={onPress}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Contract with {otherPartyName}</Text>
            <Text style={styles.dateText}>
              Expires: {new Date(contract.expiresAt).toLocaleDateString()}
            </Text>
          </View>
          <ContractStatusBadge status={contract.status} />
        </View>

        <View style={styles.detailsBox}>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Rate:</Text>
            <Text style={styles.price}>
              PKR {contract.price} <Text style={styles.priceType}>/ {contract.priceType}</Text>
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Approval:</Text>
            <Text style={styles.value}>
              {contract.patientApproved ? '✅' : '⏳'} Patient {' | '}
              {contract.nurseApproved ? '✅' : '⏳'} Nurse
            </Text>
          </View>
        </View>
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
  headerLeft: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  dateText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  detailsBox: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
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
});
