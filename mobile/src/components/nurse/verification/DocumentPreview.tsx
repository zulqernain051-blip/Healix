import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { CheckItem, DocStatus } from './types';
import { PALETTE } from './constants';
import { StatusBadge } from './StatusBadge';

interface DocCardProps {
  item: CheckItem;
  status: DocStatus;
  rejectionReason?: string;
  onSubmit: () => void;
  index: number;
}

export const DocumentPreview: React.FC<DocCardProps> = ({ item, status, rejectionReason, onSubmit, index }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 420,
        delay: index * 90,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 420,
        delay: index * 90,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const showSubmitBtn = status === 'NOT_SUBMITTED' || status === 'REJECTED';

  return (
    <Animated.View
      style={[
        styles.docCardWrapper,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] },
      ]}
    >
      <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Card style={styles.docCard} mode="contained">
          <Card.Content style={styles.docCardContent}>
            {/* Left: icon + label */}
            <View style={styles.docLeft}>
              <View style={styles.docIconWrap}>
                <Text style={styles.docIcon}>{item.icon}</Text>
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docLabel}>{item.label}</Text>
                <StatusBadge status={status} />
                {status === 'REJECTED' && rejectionReason ? (
                  <Text style={styles.rejectionText}>⚠ {rejectionReason}</Text>
                ) : null}
              </View>
            </View>

            {/* Right: submit button */}
            {showSubmitBtn && (
              <TouchableOpacity style={styles.submitBtn} onPress={onSubmit} activeOpacity={0.78}>
                <Text style={styles.submitBtnText}>
                  {status === 'REJECTED' ? 'Re-upload' : 'Submit'}
                </Text>
              </TouchableOpacity>
            )}
          </Card.Content>
        </Card>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  docCardWrapper: {
    marginBottom: 12,
  },
  docCard: {
    backgroundColor: PALETTE.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  docCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  docLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 12,
  },
  docIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: PALETTE.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: PALETTE.border,
  },
  docIcon: {
    fontSize: 18,
  },
  docInfo: {
    flex: 1,
    gap: 6,
  },
  docLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: PALETTE.white,
  },
  rejectionText: {
    fontSize: 12,
    color: PALETTE.red,
    marginTop: 2,
    lineHeight: 17,
  },
  submitBtn: {
    backgroundColor: PALETTE.teal,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PALETTE.teal,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});
