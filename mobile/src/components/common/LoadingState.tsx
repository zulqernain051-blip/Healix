import React from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...' }) => (
  <SafeAreaView style={styles.safeArea}>
    <StatusBar barStyle="light-content" backgroundColor="#061C19" />
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#00E676" />
      <Text style={styles.message}>{message}</Text>
    </View>
  </SafeAreaView>
);

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
  message: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
});
