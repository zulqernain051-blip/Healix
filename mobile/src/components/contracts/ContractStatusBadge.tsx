import React from 'react';
import { StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { ContractStatus } from '../../types/contract';

interface Props {
  status: ContractStatus;
  style?: any;
}

export const ContractStatusBadge: React.FC<Props> = ({ status, style }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'DRAFT':
        return { label: 'Draft', bg: 'rgba(107, 114, 128, 0.15)', color: '#9CA3AF' };
      case 'PENDING_APPROVAL':
        return { label: 'Pending Approval', bg: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' };
      case 'ACTIVE':
        return { label: 'Active', bg: 'rgba(16, 185, 129, 0.15)', color: '#10B981' };
      case 'COMPLETED':
        return { label: 'Completed', bg: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' };
      case 'CANCELLED':
      case 'REJECTED':
        return { label: status === 'REJECTED' ? 'Rejected' : 'Cancelled', bg: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' };
      case 'EXPIRED':
        return { label: 'Expired', bg: 'rgba(107, 114, 128, 0.15)', color: '#9CA3AF' };
      default:
        return { label: status, bg: 'rgba(107, 114, 128, 0.1)', color: '#6B7280' };
    }
  };

  const config = getStatusConfig();

  return (
    <Chip
      style={[{ backgroundColor: config.bg }, styles.chip, style]}
      textStyle={{ color: config.color, fontSize: 12, fontWeight: 'bold' }}
    >
      {config.label}
    </Chip>
  );
};

const styles = StyleSheet.create({
  chip: {
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
