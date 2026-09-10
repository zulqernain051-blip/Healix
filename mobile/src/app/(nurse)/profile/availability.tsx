import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
  Modal
} from 'react-native';
import { useAuthStore } from '../../../store/auth';
import { useNurseAvailability, useAddAvailability, useDeleteAvailability } from '../../../hooks/useNurse';

const COLORS = {
  bg: '#0A1628',
  card: '#111D35',
  border: '#1E2D4A',
  teal: '#0D9488',
  emerald: '#10B981',
  amber: '#F59E0B',
  blue: '#3B82F6',
  red: '#EF4444',
  inputBg: '#0F2137',
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#475569'
};

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_COLORS = ['#7C3AED', '#0D9488', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

interface SlotFormValues {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

function groupSlotsByDay(slots: any[]) {
  const grouped: Record<number, any[]> = {};
  for (const slot of slots) {
    if (!grouped[slot.dayOfWeek]) grouped[slot.dayOfWeek] = [];
    grouped[slot.dayOfWeek].push(slot);
  }
  return grouped;
}

function isValidTime(t: string): boolean {
  return /^\d{2}:\d{2}$/.test(t);
}

export default function AvailabilityScreen() {
  const { user } = useAuthStore();
  const nurseId = user?.nurseId || user?.id || '';
  
  const { data: slots, isLoading, error } = useNurseAvailability(nurseId);
  const { mutateAsync: addAvailabilitySlot } = useAddAvailability();
  const { mutateAsync: deleteAvailabilitySlot } = useDeleteAvailability();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<SlotFormValues>({ dayOfWeek: 1, startTime: '', endTime: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error.message);
    }
  }, [error]);

  const handleAddSlot = async () => {
    setFormError('');
    if (!isValidTime(form.startTime)) {
      setFormError('Start time must be in HH:MM format (e.g. 09:00)');
      return;
    }
    if (!isValidTime(form.endTime)) {
      setFormError('End time must be in HH:MM format (e.g. 17:00)');
      return;
    }
    if (form.startTime >= form.endTime) {
      setFormError('Start time must be earlier than end time');
      return;
    }
    setSaving(true);
    try {
      await addAvailabilitySlot({ nurseId, data: form });
      setShowForm(false);
      setForm({ dayOfWeek: 1, startTime: '', endTime: '' });
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlot = (slotId: string, dayOfWeek: number) => {
    Alert.alert(
      'Delete Slot',
      'Are you sure you want to remove this availability slot?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await deleteAvailabilitySlot({ nurseId, slotId });
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          } 
        }
      ]
    );
  };

  const safeSlots = slots || [];
  const grouped = groupSlotsByDay(safeSlots);
  const sortedDays = Object.keys(grouped).map(Number).sort();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>📅 Availability Schedule</Text>
          <Text style={styles.subtitle}>Manage your weekly working hours</Text>
        </View>

        {/* Add Slot Button */}
        <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)}>
          <Text style={styles.addButtonText}>+ Add Time Slot</Text>
        </TouchableOpacity>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>
            You have <Text style={styles.summaryHighlight}>{safeSlots.length} slot{safeSlots.length !== 1 ? 's' : ''}</Text> across{' '}
            <Text style={styles.summaryHighlight}>{sortedDays.length} day{sortedDays.length !== 1 ? 's' : ''}</Text>
          </Text>
        </View>

        {/* Loading */}
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.teal} style={{ marginTop: 32 }} />
        ) : safeSlots.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🗓️</Text>
            <Text style={styles.emptyTitle}>No Slots Added Yet</Text>
            <Text style={styles.emptyText}>Tap "Add Time Slot" above to set your working hours for each day.</Text>
          </View>
        ) : (
          sortedDays.map((day: any) => (
            <View key={day} style={styles.dayGroup}>
              <View style={[styles.dayHeader, { backgroundColor: DAY_COLORS[day] + '22', borderLeftColor: DAY_COLORS[day] }]}>
                <Text style={[styles.dayName, { color: DAY_COLORS[day] }]}>{DAY_NAMES[day]}</Text>
                <Text style={styles.slotCount}>{grouped[day].length} slot{grouped[day].length > 1 ? 's' : ''}</Text>
              </View>
              {grouped[day].map((slot: any) => (
                <View key={slot.id} style={styles.slotRow}>
                  <View style={styles.slotTime}>
                    <Text style={styles.slotTimeText}>⏰ {slot.startTime} — {slot.endTime}</Text>
                  </View>
                  <TouchableOpacity style={styles.deleteSlotBtn} onPress={() => handleDeleteSlot(slot.id, day)}>
                    <Text style={styles.deleteSlotText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Slot Modal */}
      <Modal visible={showForm} transparent animationType="slide" onRequestClose={() => setShowForm(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Availability Slot</Text>

            {/* Day Picker */}
            <Text style={styles.formLabel}>Day of Week</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayPicker}>
              {DAY_NAMES.map((dayName, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.dayChip, form.dayOfWeek === idx && { backgroundColor: COLORS.teal }]}
                  onPress={() => setForm(f => ({ ...f, dayOfWeek: idx }))}
                >
                  <Text style={[styles.dayChipText, form.dayOfWeek === idx && { color: '#fff', fontWeight: '700' }]}>
                    {dayName.slice(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Start Time */}
            <Text style={styles.formLabel}>Start Time (HH:MM)</Text>
            <TextInput
              style={styles.formInput}
              placeholder="09:00"
              placeholderTextColor={COLORS.textMuted}
              value={form.startTime}
              onChangeText={(v) => setForm(f => ({ ...f, startTime: v }))}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />

            {/* End Time */}
            <Text style={styles.formLabel}>End Time (HH:MM)</Text>
            <TextInput
              style={styles.formInput}
              placeholder="17:00"
              placeholderTextColor={COLORS.textMuted}
              value={form.endTime}
              onChangeText={(v) => setForm(f => ({ ...f, endTime: v }))}
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />

            {formError ? <Text style={styles.formError}>{formError}</Text> : null}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowForm(false); setFormError(''); }}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddSlot} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveText}>Add Slot</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 20 },
  title: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '700' },
  subtitle: { color: COLORS.textSecondary, fontSize: 13, marginTop: 4 },
  addButton: {
    backgroundColor: COLORS.teal, borderRadius: 10, padding: 14,
    alignItems: 'center', marginBottom: 16
  },
  addButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  summaryCard: {
    backgroundColor: COLORS.card, borderRadius: 10, padding: 14, marginBottom: 20,
    borderWidth: 1, borderColor: COLORS.border
  },
  summaryText: { color: COLORS.textSecondary, fontSize: 13 },
  summaryHighlight: { color: COLORS.teal, fontWeight: '700' },
  emptyCard: {
    backgroundColor: COLORS.card, borderRadius: 14, padding: 32,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, marginTop: 16
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 8 },
  emptyText: { color: COLORS.textSecondary, fontSize: 13, textAlign: 'center' },
  dayGroup: { marginBottom: 16 },
  dayHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 12, borderRadius: 8, borderLeftWidth: 4, marginBottom: 8
  },
  dayName: { fontSize: 15, fontWeight: '700' },
  slotCount: { color: COLORS.textSecondary, fontSize: 12 },
  slotRow: {
    backgroundColor: COLORS.card, borderRadius: 8, padding: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 6, borderWidth: 1, borderColor: COLORS.border
  },
  slotTime: { flex: 1 },
  slotTimeText: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '600' },
  deleteSlotBtn: { backgroundColor: '#3B1515', borderRadius: 6, padding: 8 },
  deleteSlotText: { color: COLORS.red, fontSize: 14, fontWeight: '700' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end'
  },
  modalCard: {
    backgroundColor: '#131F35', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40
  },
  modalTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 20 },
  formLabel: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  formInput: {
    backgroundColor: COLORS.inputBg, borderRadius: 8, padding: 12,
    color: COLORS.textPrimary, fontSize: 15, borderWidth: 1, borderColor: COLORS.border
  },
  formError: { color: COLORS.red, fontSize: 12, marginTop: 10 },
  dayPicker: { marginBottom: 4 },
  dayChip: {
    backgroundColor: COLORS.card, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8,
    marginRight: 8, borderWidth: 1, borderColor: COLORS.border
  },
  dayChipText: { color: COLORS.textSecondary, fontSize: 13 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: {
    flex: 1, backgroundColor: COLORS.card, borderRadius: 10,
    padding: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border
  },
  cancelText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },
  saveBtn: { flex: 1, backgroundColor: COLORS.teal, borderRadius: 10, padding: 14, alignItems: 'center' },
  saveText: { color: '#fff', fontSize: 14, fontWeight: '700' }
});
