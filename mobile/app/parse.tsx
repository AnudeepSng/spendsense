import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, ActivityIndicator,
  StatusBar, Alert
} from 'react-native';
import { parseSMS, getCategoryIcon, SAMPLE_SMS, Transaction } from '../services/api';

export default function ParseScreen() {
  const [smsText, setSmsText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Transaction | null>(null);
  const [history, setHistory] = useState<Transaction[]>([]);

  const handleParse = async () => {
    if (!smsText.trim()) {
      Alert.alert('Empty', 'Please paste an SMS first');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const tx = await parseSMS(smsText.trim());
      setResult(tx);
      if (tx.parsed) setHistory(prev => [tx, ...prev].slice(0, 10));
    } catch (e: any) {
      Alert.alert(
        'Connection Error',
        'Cannot reach backend. Make sure:\n1. python3 app.py is running\n2. IP in api.ts is correct\n3. Phone and Mac are on same WiFi'
      );
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (sms: string) => setSmsText(sms);
  const clearAll = () => { setSmsText(''); setResult(null); };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Parse SMS</Text>
          <Text style={styles.subtitle}>Paste any bank SMS to test the parser</Text>
        </View>

        {/* Input Box */}
        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>PASTE SMS HERE</Text>
          <TextInput
            style={styles.input}
            placeholder="Rs.1,250 debited from A/c XX4521..."
            placeholderTextColor="#2D3748"
            value={smsText}
            onChangeText={setSmsText}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <View style={styles.inputActions}>
            <TouchableOpacity onPress={clearAll} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleParse}
              style={[styles.parseBtn, loading && styles.parseBtnDisabled]}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#0D1117" size="small" />
                : <Text style={styles.parseBtnText}>⚡ Parse Now</Text>
              }
            </TouchableOpacity>
          </View>
        </View>

        {/* Result Card */}
        {result && (
          <View style={[styles.resultCard, result.parsed ? styles.resultSuccess : styles.resultFail]}>
            {result.parsed ? (
              <>
                <View style={styles.resultHeader}>
                  <Text style={styles.resultIcon}>{getCategoryIcon(result.category)}</Text>
                  <View style={styles.resultTitleBlock}>
                    <Text style={styles.resultMerchant}>{result.merchant_normalized || result.merchant}</Text>
                    <View style={styles.parsedBadge}>
                      <Text style={styles.parsedBadgeText}>✓ PARSED</Text>
                    </View>
                  </View>
                  <Text style={[styles.resultAmount, { color: result.type === 'credit' ? '#4ADE80' : '#fff' }]}>
                    {result.type === 'credit' ? '+' : '-'}₹{(result.amount || 0).toLocaleString('en-IN')}
                  </Text>
                </View>

                <View style={styles.resultGrid}>
                  {[
                    { label: 'Type', value: result.type?.toUpperCase() },
                    { label: 'Category', value: result.category },
                    { label: 'Bank', value: result.bank },
                    { label: 'Channel', value: result.channel },
                    { label: 'Account', value: result.account_last4 ? `XX${result.account_last4}` : '—' },
                    { label: 'Balance', value: result.balance ? `₹${result.balance.toLocaleString('en-IN')}` : '—' },
                  ].map((item, i) => (
                    <View key={i} style={styles.resultGridItem}>
                      <Text style={styles.resultGridLabel}>{item.label}</Text>
                      <Text style={styles.resultGridValue}>{item.value || '—'}</Text>
                    </View>
                  ))}
                </View>

                {result.upi_ref && (
                  <View style={styles.refRow}>
                    <Text style={styles.refLabel}>UPI Ref:</Text>
                    <Text style={styles.refValue}>{result.upi_ref}</Text>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.failBlock}>
                <Text style={styles.failIcon}>❌</Text>
                <Text style={styles.failTitle}>Could not parse</Text>
                <Text style={styles.failReason}>{result.parse_error || 'Pattern not recognized'}</Text>
                <Text style={styles.failTip}>Add this SMS format to sms_parser.py to improve coverage</Text>
              </View>
            )}
          </View>
        )}

        {/* Sample SMS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Try Sample SMS</Text>
          {SAMPLE_SMS.map((sms, i) => (
            <TouchableOpacity key={i} onPress={() => loadSample(sms)} style={styles.sampleRow}>
              <Text style={styles.sampleNumber}>{i + 1}</Text>
              <Text style={styles.sampleText} numberOfLines={2}>{sms}</Text>
              <Text style={styles.sampleArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Parse History */}
        {history.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Parsed This Session</Text>
            {history.map((tx, i) => (
              <View key={i} style={styles.historyRow}>
                <Text style={styles.historyIcon}>{getCategoryIcon(tx.category)}</Text>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyMerchant}>{tx.merchant_normalized}</Text>
                  <Text style={styles.historyMeta}>{tx.category} · {tx.bank}</Text>
                </View>
                <Text style={[styles.historyAmount, { color: tx.type === 'credit' ? '#4ADE80' : '#E2E8F0' }]}>
                  {tx.type === 'credit' ? '+' : '-'}₹{(tx.amount || 0).toLocaleString('en-IN')}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117' },
  header: { padding: 20, paddingTop: 60 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },
  subtitle: { color: '#4A5568', fontSize: 13, marginTop: 4 },
  inputCard: { marginHorizontal: 16, marginBottom: 16, backgroundColor: '#161B2E', borderRadius: 16, padding: 16 },
  inputLabel: { color: '#4A5568', fontSize: 10, fontWeight: '600', letterSpacing: 1, marginBottom: 10 },
  input: { color: '#E2E8F0', fontSize: 13, lineHeight: 20, minHeight: 90, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  inputActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  clearBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 13, alignItems: 'center' },
  clearBtnText: { color: '#9CA3AF', fontSize: 14, fontWeight: '600' },
  parseBtn: { flex: 2, backgroundColor: '#63B3ED', borderRadius: 12, padding: 13, alignItems: 'center' },
  parseBtnDisabled: { opacity: 0.6 },
  parseBtnText: { color: '#0D1117', fontSize: 14, fontWeight: '700' },
  resultCard: { marginHorizontal: 16, marginBottom: 16, borderRadius: 16, padding: 16, borderWidth: 1 },
  resultSuccess: { backgroundColor: 'rgba(99,179,237,0.06)', borderColor: 'rgba(99,179,237,0.2)' },
  resultFail: { backgroundColor: 'rgba(255,107,107,0.06)', borderColor: 'rgba(255,107,107,0.2)' },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  resultIcon: { fontSize: 32 },
  resultTitleBlock: { flex: 1 },
  resultMerchant: { color: '#fff', fontSize: 16, fontWeight: '700' },
  parsedBadge: { backgroundColor: 'rgba(74,222,128,0.15)', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 4 },
  parsedBadgeText: { color: '#4ADE80', fontSize: 9, fontWeight: '700' },
  resultAmount: { fontSize: 18, fontWeight: '700' },
  resultGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  resultGridItem: { width: '30%', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 8 },
  resultGridLabel: { color: '#4A5568', fontSize: 9, marginBottom: 4 },
  resultGridValue: { color: '#E2E8F0', fontSize: 12, fontWeight: '600' },
  refRow: { flexDirection: 'row', gap: 8, marginTop: 12, padding: 10, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10 },
  refLabel: { color: '#4A5568', fontSize: 11 },
  refValue: { color: '#9CA3AF', fontSize: 11, fontFamily: 'monospace' },
  failBlock: { alignItems: 'center', padding: 12 },
  failIcon: { fontSize: 32, marginBottom: 8 },
  failTitle: { color: '#FF6B6B', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  failReason: { color: '#9CA3AF', fontSize: 12, marginBottom: 8 },
  failTip: { color: '#4A5568', fontSize: 11, textAlign: 'center', lineHeight: 16 },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 12 },
  sampleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, backgroundColor: '#161B2E', borderRadius: 12, marginBottom: 8 },
  sampleNumber: { color: '#63B3ED', fontSize: 12, fontWeight: '700', width: 18 },
  sampleText: { flex: 1, color: '#9CA3AF', fontSize: 11, lineHeight: 16 },
  sampleArrow: { color: '#4A5568', fontSize: 18 },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, backgroundColor: '#161B2E', borderRadius: 12, marginBottom: 6 },
  historyIcon: { fontSize: 22 },
  historyInfo: { flex: 1 },
  historyMerchant: { color: '#E2E8F0', fontSize: 13, fontWeight: '600' },
  historyMeta: { color: '#4A5568', fontSize: 11, marginTop: 2 },
  historyAmount: { fontSize: 14, fontWeight: '700' },
});