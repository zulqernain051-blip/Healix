import React from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { useContract, useApproveContract, useRejectContract, useCancelContract } from '../../../../hooks/useContracts';
import { ContractApprovalPanel } from '../../../../components/contracts/ContractApprovalPanel';
import { ContractStatusBadge } from '../../../../components/contracts/ContractStatusBadge';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS } from '../../../../theme';

export default function NurseContractDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const contractId = id || '';

  const { data: contract, isLoading, isError, error } = useContract(contractId, {
    pollingInterval: 10000, // Poll every 10s to see if patient approves
  });

  const approveContract = useApproveContract();
  const rejectContract = useRejectContract();
  const cancelContract = useCancelContract();

  const handleApprove = async (cid: string) => {
    try {
      await approveContract.mutateAsync(cid);
      Alert.alert('Success', 'Contract approved. Waiting for patient to approve.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to approve contract');
    }
  };

  const handleReject = async (cid: string) => {
    try {
      await rejectContract.mutateAsync({ id: cid, data: { reason: 'Nurse rejected' } });
      Alert.alert('Rejected', 'Contract has been rejected.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to reject contract');
    }
  };

  if (isLoading && !contract) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  if (isError || !contract) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Contract not found</Text>
        <Text style={styles.errorDetail}>{(error as Error)?.message}</Text>
      </View>
    );
  }

  const patientName = contract.patient?.user?.fullName || 'Patient';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Contract Details</Text>
        <ContractStatusBadge status={contract.status} />
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>With:</Text>
        <Text style={styles.infoValue}>{patientName}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>Rate:</Text>
        <Text style={styles.infoValue}>PKR {contract.price} / {contract.priceType}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>Scope of Work:</Text>
        <Text style={styles.scopeText}>{contract.scopeText}</Text>
      </View>

      <ContractApprovalPanel
        contract={contract}
        isPatientView={false}
        onApprove={handleApprove}
        onReject={handleReject}
        isApproving={approveContract.isPending}
        isRejecting={rejectContract.isPending}
        style={styles.approvalPanel}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    padding: SPACING.lg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
  },
  infoBox: {
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  infoValue: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  scopeText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    fontStyle: 'italic',
  },
  approvalPanel: {
    marginTop: SPACING.lg,
  },
  errorText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.red,
    marginBottom: SPACING.xs,
  },
  errorDetail: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
});
