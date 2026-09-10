import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip } from 'react-native-paper';
import { OfferStatus } from '../../types/marketplace';

interface Props {
  status: OfferStatus;
  style?: any;
}

export const OfferStatusBadge: React.FC<Props> = ({ status, style }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'PENDING':
        return { label: 'Pending', bg: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' };
      case 'ACCEPTED':
        return { label: 'Accepted', bg: 'rgba(16, 185, 129, 0.15)', color: '#10B981' };
      case 'REJECTED':
        return { label: 'Rejected', bg: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' };
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
