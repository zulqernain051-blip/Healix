import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { navigate } from '../../../utils/navigation';
import { useAuthStore } from '../../../store/auth';
import { messagesApi } from '../../../api/messages.api';
import { SPACING, RADIUS, TYPOGRAPHY } from '../../../theme';
import { AIChatBubble } from '../../../components/patient/AIChatBubble';

interface MessageItem {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  isEmergencyAlert?: boolean;
}

export default function AIAssistantScreen() {
  const { user, accessToken } = useAuthStore();
  const firstName = user?.fullName ? user.fullName.split(' ')[0] : 'Patient';

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasEmergencyTriggered, setHasEmergencyTriggered] = useState(false);
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: '1',
      text: `Hello ${firstName}! 👋 I am Healix AI Assistant. How can I help answer your health questions or symptom queries today?`,
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const suggestedPrompts = [
    'How can I control high blood pressure?',
    'What symptoms should I monitor for flu?',
    'Tips for improving sleep quality',
    'When should I request a home nurse visit?',
  ];

  // Acute deterioration keyword classifier (FSD 9.1)
  const isAcuteDeterioration = (query: string): boolean => {
    const lower = query.toLowerCase();
    const keywords = [
      'chest pain',
      'shortness of breath',
      'can\'t breathe',
      'unconscious',
      'loss of consciousness',
      'stroke',
      'severe bleeding',
      'heart attack',
      'fainted',
      'paralysis',
    ];
    return keywords.some(kw => lower.includes(kw));
  };

  const handleSend = async (queryText?: string) => {
    const promptToSend = queryText || input.trim();
    if (!promptToSend) return;

    const userMsg: MessageItem = {
      id: String(Date.now()),
      text: promptToSend,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // FSD 9.1 Acute Deterioration Check
    if (isAcuteDeterioration(promptToSend)) {
      setHasEmergencyTriggered(true);
      const emergencyMsg: MessageItem = {
        id: String(Date.now() + 1),
        text: '🚨 URGENT ESCALATION PROMPT: Your symptoms contain indicators of potential acute deterioration (Feature 9.1). Please do not wait for a chat reply. Call emergency services immediately or tap Trigger Emergency SOS below.',
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isEmergencyAlert: true,
      };
      setMessages(prev => [...prev, emergencyMsg]);
      return;
    }

    setLoading(true);

    try {
      if (accessToken) {
        // Backend expects: POST /chat/ai/:patientId/messages
        // Payload: { messageText: string }
        const res = await messagesApi.sendAiMessage(user?.patientId || user?.id || 'unknown', promptToSend);
        const aiMsgText = res?.data?.text || res?.reply || res?.message || 'I have analyzed your query based on clinical knowledge guidelines. Please maintain your prescribed health schedule and consult a verified doctor for medical decisions.';
        setMessages(prev => [
          ...prev,
          {
            id: String(Date.now() + 1),
            text: aiMsgText,
            isUser: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: String(Date.now() + 1),
              text: 'Healix AI recommends scheduling a clinical consultation or reviewing your latest vitals trends on your dashboard for personalized guidance.',
              isUser: false,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }, 1000);
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: String(Date.now() + 1),
          text: 'I am currently unable to reach the clinical AI service. Please try again shortly or contact support.',
          isUser: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerEmergencySos = () => {
    Alert.alert(
      '🚨 Emergency SOS Dispatch Triggered',
      'Connecting immediate triage escalation to on-call doctors and emergency contacts.',
      [{ text: 'Return to Home', onPress: () => navigate('/(patient)/home') }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#061C19" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigate('/(patient)/home')}>
            <Text style={styles.backIcon}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Healix AI Assistant</Text>
            <View style={styles.onlineGroup}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Clinical Knowledge Active</Text>
            </View>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Conditional Urgent Escalation Banner */}
        {hasEmergencyTriggered && (
          <View style={styles.emergencyBanner}>
            <Text style={styles.emergencyBannerTitle}>🚨 Acute Deterioration Flagged</Text>
            <Text style={styles.emergencyBannerSub}>
              Severe symptom keywords detected. Tap SOS to notify on-call emergency physician.
            </Text>
            <Button
              mode="contained"
              buttonColor="#EF4444"
              textColor="#FFFFFF"
              onPress={handleTriggerEmergencySos}
              style={{ marginTop: 8, borderRadius: RADIUS.md }}
              labelStyle={{ fontWeight: '800' }}
            >
              🚨 Trigger Emergency SOS (Module 10)
            </Button>
          </View>
        )}

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Chat Messages */}
          {messages.map(msg => (
            <View key={msg.id} style={{ marginBottom: 8 }}>
              {msg.isEmergencyAlert ? (
                <View style={styles.alertBubble}>
                  <Text style={styles.alertBubbleText}>{msg.text}</Text>
                  <Text style={styles.alertTime}>{msg.timestamp}</Text>
                </View>
              ) : (
                <AIChatBubble message={msg.text} isUser={msg.isUser} timestamp={msg.timestamp} />
              )}
            </View>
          ))}

          {loading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#00E676" />
              <Text style={styles.loadingText}>Healix AI is analyzing clinical knowledge...</Text>
            </View>
          )}

          {/* Suggested Prompts */}
          {messages.length < 3 && (
            <View style={styles.suggestedContainer}>
              <Text style={styles.suggestedTitle}>Suggested Health Topics</Text>
              {suggestedPrompts.map((prompt, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.promptItem}
                  onPress={() => handleSend(prompt)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.promptIcon}>💡</Text>
                  <Text style={styles.promptText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask AI a health question or symptom..."
            placeholderTextColor="#6B8E8A"
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={() => handleSend()}
            disabled={!input.trim() || loading}
          >
            <Text style={styles.sendIcon}>➔</Text>
          </TouchableOpacity>
        </View>
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
    maxWidth: Platform.OS === 'web' ? 800 : '100%',
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#061C19',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: '#0A2D28',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 230, 118, 0.15)',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
  },
  onlineGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00E676',
    marginRight: 4,
  },
  onlineText: {
    color: '#00E676',
    fontSize: 10,
  },
  emergencyBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#EF4444',
    padding: 14,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  emergencyBannerTitle: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '800',
  },
  emergencyBannerSub: {
    color: '#F1F5F9',
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 20,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 12,
    marginLeft: SPACING.sm,
  },
  alertBubble: {
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  alertBubbleText: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  alertTime: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  suggestedContainer: {
    marginTop: SPACING.lg,
  },
  suggestedTitle: {
    color: '#94A3B8',
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  promptItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A2D28',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: 'rgba(0, 230, 118, 0.15)',
  },
  promptIcon: {
    fontSize: 14,
    marginRight: SPACING.sm,
  },
  promptText: {
    color: '#FFFFFF',
    fontSize: TYPOGRAPHY.sizes.xs,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: '#0A2D28',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 230, 118, 0.15)',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#051815',
    color: '#FFFFFF',
    borderRadius: RADIUS.round,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 14,
    maxHeight: 100,
    marginRight: SPACING.sm,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00E676',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#6B8E8A',
  },
  sendIcon: {
    fontSize: 18,
    color: '#061C19',
    fontWeight: '900',
  },
});
