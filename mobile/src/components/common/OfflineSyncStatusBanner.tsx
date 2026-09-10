import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Animated } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

export interface OfflineSyncStatusBannerProps {
  isOnline: boolean;
  pendingSyncCount?: number;
  lastSyncedAt?: string;
  onRetrySync?: () => void;
  isSyncing?: boolean;
}

export const OfflineSyncStatusBanner: React.FC<OfflineSyncStatusBannerProps> = ({
  isOnline,
  pendingSyncCount = 0,
  lastSyncedAt,
  onRetrySync,
  isSyncing = false,
}) => {
  const slideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [isOnline, isSyncing, pendingSyncCount, slideAnim]);

  if (isOnline && pendingSyncCount === 0 && !isSyncing) {
    return null; // Don't render banner if fully online & synced
  }

  const getBannerColor = () => {
    if (!isOnline) return { bg: '#1E1214', border: '#EF4444', text: '#FCA5A5', icon: '📡❌' };
    if (isSyncing) return { bg: '#0A2D28', border: '#0D9488', text: '#5EEAD4', icon: '🔄' };
    return { bg: '#1E1D0A', border: '#F59E0B', text: '#FDE68A', icon: '⏳' };
  };

  const styleConfig = getBannerColor();

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          backgroundColor: styleConfig.bg,
          borderColor: styleConfig.border,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.leftRow}>
        {isSyncing ? (
          <ActivityIndicator size="small" color="#0D9488" style={{ marginRight: 8 }} />
        ) : (
          <Text style={styles.icon}>{styleConfig.icon}</Text>
        )}

        <View style={styles.textWrap}>
          <Text style={[styles.title, { color: styleConfig.text }]}>
            {!isOnline
              ? 'Offline Mode Active'
              : isSyncing
              ? 'Syncing Offline Changes...'
              : `${pendingSyncCount} Pending Sync Items`}
          </Text>

          {lastSyncedAt && (
            <Text style={styles.subText}>
              Last Synced: {new Date(lastSyncedAt).toLocaleTimeString()}
            </Text>
          )}
        </View>
      </View>

      {!isOnline && onRetrySync && (
        <TouchableOpacity
          style={[styles.retryBtn, { borderColor: styleConfig.border }]}
          onPress={onRetrySync}
        >
          <Text style={[styles.retryText, { color: styleConfig.text }]}>Retry</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.xs,
  },
  leftRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  icon: { fontSize: 16, marginRight: SPACING.sm },
  textWrap: { flex: 1 },
  title: { fontSize: TYPOGRAPHY.sizes.xs, fontWeight: '700' },
  subText: { color: '#94A3B8', fontSize: 10, marginTop: 1 },
  retryBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  retryText: { fontSize: 11, fontWeight: '700' },
});
