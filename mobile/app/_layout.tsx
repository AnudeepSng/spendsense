import { Tabs } from 'expo-router';
import { Text } from 'react-native';

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  return <Text style={{ fontSize: 18, color }}>{emoji}</Text>;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0D1117',
          borderTopColor: 'rgba(255,255,255,0.06)',
          height: 65,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: '#63B3ED',
        tabBarInactiveTintColor: '#4A5568',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: ({ color }) => <TabIcon emoji="⊞" color={color} /> }}
      />
      <Tabs.Screen
        name="transactions"
        options={{ title: 'Txns', tabBarIcon: ({ color }) => <TabIcon emoji="↕" color={color} /> }}
      />
      <Tabs.Screen
        name="parse"
        options={{ title: 'Parse', tabBarIcon: ({ color }) => <TabIcon emoji="⚡" color={color} /> }}
      />
      <Tabs.Screen
        name="analytics"
        options={{ title: 'Analytics', tabBarIcon: ({ color }) => <TabIcon emoji="◎" color={color} /> }}
      />
      <Tabs.Screen
        name="insights"
        options={{ title: 'Insights', tabBarIcon: ({ color }) => <TabIcon emoji="✦" color={color} /> }}
      />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}