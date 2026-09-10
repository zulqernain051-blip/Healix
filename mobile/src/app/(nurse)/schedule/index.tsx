// f:/class Data/FYP Project/Proposal/Project/Healix/mobile/src/app/(nurse)/schedule/index.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Simple tab component for Day/Week/Calendar views
const TabButton = ({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={[styles.tabButton, active && styles.tabButtonActive]}>
    <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>{label}</Text>
  </TouchableOpacity>
);

export default function NurseScheduleScreen() {
  const [selectedTab, setSelectedTab] = useState<'DAY' | 'WEEK' | 'CALENDAR'>('DAY');

  const renderContent = () => {
    switch (selectedTab) {
      case 'DAY':
        return <Text style={styles.placeholder}>Day view – list of visits for the selected day.</Text>;
      case 'WEEK':
        return <Text style={styles.placeholder}>Week view – weekly overview of scheduled visits.</Text>;
      case 'CALENDAR':
        return <Text style={styles.placeholder}>Calendar view – month grid with visit markers.</Text>;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Schedule</Text>
      </View>
      <View style={styles.tabBar}>
        <TabButton label="Day" active={selectedTab === 'DAY'} onPress={() => setSelectedTab('DAY')} />
        <TabButton label="Week" active={selectedTab === 'WEEK'} onPress={() => setSelectedTab('WEEK')} />
        <TabButton label="Calendar" active={selectedTab === 'CALENDAR'} onPress={() => setSelectedTab('CALENDAR')} />
      </View>
      <ScrollView style={styles.content}>{renderContent()}</ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#061C19',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#0A2D28',
  },
  title: {
    color: '#00E676',
    fontSize: 24,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#0A2D28',
    paddingVertical: 8,
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  tabButtonActive: {
    backgroundColor: '#00E676',
  },
  tabButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#061C19',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  placeholder: {
    color: '#00E676',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
  },
});
