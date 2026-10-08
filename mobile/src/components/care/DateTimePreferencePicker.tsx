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
    borderRadius: '12px',
    border: `1px solid rgba(255, 255, 255, 0.60)`,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    color: COLORS.textDark,
    fontSize: '15px',
    width: '100%',
    fontFamily: 'inherit',
  };

  const localDate = (date: Date) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');

  return (
    <View style={styles.container}>
      {(
        <View style={styles.section}>
          <Text style={styles.label}>{isRecurring ? 'Start Date *' : 'Preferred Date *'}</Text>
          {Platform.OS === 'web' ? (
            <input 
              type="date" 
              style={webInputStyle}
              min={localDate(new Date())}
              value={selectedDate ? localDate(selectedDate) : ''}
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
        <View style={{ display: 'none' }} />
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
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: SPACING.xs,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.60)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  pickerText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '400',
    color: COLORS.textDark,
  },
  placeholderText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '400',
    color: COLORS.textBody,
  },
  icon: {
    fontSize: 18,
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
    backgroundColor: 'rgba(255, 255, 255, 0.40)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.60)',
  },
  windowPillActive: {
    backgroundColor: COLORS.accentBlue,
    borderColor: COLORS.accentBlue,
  },
  windowText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
    color: COLORS.textDark,
  },
  windowTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
