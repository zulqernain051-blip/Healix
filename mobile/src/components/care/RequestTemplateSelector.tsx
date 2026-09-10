import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../theme';

export interface RequestTemplate {
  id: string;
  title: string;
  icon: string;
  description: string;
  defaultNotes: string;
  recommendedDuration: number;
  preferredSpecialization: string;
}

export const REQUEST_TEMPLATES: RequestTemplate[] = [
  {
    id: 'general',
    title: 'General Assessment',
    icon: '🩺',
    description: 'Vital signs monitoring, physical assessment, health check.',
    defaultNotes: 'Routine vital signs monitoring and general health evaluation.',
    recommendedDuration: 45,
    preferredSpecialization: 'General Nursing',
  },
  {
    id: 'post_op',
    title: 'Post-Operative Care',
    icon: '🩹',
    description: 'Wound care, surgical dressing, drain & catheter management.',
    defaultNotes: 'Post-op dressing change. Inspect surgical incision site.',
    recommendedDuration: 60,
    preferredSpecialization: 'Wound Care',
  },
  {
    id: 'elderly',
    title: 'Elderly Care',
    icon: '👵',
    description: 'Medication admin, fall risk evaluation, mobility support.',
    defaultNotes: 'Elderly patient requires medication administration and mobility support.',
    recommendedDuration: 90,
    preferredSpecialization: 'Elderly Care',
  },
  {
    id: 'iv_therapy',
    title: 'IV Therapy',
    icon: '💉',
    description: 'IV drip setup, IM/SC injections, fluid management.',
    defaultNotes: 'Prescribed IV fluid drip setup and injection administration.',
    recommendedDuration: 45,
    preferredSpecialization: 'IV Therapy',
  },
];

interface Props {
  selectedTemplateId: string | null;
  onSelect: (template: RequestTemplate | null) => void;
}

export const RequestTemplateSelector: React.FC<Props> = ({ selectedTemplateId, onSelect }) => {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={[styles.templateCard, !selectedTemplateId && styles.templateCardActive]}
          onPress={() => onSelect(null)}
          activeOpacity={0.8}
        >
          <View style={[styles.iconContainer, !selectedTemplateId && styles.iconContainerActive]}>
            <Text style={styles.icon}>✍️</Text>
          </View>
          <Text style={[styles.title, !selectedTemplateId && styles.titleActive]}>Custom Request</Text>
          <Text style={styles.desc} numberOfLines={2}>Define your own specific needs.</Text>
        </TouchableOpacity>

        {REQUEST_TEMPLATES.map((tpl) => {
          const isActive = selectedTemplateId === tpl.id;
          return (
            <TouchableOpacity
              key={tpl.id}
              style={[styles.templateCard, isActive && styles.templateCardActive]}
              onPress={() => onSelect(tpl)}
              activeOpacity={0.8}
            >
              <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
                <Text style={styles.icon}>{tpl.icon}</Text>
              </View>
              <Text style={[styles.title, isActive && styles.titleActive]}>{tpl.title}</Text>
              <Text style={styles.desc} numberOfLines={2}>{tpl.description}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  templateCard: {
    width: 140,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.2)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    justifyContent: 'flex-start',
  },
  templateCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#0A2B26',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  iconContainerActive: {
    backgroundColor: COLORS.primary + '20',
  },
  icon: {
    fontSize: 20,
  },
  title: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  titleActive: {
    color: COLORS.primary,
  },
  desc: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 14,
  },
});
