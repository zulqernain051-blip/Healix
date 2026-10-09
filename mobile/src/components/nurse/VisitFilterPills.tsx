
import { useAppTheme, useThemeValue } from '../../theme/ThemeProvider';
import type { ThemeColors } from '../../theme';
import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';


interface VisitFilterPillsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  filters: string[];
}

export const VisitFilterPills: React.FC<VisitFilterPillsProps> = ({ activeFilter, onFilterChange, filters }) => {
  const { colors: COLORS } = useAppTheme();
  const styles = useThemeValue(createStyles);

  return (
    <View style={styles.container}>
      {filters.map(filter => (
        <TouchableOpacity
          key={filter}
          style={[styles.pill, activeFilter === filter && styles.pillActive]}
          onPress={() => onFilterChange(filter)}
        >
          <Text style={[styles.text, activeFilter === filter && styles.textActive]}>
            {filter === 'ALL' ? 'All' : filter.charAt(0) + filter.slice(1).toLowerCase().replace('_', ' ')}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const createStyles = (COLORS: ThemeColors) => (StyleSheet.create({
  container: { flexDirection: 'row', backgroundColor: COLORS.surfaceCard, borderRadius: 12, padding: 4, marginBottom: 24, flexWrap: 'wrap', gap: 4 },
  pill: { flex: 1, minWidth: 60, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  pillActive: { backgroundColor: COLORS.surfaceCard, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  text: { color: COLORS.textBody, fontSize: 13, fontWeight: '600' },
  textActive: { color: COLORS.emerald, fontWeight: '800' },
}));
