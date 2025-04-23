import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Dimensions } from 'react-native';
import React, { useEffect, useState } from 'react';
import db from '@/services/sqlite';
import { SafeAreaView } from 'react-native-safe-area-context';

const SCREEN_WIDTH = Dimensions.get('window').width;
const MAX_SECONDS = 24 * 60 * 60; // 24h en secondes

export default function ActivityDetail() {
  const { name } = useLocalSearchParams();
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [data, setData] = useState<{ date: string; duration: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (typeof name !== 'string') return;

      const now = new Date();
      const daysBack = period === 'day' ? 1 : period === 'week' ? 7 : 30;
      const grouped: { date: string; duration: number }[] = [];

      const all = await db.getGestures();

      for (let i = daysBack - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateKey = d.toISOString().split('T')[0];

        const gestures = all.filter(
          (g) => g.gesture === name && g.created_at.startsWith(dateKey)
        );

        grouped.push({ date: dateKey, duration: gestures.length * 3 });
      }

      setData(grouped);
    };

    fetchData();
  }, [name, period]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{formatLabel(name)}</Text>

      <View style={styles.periodTabs}>
        {['day', 'week', 'month'].map((p) => (
          <TouchableOpacity
            key={p}
            onPress={() => setPeriod(p as 'day' | 'week' | 'month')}
            style={[styles.tab, period === p && styles.tabSelected]}
          >
            <Text style={[styles.tabText, period === p && styles.tabTextSelected]}>
              {p === 'day' ? '1j' : p === 'week' ? '7j' : '30j'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.detailsTitle}>Temps par jour</Text>
      <ScrollView style={styles.scrollContainer}>
        {data.length === 0 ? (
          <Text style={styles.noData}>Aucune donnée disponible</Text>
        ) : (
          data.map((item, idx) => {
            const width = Math.max((item.duration / MAX_SECONDS) * (SCREEN_WIDTH - 64), 2);
            return (
              <View key={idx} style={styles.entryRow}>
                <Text style={styles.entryDate}>{item.date}</Text>
                <View style={styles.barContainer}>
                  <View style={[styles.bar, { width }]} />
                </View>
                <Text style={styles.entryDuration}>{formatTime(item.duration)}</Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m ` : ''}${s}s`;
}

function formatLabel(label: string | string[] | undefined): string {
  if (!label || typeof label !== 'string') return '';
  return label.charAt(0).toUpperCase() + label.slice(1).toLowerCase();
}

export const options = ({ params }: { params: Record<string, any> }) => {
  return {
    title: formatLabel(params.name),
    headerShown: true,
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  periodTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  tab: {
    backgroundColor: '#333',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  tabSelected: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    color: '#ccc',
    fontSize: 14,
  },
  tabTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  scrollContainer: {
    marginTop: 8,
  },
  detailsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  entryRow: {
    marginBottom: 18,
  },
  entryDate: {
    color: '#ccc',
    marginBottom: 4,
  },
  barContainer: {
    height: 10,
    backgroundColor: '#222',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  bar: {
    height: 10,
    backgroundColor: '#1abc9c',
    borderRadius: 4,
  },
  entryDuration: {
    color: '#ccc',
    fontSize: 12,
    textAlign: 'right',
  },
  noData: {
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
});
