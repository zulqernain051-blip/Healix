import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

interface AssignedStaffCardProps {
  name: string;
  role: string;
  rating?: number;
  onChatPress: () => void;
  onCallPress: () => void;
}

export const AssignedStaffCard: React.FC<AssignedStaffCardProps> = ({
  name,
  role,
  rating = 4.8,
  onChatPress,
  onCallPress,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Avatar.Icon size={50} icon="account-heart" style={styles.avatar} color="#00E676" />
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.role}>{role}</Text>
        </View>
        <View style={styles.ratingBadge}>
          <Text style={styles.starIcon}>⭐</Text>
          <Text style={styles.ratingText}>{rating}</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.chatBtn} onPress={onChatPress} activeOpacity={0.8}>
          <Text style={styles.chatBtnText}>💬 Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.callBtn} onPress={onCallPress} activeOpacity={0.8}>
          <Text style={styles.callBtnText}>📞 Call</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0A2D28',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.15)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatar: {
    backgroundColor: '#051815',
  },
  info: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  name: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
  },
  role: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  starIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  ratingText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  chatBtn: {
    flex: 1,
    backgroundColor: 'rgba(0, 230, 118, 0.15)',
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00E676',
  },
  chatBtnText: {
    color: '#00E676',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
  },
  callBtn: {
    flex: 1,
    backgroundColor: '#00E676',
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  callBtnText: {
    color: '#061C19',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
  },
});
