import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { RADIUS, SPACING } from '../../theme';

interface OfflineSyncStatusBannerProps {
  pendingUploadsCount: number;
  lastSyncedTime?: string;
  onSyncPress: () => void;
  isSyncing?: boolean;
}

export const OfflineSyncStatusBanner: React.FC<OfflineSyncStatusBannerProps> = ({
  pendingUploadsCount,
  lastSyncedTime = 'Just now',
  onSyncPress,
  isSyncing = false,
}) => {
  if (pendingUploadsCount === 0) return null;

  return (
    <View style={styles.banner}>
      <View style={styles.infoCol}>
        <View style={styles.titleRow}>
          <Text style={styles.icon}>📡</Text>
          <Text style={styles.title}>{pendingUploadsCount} Pending Offline Uploads</Text>
        </View>
        <Text style={styles.subText}>Last synced: {lastSyncedTime}</Text>
      </View>

      <TouchableOpacity
        style={styles.syncBtn}
        onPress={onSyncPress}
        disabled={isSyncing}
        activeOpacity={0.8}
      >
        <Text style={styles.syncBtnText}>{isSyncing ? 'Syncing...' : 'Sync Now'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#1E180E',
    borderColor: '#F59E0B',
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  infoCol: {
    flex: 1,
    marginRight: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  icon: {
    fontSize: 14,
    marginRight: 6,
  },
  title: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '700',
  },
  subText: {
    color: '#94A3B8',
    fontSize: 10,
  },
  syncBtn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
  },
  syncBtnText: {
    color: '#061C19',
    fontSize: 11,
    fontWeight: '700',
  },
});
