import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';

const TRANSACTIONS = [
  { id: '1', merchant_normalized: 'Swiggy', amount: 1250, type: 'debit', category: 'Food', icon: '🍔', bank: 'SBI', time: '2:30 PM', date: 'Today' },
  { id: '2', merchant_normalized: 'Netflix', amount: 499, type: 'debit', category: 'Entertainment', icon: '🎬', bank: 'HDFC', time: '11:00 AM', date: 'Today' },
  { id: '3', merchant_normalized: 'Unknown Merchant', amount: 8500, type: 'debit', category: 'Other', icon: '⚠️', bank: 'ICICI', time: '9:15 AM', date: 'Today', anomaly: true },
  { id: '4', merchant_normalized: 'Rahul Sharma', amount: 2100, type: 'credit', category: 'Transfer', icon: '💸', bank: 'SBI', time: '6:00 PM', date: 'Yesterday' },
  { id: '5', merchant_normalized: 'Apollo Pharmacy', amount: 340, type: 'debit', category: 'Health', icon: '💊', bank: 'HDFC', time: '3:45 PM', date: 'Yesterday' },
  { id: '6', merchant_normalized: 'IRCTC', amount: 1800, type: 'debit', category: 'Travel', icon: '🚂', bank: 'SBI', time: '10:00 AM', date: '25 Feb' },
  { id: '7', merchant_normalized: 'Zepto', amount: 650, type: 'debit', category: 'Groceries', icon: '🛒', bank: 'ICICI', time: '8:30 PM', date: '25 Feb' },
];

const FILTERS = ['All', 'Food', 'Travel', 'Health', 'Bills'];

export default function TransactionsScreen() {
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All'
    ? TRANSACTIONS
    : TRANSACTIONS.filter(t => t.category === filter);

  const dates = [...new Set(filtered.map(t => t.date))];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
        <Text style={styles.month}>Feb 2025</Text>
      </View>

      {/* Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.chip, filter === f && styles.chipActive]}
          >
            <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Transaction List */}
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {dates.map(date => {
          const dayTxs = filtered.filter(t => t.date === date);
          return (
            <View key={date}>
              <Text style={styles.dateLabel}>{date}</Text>
              {dayTxs.map(tx => (
                <TouchableOpacity key={tx.id} style={[styles.txRow, tx.anomaly && styles.txAnomaly]}>
                  <View style={[styles.txIcon, tx.anomaly && styles.txIconAnomaly]}>
                    <Text style={{ fontSize: 20 }}>{tx.icon}</Text>
                  </View>
                  <View style={styles.txInfo}>
                    <View style={styles.txTitleRow}>
                      <Text style={[styles.txMerchant, tx.anomaly && { color: '#FF6B6B' }]}>
                        {tx.merchant_normalized}
                      </Text>
                      {tx.anomaly && (
                        <View style={styles.anomalyBadge}>
                          <Text style={styles.anomalyBadgeText}>ANOMALY</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.txMeta}>{tx.bank} · {tx.category} · {tx.time}</Text>
                  </View>
                  <Text style={[styles.txAmount, { color: tx.type === 'credit' ? '#4ADE80' : '#E2E8F0' }]}>
                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          );
        })}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },
  month: { color: '#4A5568', fontSize: 13 },
  filterRow: { maxHeight: 44, marginBottom: 8 },
  chip: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, height: 34, justifyContent: 'center' },
  chipActive: { backgroundColor: '#63B3ED' },
  chipText: { color: '#9CA3AF', fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#0D1117' },
  dateLabel: { color: '#4A5568', fontSize: 11, fontWeight: '600', paddingHorizontal: 20, paddingVertical: 8, textTransform: 'uppercase', letterSpacing: 1 },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, padding: 12, borderRadius: 14, marginBottom: 4 },
  txAnomaly: { backgroundColor: 'rgba(255,107,107,0.06)', borderWidth: 1, borderColor: 'rgba(255,107,107,0.15)' },
  txIcon: { width: 44, height: 44, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  txIconAnomaly: { backgroundColor: 'rgba(255,107,107,0.15)' },
  txInfo: { flex: 1 },
  txTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  txMerchant: { color: '#E2E8F0', fontSize: 13, fontWeight: '600' },
  anomalyBadge: { backgroundColor: 'rgba(255,107,107,0.2)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  anomalyBadgeText: { color: '#FF6B6B', fontSize: 9, fontWeight: '700' },
  txMeta: { color: '#4A5568', fontSize: 11, marginTop: 2 },
  txAmount: { fontSize: 14, fontWeight: '700' },
});
