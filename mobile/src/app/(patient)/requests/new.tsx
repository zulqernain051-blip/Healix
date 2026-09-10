import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import { navigate, goBack } from '../../../utils/navigation';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../../theme';

import { RequestTemplateSelector, RequestTemplate } from '../../../components/care/RequestTemplateSelector';
import { ScheduleTypeSelector } from '../../../components/care/ScheduleTypeSelector';
import { DateTimePreferencePicker } from '../../../components/care/DateTimePreferencePicker';
import { LocationPicker } from '../../../components/care/LocationPicker';
import { useCreateCareRequest } from '../../../hooks/useCareRequests';
import { CreateCareRequestDto, ScheduleType, TimeWindow } from '../../../types/care';
import { useAuthStore } from '../../../store/auth';

import { usePatientProfile } from '../../../hooks/usePatient';

export default function NewCareRequestScreen() {
  const createCareRequest = useCreateCareRequest();
  const { user } = useAuthStore();
  const { data: patientProfile } = usePatientProfile(user?.patientId || '');

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // Form State
  const [notes, setNotes] = useState('');
  const [requirements, setRequirements] = useState('');
  const [duration, setDuration] = useState('45');
  
  const [scheduleType, setScheduleType] = useState<ScheduleType>('ONE_TIME');
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [selectedTimeWindow, setSelectedTimeWindow] = useState<TimeWindow | null>(null);
  
  const [location, setLocation] = useState({
    address: 'Default Home Address',
    latitude: 31.5204,
    longitude: 74.3587,
  });

  // Effect to sync address
  React.useEffect(() => {
    if (patientProfile?.address) {
      setLocation(prev => ({ ...prev, address: patientProfile.address }));
    }
  }, [patientProfile]);

  const [recurringFrequency, setRecurringFrequency] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('WEEKLY');
  const [occurrencesLimit, setOccurrencesLimit] = useState('4');

  const handleSelectTemplate = (tpl: RequestTemplate | null) => {
    setSelectedTemplateId(tpl ? tpl.id : null);
    if (tpl) {
      setNotes(tpl.defaultNotes);
      setRequirements(tpl.preferredSpecialization);
      setDuration(tpl.recommendedDuration.toString());
    } else {
      setNotes('');
      setRequirements('');
      setDuration('45');
    }
  };

  const isFormValid = () => {
    if (!selectedDate) return false;
    if (!selectedTime && !selectedTimeWindow) return false;
    if (!location.address.trim()) return false;
    if (isNaN(parseInt(duration)) || parseInt(duration) <= 0) return false;
    if (scheduleType === 'RECURRING' && (isNaN(parseInt(occurrencesLimit)) || parseInt(occurrencesLimit) <= 0)) return false;
    return true;
  };

  const handleSubmit = () => {
    if (!isFormValid()) return;

    let timeStr: string | undefined = undefined;
    if (selectedTime) {
      timeStr = selectedTime.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' });
    }

    const payload: CreateCareRequestDto = {
      type: 'NURSE_VISIT', // Currently fixed for patient flow
      notes: notes.trim(),
      requirements: requirements.trim(),
      scheduleType,
      durationMinutes: parseInt(duration),
      location,
    };

    if (selectedDate) {
      const futureDate = new Date(selectedDate);
      if (selectedTime) {
        futureDate.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
      } else {
        futureDate.setHours(23, 59, 59, 999);
      }
      if (futureDate <= new Date()) {
        futureDate.setTime(Date.now() + 60000); // +1 min
      }
      
      if (scheduleType === 'ONE_TIME') {
        payload.preferredDate = futureDate.toISOString();
      } else {
        payload.recurring = {
          startDate: futureDate.toISOString(),
          frequency: recurringFrequency,
          occurrencesLimit: parseInt(occurrencesLimit) || 4
        };
      }
    }

    if (timeStr) {
      payload.preferredStartTime = timeStr;
    } else if (selectedTimeWindow) {
      payload.preferredTimeWindow = selectedTimeWindow;
    }

    createCareRequest.mutate(payload, {
      onSuccess: () => {
        if (Platform.OS === 'web') {
          alert('Request Published! Your visit request is now live.');
          goBack();
        } else {
          Alert.alert('Success', 'Request Published!', [{ text: 'OK', onPress: () => goBack() }]);
        }
      },
      onError: (err: any) => {
        if (Platform.OS === 'web') {
          alert(`Error: ${err.message || 'Failed to create request'}`);
        } else {
          Alert.alert('Error', err.message || 'Failed to create request');
        }
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#061C19" />
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Request</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Select a Template</Text>
        <RequestTemplateSelector
          selectedTemplateId={selectedTemplateId}
          onSelect={handleSelectTemplate}
        />

        <View style={styles.card}>
          <Text style={styles.label}>Notes / Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your medical needs..."
            placeholderTextColor={COLORS.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
          />

          <Text style={styles.label}>Special Requirements (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Female Nurse, Wound Care Specialist"
            placeholderTextColor={COLORS.textSecondary}
            value={requirements}
            onChangeText={setRequirements}
          />

          <Text style={styles.label}>Expected Duration (minutes)</Text>
          <TextInput
            style={styles.input}
            placeholder="45"
            placeholderTextColor={COLORS.textSecondary}
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.card}>
          <ScheduleTypeSelector scheduleType={scheduleType} onChange={setScheduleType} />

          <DateTimePreferencePicker
            isRecurring={false} // Always false so we can pick start date for recurring as well
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            selectedTime={selectedTime}
            onTimeChange={setSelectedTime}
            selectedTimeWindow={selectedTimeWindow}
            onTimeWindowChange={setSelectedTimeWindow}
          />
          
          {scheduleType === 'RECURRING' && (
            <View style={{ marginTop: SPACING.md }}>
              <Text style={styles.label}>Frequency</Text>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                {['DAILY', 'WEEKLY', 'MONTHLY'].map(freq => (
                  <TouchableOpacity
                    key={freq}
                    style={[
                      styles.input, 
                      { flex: 1, alignItems: 'center', marginBottom: 0, padding: 10 }, 
                      recurringFrequency === freq && { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '20' }
                    ]}
                    onPress={() => setRecurringFrequency(freq as any)}
                  >
                    <Text style={{ color: recurringFrequency === freq ? COLORS.primary : COLORS.textSecondary }}>{freq}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.label}>Occurrences Limit</Text>
              <TextInput
                style={styles.input}
                value={occurrencesLimit}
                onChangeText={setOccurrencesLimit}
                keyboardType="numeric"
              />
            </View>
          )}
        </View>

        <View style={styles.card}>
          <LocationPicker
            location={location}
            onChange={setLocation}
            savedAddress={'Default Home Address'}
          />
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={createCareRequest.isPending}
          disabled={!isFormValid() || createCareRequest.isPending}
          style={styles.submitBtn}
          contentStyle={styles.submitBtnContent}
          labelStyle={styles.submitBtnLabel}
        >
          Submit Request
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#061C19',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: '#061C19',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  backBtnText: {
    color: '#FFF',
    fontSize: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
  },
  container: {
    padding: SPACING.md,
    paddingBottom: 40,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: '#FFFFFF',
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: '#0A2D28',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.15)',
  },
  label: {
    ...TYPOGRAPHY.bodyMedium,
    color: '#FFFFFF',
    marginBottom: SPACING.xs,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.2)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: '#FFFFFF',
    marginBottom: SPACING.md,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
  },
  submitBtnContent: {
    paddingVertical: 8,
  },
  submitBtnLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    color: '#061C19',
  },
});
