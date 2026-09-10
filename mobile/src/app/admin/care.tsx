import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { Text, Card, Chip, Appbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAdminCareRequests, useAdminOffers, useAdminContracts, useAdminVisits } from '../../hooks/useAdmin';
import { COLORS, SPACING, RADIUS } from '../../theme';

type TabType = 'REQUESTS' | 'OFFERS' | 'CONTRACTS' | 'VISITS';

export default function AdminCareOperations() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('REQUESTS');

  const { data: requests, isLoading: loadingRequests } = useAdminCareRequests();
  const { data: offers, isLoading: loadingOffers } = useAdminOffers();
  const { data: contracts, isLoading: loadingContracts } = useAdminContracts();
  const { data: visits, isLoading: loadingVisits } = useAdminVisits();

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
        <Chip 
          selected={activeTab === 'REQUESTS'} 
          onPress={() => setActiveTab('REQUESTS')}
          style={[styles.tab, activeTab === 'REQUESTS' && styles.activeTab]}
          textStyle={activeTab === 'REQUESTS' ? styles.activeTabText : styles.tabText}
        >
          Care Requests
        </Chip>
        <Chip 
          selected={activeTab === 'OFFERS'} 
          onPress={() => setActiveTab('OFFERS')}
          style={[styles.tab, activeTab === 'OFFERS' && styles.activeTab]}
          textStyle={activeTab === 'OFFERS' ? styles.activeTabText : styles.tabText}
        >
          Marketplace Offers
        </Chip>
        <Chip 
          selected={activeTab === 'CONTRACTS'} 
          onPress={() => setActiveTab('CONTRACTS')}
          style={[styles.tab, activeTab === 'CONTRACTS' && styles.activeTab]}
          textStyle={activeTab === 'CONTRACTS' ? styles.activeTabText : styles.tabText}
        >
          Contracts
        </Chip>
        <Chip 
          selected={activeTab === 'VISITS'} 
          onPress={() => setActiveTab('VISITS')}
          style={[styles.tab, activeTab === 'VISITS' && styles.activeTab]}
          textStyle={activeTab === 'VISITS' ? styles.activeTabText : styles.tabText}
        >
          Visits
        </Chip>
      </ScrollView>
    </View>
  );

  const renderContent = () => {
    if (activeTab === 'REQUESTS') {
      if (loadingRequests) return <ActivityIndicator color="#00E676" style={{ marginTop: 20 }} />;
      if (!requests?.length) return <Text style={styles.emptyText}>No requests found</Text>;
      return requests.map(req => (
        <Card key={req.id} style={styles.card}>
          <Card.Content>
            <View style={styles.row}>
              <Text style={styles.cardTitle}>Req: {req.id.slice(0, 8)}</Text>
              <Chip textStyle={{ fontSize: 10 }}>{req.status}</Chip>
            </View>
            <Text style={styles.cardSub}>Service: {req.serviceType}</Text>
            <Text style={styles.cardSub}>Patient ID: {req.patientId.slice(0, 8)}</Text>
            <Text style={styles.cardSub}>Date: {new Date(req.createdAt).toLocaleDateString()}</Text>
          </Card.Content>
        </Card>
      ));
    }
    
    if (activeTab === 'OFFERS') {
      if (loadingOffers) return <ActivityIndicator color="#00E676" style={{ marginTop: 20 }} />;
      if (!offers?.length) return <Text style={styles.emptyText}>No offers found</Text>;
      return offers.map(off => (
        <Card key={off.id} style={styles.card}>
          <Card.Content>
            <View style={styles.row}>
              <Text style={styles.cardTitle}>Offer: {off.id.slice(0, 8)}</Text>
              <Chip textStyle={{ fontSize: 10 }}>{off.status}</Chip>
            </View>
            <Text style={styles.cardSub}>Provider ID: {off.providerId.slice(0, 8)}</Text>
            <Text style={styles.cardSub}>Amount: Rs {off.amount}</Text>
          </Card.Content>
        </Card>
      ));
    }

    if (activeTab === 'CONTRACTS') {
      if (loadingContracts) return <ActivityIndicator color="#00E676" style={{ marginTop: 20 }} />;
      if (!contracts?.length) return <Text style={styles.emptyText}>No contracts found</Text>;
      return contracts.map(con => (
        <Card key={con.id} style={styles.card}>
          <Card.Content>
            <View style={styles.row}>
              <Text style={styles.cardTitle}>Contract: {con.id.slice(0, 8)}</Text>
              <Chip textStyle={{ fontSize: 10 }}>{con.status}</Chip>
            </View>
            <Text style={styles.cardSub}>Provider ID: {con.providerId.slice(0, 8)}</Text>
            <Text style={styles.cardSub}>Patient ID: {con.patientId.slice(0, 8)}</Text>
          </Card.Content>
        </Card>
      ));
    }

    if (activeTab === 'VISITS') {
      if (loadingVisits) return <ActivityIndicator color="#00E676" style={{ marginTop: 20 }} />;
      if (!visits?.length) return <Text style={styles.emptyText}>No visits found</Text>;
      return visits.map(vis => (
        <Card key={vis.id} style={styles.card}>
          <Card.Content>
            <View style={styles.row}>
              <Text style={styles.cardTitle}>Visit: {vis.id.slice(0, 8)}</Text>
              <Chip textStyle={{ fontSize: 10 }}>{vis.status}</Chip>
            </View>
            <Text style={styles.cardSub}>Contract ID: {vis.contractId.slice(0, 8)}</Text>
            <Text style={styles.cardSub}>Scheduled: {new Date(vis.scheduledTime).toLocaleString()}</Text>
          </Card.Content>
        </Card>
      ));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={{ backgroundColor: '#061C19' }}>
        <Appbar.BackAction onPress={() => router.back()} color="#FFF" />
        <Appbar.Content title="Care Operations" titleStyle={{ color: '#FFF' }} />
      </Appbar.Header>
      
      {renderTabs()}
      
      <ScrollView contentContainerStyle={styles.content}>
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#061C19' },
  tabsContainer: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(0, 230, 118, 0.15)' },
  tabsScroll: { paddingHorizontal: SPACING.md, gap: 10 },
  tab: { backgroundColor: '#0A2D28' },
  activeTab: { backgroundColor: '#00E676' },
  tabText: { color: '#94A3B8' },
  activeTabText: { color: '#061C19', fontWeight: 'bold' },
  content: { padding: SPACING.md, gap: 12, paddingBottom: 40 },
  card: { backgroundColor: '#0A2D28', borderRadius: RADIUS.lg, borderWidth: 1, borderColor: 'rgba(0, 230, 118, 0.15)' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  cardSub: { color: '#94A3B8', fontSize: 13, marginTop: 2 },
  emptyText: { color: '#94A3B8', textAlign: 'center', marginTop: 40, fontSize: 16 },
});
