import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';

const INSIGHTS = [
  { icon: '📈', text: 'You spent ₹2,400 MORE on food this month vs last month', type: 'warning' },
  { icon: '🎯', text: "You're on track to save ₹3,200 this month — great job!", type: 'success' },
  { icon: '💡', text: 'Cut 2 Swiggy orders/week → save ₹1,400/month = ₹16,800/year', type: 'tip' },
  { icon: '⚠️', text: 'Unusual ₹8,500 transaction detected — was this you?', type: 'alert' },
];

const COLORS: any = {
  warning: { bg: 'rgba(252,211,77,0.06)', border: 'rgba(252,211,77,0.2)', text: '#FCD34D' },
  success: { bg: 'rgba(74,222,128,0.06)', border: 'rgba(74,222,128,0.2)', text: '#4ADE80' },
  tip: { bg: 'rgba(99,179,237,0.06)', border: 'rgba(99,179,237,0.2)', text: '#63B3ED' },
  alert: { bg: 'rgba(255,107,107,0.08)', border: 'rgba(255,107,107,0.2)', text: '#FF6B6B' },
};

export default function InsightsScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>AI Insights</Text>
          <Text style={styles.subtitle}>Personalized just for you</Text>
        </View>

        {/* Forecast Card */}
        <View style={styles.forecastCard}>
          <Text style={styles.forecastLabel}>📈 MARCH FORECAST</Text>
          <View style={styles.forecastAmountRow}>
            <Text style={styles.forecastAmount}>₹16,400</Text>
            <Text style={styles.forecastChange}>↑ 12% vs last month</Text>
          </View>
          <Text style={styles.forecastDesc}>
            Prophet model predicts higher food + travel spend next month based on your patterns.
          </Text>
          <View style={styles.forecastTags}>
            {['Food ↑', 'Travel ↑', 'Bills ≈'].map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Month</Text>
          {INSIGHTS.map((ins, i) => {
            const c = COLORS[ins.type];
            return (
              <View key={i} style={[styles.insightCard, { backgroundColor: c.bg, borderColor: c.border }]}>
                <Text style={styles.insightIcon}>{ins.icon}</Text>
                <View style={styles.insightContent}>
                  <Text style={styles.insightText}>{ins.text}</Text>
                  {ins.type === 'tip' && (
                    <TouchableOpacity style={styles.actionBtn}>
                      <Text style={styles.actionBtnText}>Set Reminder</Text>
                    </TouchableOpacity>
                  )}
                  {ins.type === 'alert' && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity style={styles.confirmBtn}>
                        <Text style={styles.confirmBtnText}>Yes, it was me</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.reportBtn}>
                        <Text style={styles.reportBtnText}>Report Fraud</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Savings Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Savings Potential</Text>
          {[
            { action: 'Reduce food delivery by 2x/week', save: 1400, annual: 16800 },
            { action: 'Switch to cheaper OTT plan', save: 300, annual: 3600 },
            { action: 'Buy groceries offline vs Zepto', save: 800, annual: 9600 },
          ].map((tip, i) => (
            <View key={i} style={styles.savingsRow}>
              <View style={styles.savingsIcon}>
                <Text style={{ color: '#4ADE80', fontSize: 14 }}>💰</Text>
              </View>
              <View style={styles.savingsInfo}>
                <Text style={styles.savingsAction}>{tip.action}</Text>
                <Text style={styles.savingsAmount}>Save ₹{tip.save.toLocaleString('en-IN')}/month · ₹{tip.annual.toLocaleString('en-IN')}/year</Text>
              </View>
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
  header: { padding: 20, paddingTop: 60 },
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },
  subtitle: { color: '#4A5568', fontSize: 13, marginTop: 4 },
  forecastCard: { margin: 16, backgroundColor: '#1A2340', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: 'rgba(99,179,237,0.15)' },
  forecastLabel: { color: '#63B3ED', fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 8 },
  forecastAmountRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 8 },
  forecastAmount: { color: '#fff', fontSize: 30, fontWeight: '700' },
  forecastChange: { color: '#FB923C', fontSize: 13 },
  forecastDesc: { color: '#4A5568', fontSize: 12, lineHeight: 18, marginBottom: 12 },
  forecastTags: { flexDirection: 'row', gap: 8 },
  tag: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { color: '#9CA3AF', fontSize: 11 },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 12 },
  insightCard: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', gap: 12 },
  insightIcon: { fontSize: 22, marginTop: 2 },
  insightContent: { flex: 1 },
  insightText: { color: '#E2E8F0', fontSize: 13, lineHeight: 20 },
  actionBtn: { marginTop: 10, backgroundColor: '#63B3ED', borderRadius: 8, paddingVertical: 7, paddingHorizontal: 14, alignSelf: 'flex-start' },
  actionBtnText: { color: '#0D1117', fontSize: 12, fontWeight: '700' },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  confirmBtn: { backgroundColor: '#FF6B6B', borderRadius: 8, paddingVertical: 7, paddingHorizontal: 12 },
  confirmBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  reportBtn: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 8, paddingVertical: 7, paddingHorizontal: 12 },
  reportBtnText: { color: '#9CA3AF', fontSize: 11 },
  savingsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: '#161B2E', borderRadius: 14, marginBottom: 8 },
  savingsIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(74,222,128,0.1)', alignItems: 'center', justifyContent: 'center' },
  savingsInfo: { flex: 1 },
  savingsAction: { color: '#E2E8F0', fontSize: 13, fontWeight: '500' },
  savingsAmount: { color: '#4ADE80', fontSize: 11, marginTop: 3 },
});
