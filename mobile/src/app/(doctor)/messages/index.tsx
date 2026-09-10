import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Text, Avatar, Button } from 'react-native-paper';
import { navigate } from '../../../utils/navigation';
import { useAuthStore } from '../../../store/auth';
import { useConversations } from '../../../hooks/useMessages';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../../theme';

export default function MessagesListScreen() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: conversations = [], isLoading } = useConversations();

  const filteredConversations = conversations.filter(c =>
    c.otherParticipant?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#061C19" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Clinical Consultation Messages</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor="#6B8E8A"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Conversation List */}
        {isLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#00E676" />
            <Text style={{ marginTop: 12, color: '#64748B' }}>Loading conversations...</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
            {filteredConversations.length > 0 ? (
              filteredConversations.map((item) => (
                <TouchableOpacity
                  key={item.threadId}
                  style={styles.conversationCard}
                  onPress={() => navigate('/(doctor)/messages/chat', { 
                    threadId: item.threadId, 
                    name: item.otherParticipant.name, 
                    role: item.otherParticipant.role 
                  })}
                  activeOpacity={0.8}
                >
                  <Avatar.Text
                    size={46}
                    label={(item.otherParticipant?.name || 'U').split(' ').map((n: string) => n[0]).join('')}
                    style={styles.avatarBg}
                    color="#00E676"
                  />
                  <View style={styles.chatInfo}>
                    <View style={styles.nameTimeRow}>
                      <Text style={styles.chatName}>{item.otherParticipant?.name}</Text>
                      <Text style={styles.chatTime}>
                        {new Date(item.latestMessage?.sentAt || item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                    <Text style={styles.roleText}>{item.otherParticipant?.role}</Text>
                    <Text style={styles.lastMsg} numberOfLines={1}>
                      {item.latestMessage?.contentUrlOrText || 'No messages yet'}
                    </Text>
                  </View>
                  {item.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{item.unreadCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>💬</Text>
                <Text style={styles.emptyTitle}>No Active Consultations</Text>
                <Text style={styles.emptySub}>
                  Direct messages with assigned nurses and escalated patients will appear here.
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#061C19' },
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl, paddingBottom: SPACING.md, backgroundColor: '#061C19' },
  headerTitle: { color: '#FFF', fontSize: 22, fontWeight: '800' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0A2D28', margin: SPACING.md, paddingHorizontal: SPACING.md, borderRadius: RADIUS.md, height: 44, borderWidth: 1, borderColor: '#0D4039' },
  searchIcon: { fontSize: 16, marginRight: 8, color: '#6B8E8A' },
  searchInput: { flex: 1, color: '#FFF', fontSize: 14 },
  listContainer: { padding: SPACING.md, paddingBottom: 100 },
  conversationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: SPACING.md, borderRadius: RADIUS.lg, marginBottom: SPACING.sm, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
  avatarBg: { backgroundColor: '#F0FDF4', marginRight: 12 },
  chatInfo: { flex: 1 },
  nameTimeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  chatName: { color: '#0F172A', fontSize: 16, fontWeight: '700' },
  chatTime: { color: '#64748B', fontSize: 11, fontWeight: '500' },
  roleText: { color: '#00E676', fontSize: 12, fontWeight: '600', marginBottom: 2 },
  lastMsg: { color: '#475569', fontSize: 14, fontWeight: '400' },
  unreadBadge: { backgroundColor: '#00E676', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 8 },
  unreadText: { color: '#061C19', fontSize: 11, fontWeight: '800' },
  emptyState: { alignItems: 'center', marginTop: 60, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 16, opacity: 0.8 },
  emptyTitle: { color: '#0F172A', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySub: { color: '#64748B', fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
