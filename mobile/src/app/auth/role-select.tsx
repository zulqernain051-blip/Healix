import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Avatar, Card, Button, Text } from 'react-native-paper';
import { navigate } from '../../utils/navigation';

/**
 * Role Selection Screen.
 * Guides the user to register under one of the three core system roles.
 */
export default function RoleSelectScreen() {
  

  const handleSelectRole = (role: 'PATIENT' | 'NURSE') => {
    navigate('/auth/register', { role });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Join Healix As</Text>
      <Text style={styles.subtitle}>Select your primary system role to continue</Text>

      <Card style={styles.card} onPress={() => handleSelectRole('PATIENT')}>
        <Card.Title
          title="Patient"
          subtitle="Book visits, view prescriptions & track vitals"
          left={(props) => <Avatar.Icon {...props} icon="account" color="#0D9488" style={{ backgroundColor: 'transparent' }} />}
        />
      </Card>

      <Card style={styles.card} onPress={() => handleSelectRole('NURSE')}>
        <Card.Title
          title="Nurse Practitioner"
          subtitle="Provide home care visits & earn professional scores"
          left={(props) => <Avatar.Icon {...props} icon="medical-bag" color="#0D9488" style={{ backgroundColor: 'transparent' }} />}
        />
      </Card>

      <Button
        mode="text"
        onPress={() => navigate('/auth/login')}
        textColor="#6B7280"
        style={styles.backButton}>
        Back to Sign In
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F9FAFB',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    marginTop: 6,
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  backButton: {
    marginTop: 16,
  },
});
