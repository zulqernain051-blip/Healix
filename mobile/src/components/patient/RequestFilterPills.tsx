import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { RADIUS, SPACING } from '../../theme';

interface RequestFilterPillsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  filters: string[];
}

export const RequestFilterPills: React.FC<RequestFilterPillsProps> = ({ activeFilter, onFilterChange, filters }) => {
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

const styles = StyleSheet.create({
  container: { flexDirection: 'row', backgroundColor: '#0A2D28', borderRadius: RADIUS.md, padding: 4, marginBottom: SPACING.lg },
  pill: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: RADIUS.sm },
  pillActive: { backgroundColor: '#00E676' },
  text: { color: '#94A3B8', fontSize: 11, fontWeight: '600' },
  textActive: { color: '#061C19', fontWeight: '700' },
});
