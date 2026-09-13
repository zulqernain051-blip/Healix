import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Text, Avatar, Button } from 'react-native-paper';
import { navigate } from '../../../utils/navigation';
import { useAuthStore } from '../../../store/auth';
import { useConversations, useGetOrCreateThread, useSearchUserByPhone } from '../../../hooks/useMessages';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';

export default function MessagesScreen() {
  const { user } = useAuthStore();
  const { data: conversations, isLoading } = useConversations();
  const [searchQuery, setSearchQuery] = useState('');
  
  // New Chat Modal States
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [phoneSearchQuery, setPhoneSearchQuery] = useState('');
  const [foundUsers, setFoundUsers] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  
  const searchUserMutation = useSearchUserByPhone();
  const createThreadMutation = useGetOrCreateThread();

  // Extract threads from response (handle both wrapped and unwrapped array)
  const threads = Array.isArray(conversations) 
    ? conversations 
    : (conversations?.data || []);

  const filteredConversations = threads.filter((c: any) => {
    const nameMatch = c.otherParticipant?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const roleMatch = c.otherParticipant?.role?.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || roleMatch;
  });

  
  useEffect(() => {
    if (phoneSearchQuery.trim().length >= 10) {
      const delayDebounceFn = setTimeout(() => {
        handleSearchByPhone();
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setFoundUsers([]);
      setHasSearched(false);
    }
  }, [phoneSearchQuery]);

  const handleSearchByPhone = () => {
    if (!phoneSearchQuery.trim()) return;
    setFoundUsers([]);
    setHasSearched(false);
    searchUserMutation.mutate(phoneSearchQuery, {
      onSuccess: (res) => {
        setHasSearched(true);
        const data = res?.data?.data || res?.data || res;
        if (Array.isArray(data)) {
          setFoundUsers(data);
        } else if (data) {
          setFoundUsers([data]);
        }
      },
      onError: () => {
        setHasSearched(true);
        setFoundUsers([]);
      }
    });
  };

  const handleStartChat = (targetUser: any) => {
    if (!targetUser) return;
    
    createThreadMutation.mutate(targetUser.id, {
      onSuccess: (res) => {
        const thread = res?.data?.data;
        setIsModalVisible(false);
        setPhoneSearchQuery('');
        setFoundUsers([]);
        setHasSearched(false);
        if (thread) {
          navigate('/(patient)/messages/chat', { 
            threadId: thread.threadId, 
            name: targetUser.fullName || targetUser.name, 
            role: targetUser.role 
          });
        }
      },
      onError: (err: any) => {
        setIsModalVisible(false);
        const message = err?.message || 'Unable to start chat. Check connection.';
        const status = err?.statusCode || 500;
        
        if (status === 403 || status === 400) {
          Alert.alert('Communication Not Allowed', message);
        } else if (status === 401) {
          Alert.alert('Session Expired', 'Your session has expired. Please log out and sign in again.');
        } else {
          Alert.alert('Error', message);
        }
      }
    });
  };

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
            placeholder="Search active chats..."
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
                You don't have any messages yet. Click the + button to start a new chat.
              </Text>
            </View>
          )}
        </ScrollView>
        
        {/* Floating Action Button */}
        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => setIsModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>

      </View>

      {/* New Chat Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setIsModalVisible(false);
          setFoundUser(null);
          setPhoneSearchQuery('');
        }}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Conversation</Text>
              <TouchableOpacity onPress={() => {
                setIsModalVisible(false);
                setFoundUsers([]);
                setHasSearched(false);
                setPhoneSearchQuery('');
              }}>
                <Ionicons name="close" size={24} color="#6B8E8A" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Find user by phone number</Text>
            <View style={styles.phoneSearchRow}>
              <TextInput
                style={styles.phoneInput}
                placeholder="e.g. 0300"
                placeholderTextColor="#6B8E8A"
                keyboardType="phone-pad"
                value={phoneSearchQuery}
                onChangeText={(text) => {
                  setPhoneSearchQuery(text);
                  setHasSearched(false);
                }}
              />
              <TouchableOpacity 
                style={styles.searchBtn} 
                onPress={handleSearchByPhone}
                disabled={searchUserMutation.isPending || !phoneSearchQuery.trim()}
              >
                {searchUserMutation.isPending ? (
                  <ActivityIndicator color="#061C19" size="small" />
                ) : (
                  <Text style={styles.searchBtnText}>Search</Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 300 }}>
              {foundUsers.map((user) => (
                <View key={user.id} style={[styles.foundUserCard, { marginBottom: 10 }]}>
                  <Avatar.Text
                    size={46}
                    label={(user.fullName || user.name || 'U').split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                    style={styles.avatarBg}
                    color="#00E676"
                  />
                  <View style={styles.foundUserInfo}>
                    <Text style={styles.chatName}>{user.fullName || user.name}</Text>
                    <Text style={styles.roleText}>{user.role}</Text>
                    <Text style={{color: '#6B8E8A', fontSize: 10}}>{user.phone}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.startChatBtn}
                    onPress={() => handleStartChat(user)}
                    disabled={createThreadMutation.isPending}
                  >
                    {createThreadMutation.isPending ? (
                       <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.startChatBtnText}>Message</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            {hasSearched && foundUsers.length === 0 && (
              <Text style={styles.errorText}>No users match this search.</Text>
            )}

          </View>
        </KeyboardAvoidingView>
      </Modal>

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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#0D9488',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(3, 7, 18, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0A2D28',
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    padding: SPACING.lg,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.2)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
  },
  modalLabel: {
    color: '#94A3B8',
    fontSize: TYPOGRAPHY.sizes.xs,
    marginBottom: SPACING.sm,
  },
  phoneSearchRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: '#051815',
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.3)',
    borderRadius: RADIUS.sm,
    color: '#FFFFFF',
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
  },
  searchBtn: {
    backgroundColor: '#00E676',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBtnText: {
    color: '#061C19',
    fontWeight: '700',
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  foundUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#051815',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.3)',
  },
  foundUserInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  startChatBtn: {
    backgroundColor: '#0D9488',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
  },
  startChatBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  errorText: {
    color: '#EF4444',
    fontSize: TYPOGRAPHY.sizes.xs,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
});

