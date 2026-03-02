import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, RefreshControl, StatusBar
} from 'react-native';
import axios from 'axios';

// ⚠️ Replace with your Mac's IP address
// Find it: System Preferences → Network → Wi-Fi → IP Address
const API_URL = 'http://172.20.10.2:8000';

const MOCK_TRANSACTIONS = [
  { id: '1', merchant_normalized: 'Swiggy', amount: 1250, type: 'debit', category: 'Food', icon: '🍔', bank: 'SBI' },
  { id: '2', merchant_normalized: 'Netflix', amount: 499, type: 'debit', category: 'Entertainment', icon: '🎬', bank: 'HDFC' },
  { id: '3', merchant_normalized: 'Unknown Merchant', amount: 8500, type: 'debit', category: 'Other', icon: '⚠️', bank: 'ICICI', anomaly: true },
  { id: '4', merchant_normalized: 'Rahul Sharma', amount: 2100, type: 'credit', category: 'Transfer', icon: '💸', bank: 'SBI' },
  { id: '5', merchant_normalized: 'Apollo Pharmacy', amount: 340, type: 'debit', category: 'Health', icon: '💊', bank: 'HDFC' },
];

const WEEKLY = [420, 1250, 340, 2100, 890, 3200, 1800];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MAX = Math.max(...WEEKLY);

export default function DashboardScreen() {
  const [summary, setSummary] = useState<any>(null);
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [sumRes, txRes] = await Promise.all([
        axios.get(`${API_URL}/summary`),
        axios.get(`${API_URL}/transactions?limit=5`),
      ]);
      setSummary(sumRes.data);
      if (txRes.data.transactions.length > 0) {
        setTransactions(txRes.data.transactions);
      }
    } catch (e) {
      // Using mock data when backend is offline
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const totalSpent = summary?.total_spent || 14589;
  const totalIncome = summary?.total_income || 2100;
  const saved = totalIncome - totalSpent;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#63B3ED" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.name}>Anudeep 👋</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>February 2025 · Spent</Text>
          <Text style={styles.balanceAmount}>₹{totalSpent.toLocaleString('en-IN')}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>↓ Income</Text>
              <Text style={[styles.statValue, { color: '#4ADE80' }]}>₹{totalIncome.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>💰 Saved</Text>
              <Text style={[styles.statValue, { color: saved >= 0 ? '#63B3ED' : '#FF6B6B' }]}>
                ₹{Math.abs(saved).toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>📊 Txns</Text>
              <Text style={styles.statValue}>47</Text>
            </View>
          </View>
        </View>

        {/* Anomaly Alert */}
        <TouchableOpacity style={styles.alertCard}>
          <Text style={styles.alertIcon}>⚠️</Text>
          <View style={styles.alertText}>
            <Text style={styles.alertTitle}>Anomaly Detected</Text>
            <Text style={styles.alertDesc}>Unusual ₹8,500 at unknown merchant</Text>
          </View>
          <Text style={styles.alertArrow}>›</Text>
        </TouchableOpacity>

        {/* Weekly Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>This Week</Text>
            <Text style={styles.chartTotal}>₹{WEEKLY.reduce((a, b) => a + b, 0).toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.chartBars}>
            {WEEKLY.map((val, i) => (
              <View key={i} style={styles.barWrapper}>
                <View style={[
                  styles.bar,
                  {
                    height: Math.max((val / MAX) * 60, 4),
                    backgroundColor: i === 5 ? '#63B3ED' : 'rgba(255,255,255,0.08)',
                  }
                ]} />
                <Text style={styles.barLabel}>{DAYS[i]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent</Text>
            <Text style={styles.seeAll}>See all →</Text>
          </View>
          {transactions.slice(0, 4).map((tx: any) => (
            <View key={tx.id} style={[styles.txRow, tx.anomaly && styles.txAnomalyRow]}>
              <View style={[styles.txIcon, tx.anomaly && styles.txIconAnomaly]}>
                <Text style={styles.txIconText}>{tx.icon || '💳'}</Text>
              </View>
              <View style={styles.txInfo}>
                <Text style={[styles.txMerchant, tx.anomaly && { color: '#FF6B6B' }]}>
                  {tx.merchant_normalized || tx.merchant}
                </Text>
                <Text style={styles.txMeta}>{tx.category} · {tx.bank}</Text>
              </View>
              <Text style={[styles.txAmount, { color: tx.type === 'credit' ? '#4ADE80' : '#E2E8F0' }]}>
                {tx.type === 'credit' ? '+' : '-'}₹{(tx.amount || 0).toLocaleString('en-IN')}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60 },
  greeting: { color: '#4A5568', fontSize: 13 },
  name: { color: '#fff', fontSize: 20, fontWeight: '700' },
  avatar: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#667EEA', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  balanceCard: { margin: 16, backgroundColor: '#1A2340', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(99,179,237,0.15)' },
  balanceLabel: { color: '#4A5568', fontSize: 12, marginBottom: 4 },
  balanceAmount: { color: '#fff', fontSize: 34, fontWeight: '700', letterSpacing: -1 },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  statBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 10 },
  statLabel: { color: '#4A5568', fontSize: 10, marginBottom: 4 },
  statValue: { color: '#fff', fontSize: 14, fontWeight: '600' },
  alertCard: { marginHorizontal: 16, marginBottom: 16, backgroundColor: 'rgba(255,107,107,0.08)', borderWidth: 1, borderColor: 'rgba(255,107,107,0.25)', borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  alertIcon: { fontSize: 20 },
  alertText: { flex: 1 },
  alertTitle: { color: '#FF6B6B', fontSize: 13, fontWeight: '600' },
  alertDesc: { color: '#9CA3AF', fontSize: 11, marginTop: 2 },
  alertArrow: { color: '#FF6B6B', fontSize: 20 },
  chartCard: { marginHorizontal: 16, marginBottom: 16, backgroundColor: '#161B2E', borderRadius: 16, padding: 16 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  chartTotal: { color: '#4A5568', fontSize: 12 },
  chartBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 80 },
  barWrapper: { flex: 1, alignItems: 'center', gap: 6, justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 4, minHeight: 4 },
  barLabel: { color: '#4A5568', fontSize: 9 },
  section: { paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { color: '#fff', fontSize: 14, fontWeight: '600' },
  seeAll: { color: '#63B3ED', fontSize: 12 },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 12, marginBottom: 4 },
  txAnomalyRow: { backgroundColor: 'rgba(255,107,107,0.06)', borderWidth: 1, borderColor: 'rgba(255,107,107,0.15)' },
  txIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  txIconAnomaly: { backgroundColor: 'rgba(255,107,107,0.15)' },
  txIconText: { fontSize: 20 },
  txInfo: { flex: 1 },
  txMerchant: { color: '#E2E8F0', fontSize: 13, fontWeight: '600' },
  txMeta: { color: '#4A5568', fontSize: 11, marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: '700' },
});
