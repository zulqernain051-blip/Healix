import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import { RADIUS, SPACING, TYPOGRAPHY } from '../../theme';

interface CalendarPickerModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
}

export const CalendarPickerModal: React.FC<CalendarPickerModalProps> = ({
  visible,
  onClose,
  selectedDate,
  onSelectDate,
}) => {
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const renderCalendarDays = () => {
    const cells = [];

    // Blank padding for days before month start
    for (let i = 0; i < firstDay; i++) {
      cells.push(<View key={`blank-${i}`} style={styles.dayCellEmpty} />);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const mm = String(currentMonth + 1).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      const dateStr = `${currentYear}-${mm}-${dd}`;
      const isSelected = selectedDate === dateStr;
      const todayStr = new Date().toISOString().split('T')[0];
      const isPast = dateStr < todayStr;

      cells.push(
        <TouchableOpacity
          key={`day-${day}`}
          disabled={isPast}
          style={[
            styles.dayCell,
            isSelected && styles.dayCellSelected,
            isPast && styles.dayCellDisabled,
          ]}
          onPress={() => {
            onSelectDate(dateStr);
            onClose();
          }}
        >
          <Text
            style={[
              styles.dayText,
              isSelected && styles.dayTextSelected,
              isPast && styles.dayTextDisabled,
            ]}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    return cells;
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.navBtn}>
              <Text style={styles.navText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.monthYearTitle}>
              {monthNames[currentMonth]} {currentYear}
            </Text>
            <TouchableOpacity onPress={handleNextMonth} style={styles.navBtn}>
              <Text style={styles.navText}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Weekday Names Header */}
          <View style={styles.weekRow}>
            {dayNames.map(d => (
              <Text key={d} style={styles.weekDayText}>{d}</Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.grid}>
            {renderCalendarDays()}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button mode="text" textColor="#94A3B8" onPress={onClose}>
              Cancel
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#0A2D28',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.3)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#051815',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navText: {
    color: '#00E676',
    fontSize: 22,
    fontWeight: '800',
  },
  monthYearTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 230, 118, 0.15)',
    paddingBottom: 8,
  },
  weekDayText: {
    width: '14%',
    textAlign: 'center',
    color: '#00E676',
    fontSize: 12,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCellEmpty: {
    width: '14.28%',
    height: 40,
  },
  dayCell: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginVertical: 2,
  },
  dayCellSelected: {
    backgroundColor: '#00E676',
  },
  dayCellDisabled: {
    opacity: 0.3,
  },
  dayText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  dayTextSelected: {
    color: '#061C19',
    fontWeight: '800',
  },
  dayTextDisabled: {
    color: '#6B8E8A',
  },
  actions: {
    marginTop: SPACING.md,
    alignItems: 'flex-end',
  },
});
