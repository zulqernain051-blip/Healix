import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../../../store/auth';
import { useNurseVerification, useUploadDocument } from '../../../hooks/useNurse';
import {
  CHECK_ITEMS,
  DocKey,
  DocStatus,
  PALETTE,
  DocumentPreview,
  DocumentUploadStep,
  VerificationHeader,
  VerificationSubmit,
} from '../../../components/nurse/verification';

export default function NurseVerificationScreen() {
  const { user } = useAuthStore();
  const nurseId = user?.nurseId || user?.id || '';
  
  const { data: verificationStatus, isLoading } = useNurseVerification(nurseId);
  const { mutateAsync: uploadDocument } = useUploadDocument();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDocKey, setSelectedDocKey] = useState<DocKey | null>(null);

  const handleOpenModal = (key: DocKey) => {
    setSelectedDocKey(key);
    setModalVisible(true);
  };

  const handleUpload = async (url: string) => {
    if (!selectedDocKey || !nurseId) return;
    await uploadDocument({
      nurseId,
      data: {
        documentType: selectedDocKey,
        fileUrl: url,
      },
    });
  };

  const isFullyVerified =
    verificationStatus &&
    CHECK_ITEMS.every(
      (item) => (verificationStatus.checks?.[item.key] as { status: DocStatus })?.status === 'APPROVED',
    );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Background gradient blobs */}
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <VerificationHeader
          userName={user?.fullName ?? 'Nurse'}
          isFullyVerified={isFullyVerified ?? null}
        />

        {/* Section label */}
        <Text style={styles.sectionLabel}>Required Documents</Text>

        {/* Loading state */}
        {isLoading && (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={PALETTE.teal} />
            <Text style={styles.loadingText}>Fetching verification status…</Text>
          </View>
        )}

        {/* Document Cards */}
        {!isLoading &&
          CHECK_ITEMS.map((item, index) => {
            const entry = verificationStatus?.checks?.[item.key] as
              | { status: DocStatus; rejectionReason?: string }
              | undefined;
            const status: DocStatus = entry?.status ?? 'NOT_SUBMITTED';
            const rejectionReason = entry?.rejectionReason;

            return (
              <DocumentPreview
                key={item.key}
                item={item}
                status={status}
                rejectionReason={rejectionReason}
                onSubmit={() => handleOpenModal(item.key)}
                index={index}
              />
            );
          })}

        {/* Footer note */}
        {!isLoading && <VerificationSubmit />}
      </ScrollView>

      {/* Upload Modal */}
      <DocumentUploadStep
        visible={modalVisible}
        docKey={selectedDocKey}
        onClose={() => setModalVisible(false)}
        onUpload={handleUpload}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.bg,
  },
  blobTop: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: PALETTE.teal + '18',
  },
  blobBottom: {
    position: 'absolute',
    bottom: -60,
    left: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: PALETTE.blue + '14',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 48,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: PALETTE.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  loadingWrap: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 14,
  },
  loadingText: {
    color: PALETTE.muted,
    fontSize: 14,
  },
});
