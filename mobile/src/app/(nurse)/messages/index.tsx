import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { navigate } from '../../../utils/navigation';
import { useConversations } from '../../../hooks/useMessages';

export default function NurseMessagesScreen() {
  const { data: conversations, isLoading } = useConversations();
  const [searchQuery, setSearchQuery] = useState('');

  const threads = Array.isArray(conversations) ? conversations : (conversations?.data || []);

  const filteredConversations = threads.filter((c: any) =>
    c.otherParticipant?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.otherParticipant?.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#061C19" />
      
      {/* Header */}
      <View style={styles.headerBox}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or role..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.body}>
        {/* Conversation List */}
        <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <ActivityIndicator color="#00E676" size="large" style={{ marginTop: 40 }} />
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((item: any) => (
              <TouchableOpacity
                key={item.threadId}
                style={styles.conversationCard}
                onPress={() => navigate('/(nurse)/messages/chat', { 
                  threadId: item.threadId, 
                  name: item.otherParticipant.name, 
                  role: item.otherParticipant.role 
                })}
                activeOpacity={0.8}
              >
                <Avatar.Text
                  size={46}
                  label={item.otherParticipant.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                  style={styles.avatarBg}
                  color="#00E676"
                />
                <View style={styles.chatInfo}>
                  <View style={styles.nameTimeRow}>
                    <Text style={styles.chatName}>{item.otherParticipant.name}</Text>
                    <Text style={styles.chatTime}>
                      {item.latestMessage?.sentAt ? new Date(item.latestMessage.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </Text>
                  </View>
                  <Text style={styles.roleText}>{item.otherParticipant.role}</Text>
                  <View style={styles.msgBadgeRow}>
                    <Text style={styles.lastMsg} numberOfLines={1}>
                      {item.latestMessage?.contentUrlOrText || 'No messages yet'}
                    </Text>
                    {item.unreadCount > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyTitle}>No Messages Yet</Text>
              <Text style={styles.emptySub}>
                Direct messages with assigned patients and doctors will appear here.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#061C19' },
  headerBox: { padding: 20, paddingBottom: 30, backgroundColor: '#061C19' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  headerTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, color: '#1E293B', fontSize: 14 },
  body: { flex: 1, backgroundColor: '#F8FAFC', borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' },
  listContainer: { padding: 20, paddingBottom: 80, gap: 16 },
  conversationCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  avatarBg: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#00E676' },
  chatInfo: { marginLeft: 16, flex: 1 },
  nameTimeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatName: { color: '#1E293B', fontSize: 16, fontWeight: '700' },
  chatTime: { color: '#64748B', fontSize: 11 },
  roleText: { color: '#00E676', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  msgBadgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lastMsg: { color: '#475569', fontSize: 13, flex: 1, marginRight: 8 },
  unreadBadge: { backgroundColor: '#EF4444', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  unreadBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  emptyState: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 20 },
  emptyIcon: { fontSize: 44, marginBottom: 12 },
  emptyTitle: { color: '#1E293B', fontSize: 18, fontWeight: '700' },
  emptySub: { color: '#64748B', fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 20 },
});
