import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { navigate } from '../../../utils/navigation';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../../theme';

export default function NurseTabsLayout() {
  const [moreVisible, setMoreVisible] = useState(false);

  const handleMoreItemPress = (path: any) => {
    setMoreVisible(false);
    navigate(path);
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#071E1C',
            borderTopWidth: 1,
            borderTopColor: 'rgba(0, 230, 118, 0.15)',
            height: 65,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarActiveTintColor: '#00E676',
          tabBarInactiveTintColor: '#6B8E8A',
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="visits"
          options={{
            title: 'Visits',
            tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'medkit' : 'medkit-outline'} size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="marketplace"
          options={{
            title: 'Marketplace',
            tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'briefcase' : 'briefcase-outline'} size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="messages"
          options={{
            title: 'Messages',
            tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="more"
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setMoreVisible(true);
            },
          }}
          options={{
            title: 'More',
            tabBarIcon: ({ color }) => <Ionicons name="ellipsis-horizontal-circle-outline" size={24} color={color} />,
          }}
        />
      </Tabs>

      {/* More Menu Bottom Sheet / Modal */}
      <Modal
        visible={moreVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMoreVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMoreVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.menuContainer}>
                <View style={styles.menuHeader}>
                  <Text style={styles.menuTitle}>Nurse Options</Text>
                  <TouchableOpacity onPress={() => setMoreVisible(false)} style={styles.closeBtn}>
                    <Ionicons name="close" size={24} color="#94A3B8" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.menuItem} onPress={() => handleMoreItemPress('/(nurse)/ai')}>
                  <View style={[styles.iconBox, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}>
                    <Ionicons name="sparkles" size={22} color="#38BDF8" />
                  </View>
                  <View style={styles.menuItemText}>
                    <Text style={styles.menuItemTitle}>AI Assistant</Text>
                    <Text style={styles.menuItemSub}>Clinical support & insights</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#6B8E8A" />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.menuItem} onPress={() => handleMoreItemPress('/(nurse)/patients')}>
                  <View style={[styles.iconBox, { backgroundColor: 'rgba(168, 85, 247, 0.1)' }]}>
                    <Ionicons name="people" size={22} color="#A855F7" />
                  </View>
                  <View style={styles.menuItemText}>
                    <Text style={styles.menuItemTitle}>Patients</Text>
                    <Text style={styles.menuItemSub}>Active patient roster</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#6B8E8A" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => handleMoreItemPress('/(nurse)/schedule')}>
                  <View style={[styles.iconBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                    <Ionicons name="calendar" size={22} color="#EF4444" />
                  </View>
                  <View style={styles.menuItemText}>
                    <Text style={styles.menuItemTitle}>Schedule</Text>
                    <Text style={styles.menuItemSub}>Shifts and availability</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#6B8E8A" />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.menuItem} onPress={() => handleMoreItemPress('/(nurse)/sync')}>
                  <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                    <Ionicons name="sync" size={22} color="#10B981" />
                  </View>
                  <View style={styles.menuItemText}>
                    <Text style={styles.menuItemTitle}>Data Sync</Text>
                    <Text style={styles.menuItemSub}>Offline mode & syncing</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#6B8E8A" />
                </TouchableOpacity>

              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(3, 18, 16, 0.7)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#061C19',
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 230, 118, 0.2)',
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  menuTitle: {
    ...TYPOGRAPHY.h3,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuItemSub: {
    color: '#94A3B8',
    fontSize: 12,
  },
});

