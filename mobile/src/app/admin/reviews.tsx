import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { Text, Card, Chip, Appbar, Button, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAdminReviews, useModerateReview } from '../../hooks/useAdmin';
import { COLORS, SPACING, RADIUS } from '../../theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AdminModeration() {
  const router = useRouter();

  const { data: reviews, isLoading } = useAdminReviews();
  const moderateMutation = useModerateReview();

  const handleModerate = (id: string, action: 'APPROVED' | 'HIDDEN') => {
    moderateMutation.mutate({ id, action });
  };

  const renderContent = () => {
    if (isLoading) return <ActivityIndicator color="#00E676" style={{ marginTop: 20 }} />;
    if (!reviews?.length) return <Text style={styles.emptyText}>No reviews found</Text>;
    
    return reviews.map(rev => (
      <Card key={rev.id} style={styles.card}>
        <Card.Content>
          <View style={styles.row}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="star" size={16} color="#F59E0B" />
              <Text style={styles.ratingText}>{rev.stars}/5</Text>
            </View>
            <Chip 
              textStyle={{ fontSize: 10, color: '#FFF' }} 
              style={{ backgroundColor: rev.flagged ? '#EF4444' : '#00E676' }}
            >
              {rev.flagged ? 'HIDDEN' : 'APPROVED'}
            </Chip>
          </View>
          <Text style={styles.cardSub}>Patient ID: {rev.patientId?.slice(0, 8)} | Nurse ID: {rev.nurseId?.slice(0, 8)}</Text>
          <Text style={styles.comment}>"{rev.reviewText || 'No comment'}"</Text>
          
          {!rev.flagged ? (
            <View style={styles.actionRow}>
              <Button 
                mode="contained" 
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
                labelStyle={{ color: '#EF4444' }}
                onPress={() => handleModerate(rev.id, 'HIDDEN')}
              >
                Hide (Flag)
              </Button>
            </View>
          ) : (
            <View style={styles.actionRow}>
              <Button 
                mode="contained" 
                style={{ backgroundColor: 'rgba(0, 230, 118, 0.2)', marginRight: 10 }}
                labelStyle={{ color: '#00E676' }}
                onPress={() => handleModerate(rev.id, 'APPROVED')}
              >
                Approve (Unflag)
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={{ backgroundColor: '#061C19' }}>
        <Appbar.BackAction onPress={() => router.back()} color="#FFF" />
        <Appbar.Content title="Review Moderation" titleStyle={{ color: '#FFF' }} />
      </Appbar.Header>
      
      <ScrollView contentContainerStyle={styles.content}>
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#061C19' },
  content: { padding: SPACING.md, gap: 12, paddingBottom: 40 },
  card: { backgroundColor: '#0A2D28', borderRadius: RADIUS.lg, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.15)' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  ratingText: { color: '#F59E0B', fontSize: 14, fontWeight: '700', marginLeft: 4 },
  cardSub: { color: '#94A3B8', fontSize: 12, marginBottom: 8 },
  comment: { color: '#FFF', fontSize: 14, fontStyle: 'italic', marginBottom: 12 },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-start' },
  emptyText: { color: '#94A3B8', textAlign: 'center', marginTop: 40, fontSize: 16 },
});
