
import { useAppTheme } from '../../theme/ThemeProvider';

import React from 'react';
import { StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { OfferStatus } from '../../types/marketplace';

interface Props {
  status: OfferStatus;
  style?: any;
}

export const OfferStatusBadge: React.FC<Props> = ({ status, style }) => {
  const { colors: COLORS } = useAppTheme();

  const getStatusConfig = () => {
    switch (status) {
      case 'PENDING':
        return { label: 'Pending', bg: COLORS.amberLight, color: COLORS.amber };
      case 'ACCEPTED':
        return { label: 'Accepted', bg: COLORS.emeraldLight, color: COLORS.emerald };
      case 'REJECTED':
        return { label: 'Rejected', bg: COLORS.redLight, color: COLORS.red };
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
