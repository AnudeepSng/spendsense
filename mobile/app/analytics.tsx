import { View, Text, ScrollView, StyleSheet, StatusBar } from 'react-native';

const CATEGORIES = [
  { name: 'Food', spent: 4200, budget: 5000, color: '#FF6B6B', icon: '🍔' },
  { name: 'Groceries', spent: 3100, budget: 4000, color: '#4ECDC4', icon: '🛒' },
  { name: 'Entertainment', spent: 999, budget: 1000, color: '#A78BFA', icon: '🎬' },
  { name: 'Travel', spent: 2400, budget: 3000, color: '#FCD34D', icon: '🚂' },
  { name: 'Health', spent: 680, budget: 2000, color: '#6EE7B7', icon: '💊' },
  { name: 'Bills', spent: 1800, budget: 2000, color: '#FB923C', icon: '⚡' },
];

const TOTAL = CATEGORIES.reduce((s, c) => s + c.spent, 0);

export default function AnalyticsScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <View style={styles.monthBadge}>
            <Text style={styles.monthText}>Feb 2025</Text>
          </View>
        </View>

        {/* Total Spend Circle */}
        <View style={styles.totalCard}>
          <View style={styles.circle}>
            <Text style={styles.circleLabel}>Total Spent</Text>
            <Text style={styles.circleAmount}>₹{TOTAL.toLocaleString('en-IN')}</Text>
          </View>

          {/* Color Legend */}
          <View style={styles.legend}>
            {CATEGORIES.map(cat => (
              <View key={cat.name} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: cat.color }]} />
                <Text style={styles.legendText}>{cat.icon} {cat.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Category Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          {CATEGORIES.map(cat => {
            const pct = Math.min((cat.spent / cat.budget) * 100, 100);
            const isNearLimit = cat.spent >= cat.budget * 0.9;
            return (
              <View key={cat.name} style={styles.catRow}>
                <View style={styles.catHeader}>
                  <View style={styles.catLeft}>
                    <Text style={styles.catIcon}>{cat.icon}</Text>
                    <Text style={styles.catName}>{cat.name}</Text>
                  </View>
                  <View style={styles.catRight}>
                    <Text style={styles.catSpent}>₹{cat.spent.toLocaleString('en-IN')}</Text>
                    <Text style={styles.catBudget}> / ₹{cat.budget.toLocaleString('en-IN')}</Text>
                  </View>
                </View>
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: cat.color }]} />
                </View>
                {isNearLimit && (
                  <Text style={styles.limitWarning}>
                    {cat.spent >= cat.budget ? '⚠️ Budget exceeded' : '⚡ Almost at limit'}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Top Merchants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Merchants</Text>
          {[
            { name: 'Swiggy', amount: 3200, count: 8, icon: '🍔' },
            { name: 'BigBasket', amount: 2400, count: 4, icon: '🛒' },
            { name: 'Netflix', amount: 999, count: 1, icon: '🎬' },
          ].map((m, i) => (
            <View key={i} style={styles.merchantRow}>
              <View style={styles.merchantRank}>
                <Text style={styles.merchantRankText}>#{i + 1}</Text>
              </View>
              <Text style={styles.merchantIcon}>{m.icon}</Text>
              <View style={styles.merchantInfo}>
                <Text style={styles.merchantName}>{m.name}</Text>
                <Text style={styles.merchantCount}>{m.count} transactions</Text>
              </View>
              <Text style={styles.merchantAmount}>₹{m.amount.toLocaleString('en-IN')}</Text>
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
  title: { color: '#fff', fontSize: 22, fontWeight: '700' },
  monthBadge: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  monthText: { color: '#9CA3AF', fontSize: 11 },
  totalCard: { margin: 16, backgroundColor: '#161B2E', borderRadius: 20, padding: 20, alignItems: 'center' },
  circle: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#1A2340', borderWidth: 12, borderColor: '#63B3ED', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  circleLabel: { color: '#4A5568', fontSize: 10, marginBottom: 4 },
  circleAmount: { color: '#fff', fontSize: 16, fontWeight: '700' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: '#9CA3AF', fontSize: 11 },
  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { color: '#fff', fontSize: 14, fontWeight: '600', marginBottom: 14 },
  catRow: { marginBottom: 14 },
  catHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  catLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catIcon: { fontSize: 16 },
  catName: { color: '#E2E8F0', fontSize: 13 },
  catRight: { flexDirection: 'row', alignItems: 'center' },
  catSpent: { color: '#fff', fontSize: 13, fontWeight: '600' },
  catBudget: { color: '#4A5568', fontSize: 11 },
  progressBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 10 },
  limitWarning: { color: '#FB923C', fontSize: 10, marginTop: 4 },
  merchantRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, backgroundColor: '#161B2E', borderRadius: 14, marginBottom: 8 },
  merchantRank: { width: 24, height: 24, borderRadius: 8, backgroundColor: 'rgba(99,179,237,0.1)', alignItems: 'center', justifyContent: 'center' },
  merchantRankText: { color: '#63B3ED', fontSize: 11, fontWeight: '700' },
  merchantIcon: { fontSize: 20 },
  merchantInfo: { flex: 1 },
  merchantName: { color: '#E2E8F0', fontSize: 13, fontWeight: '600' },
  merchantCount: { color: '#4A5568', fontSize: 11 },
  merchantAmount: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
