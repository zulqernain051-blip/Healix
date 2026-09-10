import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';
import { Contract } from '../../types/contract';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../theme';

interface Props {
  contract: Contract;
  isPatientView?: boolean;
  onApprove?: (contractId: string) => void;
  onReject?: (contractId: string) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
  style?: any;
}

export const ContractApprovalPanel: React.FC<Props> = ({
  contract,
  isPatientView = false,
  onApprove,
  onReject,
  isApproving = false,
  isRejecting = false,
  style,
}) => {
  const isPending = contract.status === 'PENDING_APPROVAL';
  const hasApproved = isPatientView ? contract.patientApproved : contract.nurseApproved;
  const otherPartyApproved = isPatientView ? contract.nurseApproved : contract.patientApproved;

  return (
    <Card style={[styles.card, style]}>
      <Card.Content>
        <Text style={styles.title}>Approval Status</Text>
        
        <View style={styles.statusRow}>
          <Text style={styles.partyText}>{isPatientView ? 'You (Patient)' : 'Patient'}</Text>
          <Text style={contract.patientApproved ? styles.approvedText : styles.pendingText}>
            {contract.patientApproved ? '✅ Approved' : '⏳ Pending'}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.partyText}>{!isPatientView ? 'You (Nurse)' : 'Nurse'}</Text>
          <Text style={contract.nurseApproved ? styles.approvedText : styles.pendingText}>
            {contract.nurseApproved ? '✅ Approved' : '⏳ Pending'}
          </Text>
        </View>

        {isPending && !hasApproved && onApprove && onReject && (
          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={() => onApprove(contract.id)}
              loading={isApproving}
              disabled={isApproving || isRejecting}
              style={styles.approveBtn}
              buttonColor={COLORS.emerald}
            >
              Approve Contract
            </Button>
            <Button
              mode="outlined"
              onPress={() => onReject(contract.id)}
              loading={isRejecting}
              disabled={isApproving || isRejecting}
              textColor={COLORS.red}
              style={styles.rejectBtn}
            >
              Reject
            </Button>
          </View>
        )}

        {isPending && hasApproved && (
          <View style={styles.waitingBox}>
            <Text style={styles.waitingText}>
              Waiting for {isPatientView ? 'nurse' : 'patient'} to approve...
            </Text>
          </View>
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
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  partyText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
  },
  approvedText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.emerald,
    fontWeight: 'bold',
  },
  pendingText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.amber,
    fontWeight: 'bold',
  },
  actions: {
    marginTop: SPACING.lg,
  },
  approveBtn: {
    marginBottom: SPACING.md,
    borderRadius: RADIUS.sm,
  },
  rejectBtn: {
    borderColor: COLORS.red,
    borderRadius: RADIUS.sm,
  },
  waitingBox: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  waitingText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
});
