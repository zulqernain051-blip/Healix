
import { useAppTheme } from '../../theme/ThemeProvider';

import React from 'react';
import { StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { ContractStatus } from '../../types/contract';

interface Props {
  status: ContractStatus;
  style?: any;
}

export const ContractStatusBadge: React.FC<Props> = ({ status, style }) => {
  const { colors: COLORS } = useAppTheme();

  const getStatusConfig = () => {
    switch (status) {
      case 'DRAFT':
        return { label: 'Draft', bg: COLORS.bg, color: COLORS.textBody };
      case 'PENDING_APPROVAL':
        return { label: 'Pending Approval', bg: COLORS.amberLight, color: COLORS.amber };
      case 'ACTIVE':
        return { label: 'Active', bg: COLORS.emeraldLight, color: COLORS.emerald };
      case 'COMPLETED':
        return { label: 'Completed', bg: COLORS.blueLight, color: COLORS.primaryText };
      case 'CANCELLED':
      case 'REJECTED':
        return { label: status === 'REJECTED' ? 'Rejected' : 'Cancelled', bg: COLORS.redLight, color: COLORS.red };
      case 'EXPIRED':
        return { label: 'Expired', bg: COLORS.bg, color: COLORS.textBody };
      default:
        return { label: status, bg: COLORS.bg, color: COLORS.textBody };
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
