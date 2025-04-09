import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import db from '@/services/sqlite';

type Activity = { name: string; duration: number };
type Period = 'day' | 'week' | 'month';

export default function StatisticsScreen() {
  const [top3, setTop3] = useState<Activity[]>([]);
  const [others, setOthers] = useState<Activity[]>([]);
  const [showOthers, setShowOthers] = useState(false);
  const [period, setPeriod] = useState<Period>('day');

  const placeStyles = ['place1', 'place2', 'place3'] as const;

  useEffect(() => {
    const fetchData = async () => {
      const data = await db.getActivitySummaryByPeriod(period);
      setTop3(data.slice(0, 3));
      setOthers(data.slice(3));
    };
    fetchData();
  }, [period]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Titre */}
        <Text style={styles.title}>Top 3 Activités</Text>

        {/* Tabs en dessous du titre */}
        <View style={styles.tabs}>
          <PeriodTab label="Jour" value="day" current={period} onPress={setPeriod} />
          <PeriodTab label="Semaine" value="week" current={period} onPress={setPeriod} />
          <PeriodTab label="Mois" value="month" current={period} onPress={setPeriod} />
        </View>

        {/* Podium */}
        <View style={styles.podium}>
          {top3.map((activity, index) => (
            <View
              key={index}
              style={[styles.podiumBlock, styles[placeStyles[index]]]}
            >
              <Text style={styles.activityName}>{activity.name}</Text>
              <Text style={styles.activityTime}>{formatTime(activity.duration)}</Text>
            </View>
          ))}
        </View>

        {/* Toggle bouton */}
        <TouchableOpacity onPress={() => setShowOthers(!showOthers)} style={styles.toggleButton}>
          <Text style={styles.toggleButtonText}>
            {showOthers ? 'Cacher les autres activités' : 'Voir toutes les autres activités'}
          </Text>
        </TouchableOpacity>

        {/* ScrollView pour autres activités uniquement */}
        {showOthers && (
          <ScrollView style={styles.othersScroll} nestedScrollEnabled>
            <View style={styles.othersContainer}>
              {others.map((activity, index) => (
                <View key={index} style={styles.otherItem}>
                  <Text style={styles.activityName}>{activity.name}</Text>
                  <Text style={styles.activityTime}>{formatTime(activity.duration)}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

// Format durée
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m ` : ''}${s}s`;
}

// Tab période
function PeriodTab({
  label,
  value,
  current,
  onPress,
}: {
  label: string;
  value: Period;
  current: Period;
  onPress: (p: Period) => void;
}) {
  const selected = current === value;
  return (
    <TouchableOpacity
      onPress={() => onPress(value)}
      style={[styles.tabButton, selected && styles.tabSelected]}
    >
      <Text style={[styles.tabText, selected && styles.tabTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// Styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'left',
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  tabSelected: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#333',
  },
  tabTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  podiumBlock: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 8,
    width: 80,
    borderRadius: 12,
  },
  activityName: {
    fontWeight: '600',
    textAlign: 'center',
  },
  activityTime: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
  },
  place1: {
    height: 120,
    backgroundColor: '#FFD700',
  },
  place2: {
    height: 90,
    backgroundColor: '#C0C0C0',
  },
  place3: {
    height: 70,
    backgroundColor: '#CD7F32',
  },
  toggleButton: {
    marginBottom: 12,
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 8,
  },
  toggleButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  othersScroll: {
    maxHeight: 200,
  },
  othersContainer: {
    paddingBottom: 8,
  },
  otherItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});
