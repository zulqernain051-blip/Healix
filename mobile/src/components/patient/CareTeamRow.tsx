import { useAppTheme, useThemeValue } from '../../theme/ThemeProvider';
import type { ThemeColors } from '../../theme';
import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

export interface CareTeamMember {
  id: string;
  name: string;
  visitsCount?: number;
  role?: string;
}

interface CareTeamRowProps {
  careTeam: CareTeamMember[];
  onAddNursePress: () => void;
  onMemberPress?: (member: CareTeamMember) => void;
}

export const CareTeamRow: React.FC<CareTeamRowProps> = ({
  careTeam,
  onAddNursePress,
  onMemberPress,
}) => {
  const { colors: COLORS } = useAppTheme();
  const styles = useThemeValue(createStyles);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Your care team</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {careTeam.map((member) => {
          const initials = member.name
            ? member.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase()
            : 'RN';

          const firstName = member.name ? member.name.split(' ')[0] : 'Caregiver';

          return (
            <TouchableOpacity
              key={member.id}
              style={styles.memberPill}
              activeOpacity={0.8}
              onPress={() => onMemberPress?.(member)}
            >
              <View style={styles.avatarBorder}>
                <Avatar.Text
                  size={38}
                  label={initials}
                  style={styles.avatar}
                  labelStyle={styles.avatarLabel}
                  color={COLORS.careEmerald}
                />
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName} numberOfLines={1}>
                  {firstName}
                </Text>
                <Text style={styles.memberSub} numberOfLines={1}>
                  {member.visitsCount !== undefined
                    ? `${member.visitsCount} ${member.visitsCount === 1 ? 'visit' : 'visits'}`
                    : member.role || 'Caregiver'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Add nurse pill */}
        <TouchableOpacity
          style={styles.addNursePill}
          activeOpacity={0.8}
          onPress={onAddNursePress}
        >
          <View style={styles.addIconCircle}>
            <Ionicons name="add" size={20} color={COLORS.textDark} />
          </View>
          <Text style={styles.addNurseLabel}>Add nurse</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const createStyles = (COLORS: ThemeColors) => (StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    color: COLORS.textDark,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: SPACING.md,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingRight: SPACING.md,
  },
  memberPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceCard,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    minWidth: 125,
  },
  avatarBorder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORS.emeraldLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  avatar: {
    backgroundColor: COLORS.emeraldLight,
  },
  avatarLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  memberInfo: {
    justifyContent: 'center',
  },
  memberName: {
    color: COLORS.textDark,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  memberSub: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  addNursePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceCard,
    paddingHorizontal: SPACING.md + 2,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderStyle: 'dashed',
    minHeight: 52,
  },
  addIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    backgroundColor: COLORS.surfaceMuted,
  },
  addNurseLabel: {
    color: COLORS.textDark,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
}));
