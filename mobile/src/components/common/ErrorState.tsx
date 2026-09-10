import React from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';

interface ErrorStateProps {
  error: Error | string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  const message = typeof error === 'string' ? error : error.message;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#061C19" />
      <View style={styles.container}>
        <Text style={styles.icon}>⚠️</Text>
        <Text style={styles.message}>{message}</Text>
        {onRetry && (
          <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#061C19',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  icon: {
    fontSize: 40,
    marginBottom: 12,
  },
  message: {
    color: '#EF4444',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  retryBtn: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00E676',
  },
  retryText: {
    color: '#00E676',
    fontSize: 14,
    fontWeight: '600',
  },
});
