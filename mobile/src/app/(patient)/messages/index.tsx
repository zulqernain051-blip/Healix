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
import { useAuthStore } from '../../../store/auth';
import { useConversations } from '../../../hooks/useMessages';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../../theme';

export default function MessagesScreen() {
  const { user } = useAuthStore();
  const { data: conversations, isLoading } = useConversations();
  const [searchQuery, setSearchQuery] = useState('');

  // Extract threads from response (handle both wrapped and unwrapped array)
  const threads = Array.isArray(conversations) 
    ? conversations 
    : (conversations?.data || []);

  const filteredConversations = threads.filter((c: any) => {
    const nameMatch = c.otherParticipant?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const roleMatch = c.otherParticipant?.role?.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || roleMatch;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#061C19" />
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Messages</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or role..."
            placeholderTextColor="#6B8E8A"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Conversation List */}
        <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <ActivityIndicator color="#00E676" size="large" style={{ marginTop: 40 }} />
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((item: any) => (
              <TouchableOpacity
                key={item.threadId}
                style={styles.conversationCard}
                onPress={() => navigate('/(patient)/messages/chat', { 
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
                  <View style={styles.roleRow}>
                    <Text style={styles.roleText}>{item.otherParticipant.role}</Text>
                  </View>
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
              <Text style={styles.emptyTitle}>No Conversations Found</Text>
              <Text style={styles.emptySub}>
                You don't have any messages yet.
              </Text>
            </View>
          )}
        </ScrollView>
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
  headerTitle: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A2D28',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.15)',
  },
  searchIcon: {
    fontSize: 14,
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  listContainer: {
    paddingBottom: 80,
    gap: SPACING.md,
  },
  conversationCard: {
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
  chatInfo: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  nameTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatName: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '700',
  },
  chatTime: {
    color: '#6B8E8A',
    fontSize: 10,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  roleText: {
    color: '#00E676',
    fontSize: 11,
    fontWeight: '600',
  },
  msgBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMsg: {
    color: '#94A3B8',
    fontSize: 11,
    flex: 1,
    marginRight: SPACING.xs,
  },
  unreadBadge: {
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 44,
    marginBottom: 12,
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
    marginTop: 6,
    lineHeight: 16,
  },
});
