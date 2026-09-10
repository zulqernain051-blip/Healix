import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../theme';
import { TimeWindow } from '../../types/care';

interface Props {
  selectedDate: Date | null;
  onDateChange: (date: Date) => void;
  selectedTime: Date | null;
  onTimeChange: (time: Date | null) => void;
  selectedTimeWindow: TimeWindow | null;
  onTimeWindowChange: (window: TimeWindow | null) => void;
  isRecurring?: boolean;
}

const TIME_WINDOWS: { label: string; value: TimeWindow }[] = [
  { label: 'Morning', value: 'MORNING' },
  { label: 'Afternoon', value: 'AFTERNOON' },
  { label: 'Evening', value: 'EVENING' },
  { label: 'Night', value: 'NIGHT' },
  { label: 'Flexible', value: 'FLEXIBLE' },
];

export const DateTimePreferencePicker: React.FC<Props> = ({
  selectedDate,
  onDateChange,
  selectedTime,
  onTimeChange,
  selectedTimeWindow,
  onTimeWindowChange,
  isRecurring = false,
}) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

  // When a specific time is picked, clear the time window.
  const handleConfirmTime = (time: Date) => {
    onTimeChange(time);
    onTimeWindowChange(null);
    setTimePickerVisibility(false);
  };

  // When a time window is picked, clear the specific time.
  const handleSelectWindow = (window: TimeWindow) => {
    onTimeWindowChange(window);
    onTimeChange(null);
  };

  const webInputStyle = {
    padding: '12px',
    borderRadius: '8px',
    border: `1px solid ${COLORS.border}`,
    backgroundColor: '#000000',
    color: '#FFFFFF',
    fontSize: '16px',
    width: '100%',
    fontFamily: 'inherit',
    colorScheme: 'dark',
  };

  return (
    <View style={styles.container}>
      {!isRecurring && (
        <View style={styles.section}>
          <Text style={styles.label}>Preferred Date *</Text>
          {Platform.OS === 'web' ? (
            <input 
              type="date" 
              style={webInputStyle}
              min={new Date().toISOString().split('T')[0]}
              value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
              onChange={(e) => {
                if (e.target.value) {
                  const [y, m, d] = e.target.value.split('-');
                  onDateChange(new Date(parseInt(y), parseInt(m) - 1, parseInt(d)));
                }
              }}
            />
          ) : (
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setDatePickerVisibility(true)}
              activeOpacity={0.7}
            >
              <Text style={selectedDate ? styles.pickerText : styles.placeholderText}>
                {selectedDate ? selectedDate.toLocaleDateString() : 'Select a date'}
              </Text>
              <Text style={styles.icon}>📅</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.label}>Preferred Time (Choose One) *</Text>
        
        {/* Specific Time Picker */}
        {Platform.OS === 'web' ? (
            <input 
              type="time" 
              style={webInputStyle}
              value={selectedTime ? selectedTime.toTimeString().substring(0,5) : ''}
              onChange={(e) => {
                if (e.target.value) {
                  const [h, m] = e.target.value.split(':');
                  const d = new Date();
                  d.setHours(parseInt(h), parseInt(m), 0, 0);
                  handleConfirmTime(d);
                }
              }}
            />
        ) : (
          <TouchableOpacity
            style={[styles.pickerButton, selectedTime && styles.pickerButtonActive]}
            onPress={() => setTimePickerVisibility(true)}
            activeOpacity={0.7}
          >
            <Text style={selectedTime ? styles.pickerTextActive : styles.placeholderText}>
              {selectedTime
                ? `Specific Time: ${selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'Select a specific time'}
            </Text>
            <Text style={styles.icon}>🕒</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.orText}>- OR -</Text>

        {/* Time Windows */}
        <View style={styles.windowGrid}>
          {TIME_WINDOWS.map((win) => {
            const isActive = selectedTimeWindow === win.value;
            return (
              <TouchableOpacity
                key={win.value}
                style={[styles.windowPill, isActive && styles.windowPillActive]}
                onPress={() => handleSelectWindow(win.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.windowText, isActive && styles.windowTextActive]}>
                  {win.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {Platform.OS === 'web' ? (
        <View style={{ display: 'none' }}>
          {/* We use hidden inputs with refs or just inline on-change for Web if we were using raw HTML, but in React Native Web we can use createElement or just rely on native input types if we map them. 
          Actually, React Native Web supports type="date" on TextInput! */}
        </View>
      ) : (
        <>
          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={(d) => {
              onDateChange(d);
              setDatePickerVisibility(false);
            }}
            onCancel={() => setDatePickerVisibility(false)}
            minimumDate={new Date()}
          />

          <DateTimePickerModal
            isVisible={isTimePickerVisible}
            mode="time"
            onConfirm={handleConfirmTime}
            onCancel={() => setTimePickerVisibility(false)}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  section: {
    marginBottom: SPACING.md,
  },
  label: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    fontWeight: '600',
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  pickerButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  pickerText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.text,
  },
  pickerTextActive: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.primary,
    fontWeight: '600',
  },
  placeholderText: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
  },
  icon: {
    fontSize: 18,
  },
  orText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginVertical: SPACING.sm,
  },
  windowGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  windowPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: RADIUS.round,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.2)',
  },
  windowPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  windowText: {
    ...TYPOGRAPHY.bodySmall,
    color: '#FFFFFF',
  },
  windowTextActive: {
    color: COLORS.background,
    fontWeight: 'bold',
  },
});
