import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Linking, Alert } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../store/auth';
import { usePatientProfile, useAddEmergencyContact, useDeleteEmergencyContact } from '../../../hooks/usePatient';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../../theme';
import { AddEmergencyContactModal } from '../../../components/patient/AddEmergencyContactModal';
import { LoadingState } from '../../../components/common/LoadingState';
import { ErrorState } from '../../../components/common/ErrorState';

export default function EmergencyContactsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const patientId = user?.patientId || '';

  const { data: patientProfile, isLoading: isFetching, error, refetch } = usePatientProfile(patientId);
  const { mutateAsync: addContact, isPending: isAdding } = useAddEmergencyContact();
  const { mutateAsync: deleteContact, isPending: isDeleting } = useDeleteEmergencyContact();

  const [showAddModal, setShowAddModal] = useState(false);

  const handleAdd = async (name: string, phone: string, relationship: string) => {
    if (!patientId) return;
    try {
      await addContact({ patientId, data: { name, phone, relationship } });
      Alert.alert('Success', 'Emergency contact added.');
      setShowAddModal(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add emergency contact.');
    }
  };

  const handleDelete = (contactId: string, name: string) => {
    Alert.alert('Delete Contact', `Remove ${name} from emergency contacts?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!patientId) return;
          try {
            await deleteContact({ patientId, contactId });
            Alert.alert('Deleted', 'Emergency contact removed.');
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete contact.');
          }
        },
      },
    ]);
  };

  if (isFetching && !patientProfile) return <LoadingState message="Loading emergency contacts..." />;
  if (error) return <ErrorState error={error as Error} onRetry={refetch} />;

  const contacts = patientProfile?.emergencyContacts || [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#061C19" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Emergency Contacts</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
          {contacts.length > 0 ? (
            contacts.map((contact) => (
              <View key={contact.id} style={styles.contactCard}>
                <Avatar.Text
                  size={48}
                  label={contact.name ? contact.name.split(' ').map((n: string) => n[0]).join('') : 'EC'}
                  style={styles.avatarBg}
                  color="#00E676"
                />

                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactRelation}>{contact.relationship}</Text>
                  <Text style={styles.contactPhone}>{contact.phone}</Text>
                </View>

                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => Linking.openURL(`tel:${contact.phone}`)}
                >
                  <Text style={styles.callIcon}>📞</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(contact.id, contact.name)}
                  disabled={isDeleting}
                >
                  <Text style={[styles.deleteIcon, isDeleting && { opacity: 0.5 }]}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🚨</Text>
              <Text style={styles.emptyTitle}>No Emergency Contacts</Text>
              <Text style={styles.emptySub}>
                Add trusted family members or caregivers to be notified in an emergency.
              </Text>
            </View>
          )}

          {/* Add New Contact Button */}
          <TouchableOpacity style={styles.addContactBtn} onPress={() => setShowAddModal(true)}>
            <Text style={styles.addContactText}>+ Add New Contact</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            These contacts will be notified automatically during emergency SOS triggers.
          </Text>
        </View>

        {/* Modal */}
        <AddEmergencyContactModal
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAdd}
          isLoading={isAdding}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#061C19',
  },
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
  },
  listContainer: {
    paddingBottom: 80,
    gap: SPACING.md,
  },
  contactCard: {
    backgroundColor: '#0A2D28',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.15)',
  },
  avatarBg: {
    backgroundColor: '#051815',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.3)',
  },
  contactInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  contactName: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
  },
  contactRelation: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  contactPhone: {
    color: '#6B8E8A',
    fontSize: 10,
    marginTop: 2,
  },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00E676',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  callIcon: {
    fontSize: 16,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    fontSize: 14,
  },
  addContactBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#00E676',
    borderStyle: 'dashed',
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  addContactText: {
    color: '#00E676',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
  },
  emptySub: {
    color: '#94A3B8',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
  infoBanner: {
    backgroundColor: '#0E3630',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.2)',
    marginBottom: SPACING.xs,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  infoText: {
    color: '#94A3B8',
    fontSize: 11,
    flex: 1,
    lineHeight: 16,
  },
});

