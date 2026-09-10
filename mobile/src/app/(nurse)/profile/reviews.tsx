import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Card, Divider, Chip } from 'react-native-paper';
import { useAuthStore } from '../../../store/auth';
import { useNurseReviews } from '../../../hooks/useNurse';
import { ErrorState } from '../../../components/common/ErrorState';

const COLORS = {
  bg: '#0A1628',
  card: '#111D35',
  border: '#1E2D4A',
  teal: '#0D9488',
  emerald: '#10B981',
  amber: '#F59E0B',
  blue: '#3B82F6',
  red: '#EF4444',
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#475569'
};

export default function NurseReviewsScreen() {
  const { user } = useAuthStore();
  const nurseId = user?.nurseId || user?.id || '';

  const { data: nurseReviews = [], isLoading, error } = useNurseReviews(nurseId);
  
  if (error) {
    return <ErrorState error={error.message} />;
  }

  const renderStars = (stars: number) => {
    return '★'.repeat(stars) + '☆'.repeat(5 - stars);
  };

  if (isLoading && nurseReviews.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.teal} />
        <Text style={styles.loadingText}>Fetching patient reviews...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>💬 Patient Reviews</Text>
        <Text style={styles.subtitle}>Read observations and feedback left by patients after visits</Text>
      </View>

      {nurseReviews.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyTitle}>No Reviews Yet</Text>
          <Text style={styles.emptyText}>Feedback left by patients after completed care visits will show up here.</Text>
        </View>
      ) : (
        nurseReviews.map((review: any) => (
          <Card key={review.id} style={styles.card}>
            <Card.Content>
              <View style={styles.reviewHeader}>
                <View>
                  <Text style={styles.patientName}>{review.patient.user.fullName}</Text>
                  <Text style={styles.starsText}>{renderStars(review.stars)}</Text>
                </View>

                <Chip
                  textStyle={{ color: '#FFF', fontSize: 10, fontWeight: '700' }}
                  style={{ backgroundColor: review.recommend ? COLORS.emerald : COLORS.red }}
                >
                  {review.recommend ? 'RECOMMENDED' : 'NOT RECOMMENDED'}
                </Chip>
              </View>

              <Divider style={styles.divider} />

              {review.reviewText ? (
                <Text style={styles.reviewBody}>"{review.reviewText}"</Text>
              ) : (
                <Text style={[styles.reviewBody, { fontStyle: 'italic', color: COLORS.textMuted }]}>
                  No written description provided.
                </Text>
              )}

              <Text style={styles.dateText}>
                Visit Date:{' '}
                {new Date(review.visit.request.scheduledAt).toLocaleDateString('en-PK', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </Text>
            </Card.Content>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 24 },
  title: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '700' },
  subtitle: { color: COLORS.textSecondary, fontSize: 13, marginTop: 4 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
  loadingText: { color: COLORS.textSecondary, marginTop: 12 },
  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 40
  },
  emptyIcon: { fontSize: 48, marginBottom: 16, color: COLORS.textMuted },
  emptyTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptyText: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  card: { backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  patientName: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  starsText: { color: COLORS.amber, fontSize: 16, marginTop: 4 },
  divider: { backgroundColor: COLORS.border, marginVertical: 12 },
  reviewBody: { color: COLORS.textPrimary, fontSize: 14, lineHeight: 20, fontStyle: 'italic' },
  dateText: { color: COLORS.textMuted, fontSize: 12, marginTop: 12, textAlign: 'right' }
});
