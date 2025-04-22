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
import { Link, useFocusEffect } from 'expo-router';
import db from '@/services/sqlite';

// Types
type Activity = { name: string; duration: number };

const ALL_GESTURES = [
  'WALKING',
  'WALKING_UPSTAIRS',
  'WALKING_DOWNSTAIRS',
  'SITTING',
  'STANDING',
  'LAYING',
];

export default function StatisticsScreen() {
  const [top3, setTop3] = useState<Activity[]>([]);
  const [others, setOthers] = useState<Activity[]>([]);
  const [showOthers, setShowOthers] = useState(false);

  const updateData = async () => {
    const all = await db.getGestures();
    const today = new Date().toISOString().split('T')[0];

    const grouped: Record<string, number> = {};
    all.forEach((g) => {
      if (g.created_at.startsWith(today)) {
        grouped[g.gesture] = (grouped[g.gesture] || 0) + 3;
      }
    });

    const allActivities: Activity[] = ALL_GESTURES.map((name) => ({
      name,
      duration: grouped[name] || 0,
    })).sort((a, b) => b.duration - a.duration);

    const filled = [...allActivities.slice(0, 3)];
    while (filled.length < 3) filled.push({ name: '-', duration: 0 });

    setTop3(filled);
    setOthers(allActivities.slice(3));
  };

  useFocusEffect(
    React.useCallback(() => {
      updateData();
    }, [])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>TOP 3 Activités</Text>

        <View style={styles.podiumContainer}>
          <View style={[styles.podiumBlock, styles.place2]}>
            <PodiumItem activity={top3[1]} />
          </View>
          <View style={[styles.podiumBlock, styles.place1]}>
            <PodiumItem activity={top3[0]} />
          </View>
          <View style={[styles.podiumBlock, styles.place3]}>
            <PodiumItem activity={top3[2]} />
          </View>
        </View>

        <TouchableOpacity onPress={() => setShowOthers(!showOthers)} style={styles.toggleButton}>
          <Text style={styles.toggleButtonText}>
            {showOthers ? 'Cacher les autres activités' : 'Voir toutes les autres activités'}
          </Text>
        </TouchableOpacity>

        {showOthers && (
          <ScrollView style={styles.othersScroll} nestedScrollEnabled>
            <View style={styles.othersContainer}>
              {others.map((activity, index) => (
                <Link
                  key={index}
                  href={{ pathname: '/specific_activity/[name]', params: { name: activity.name } }}
                  asChild
                >
                  <TouchableOpacity style={styles.otherItem}>
                    <Text style={styles.activityName}>{activity.name}</Text>
                    <Text style={styles.activityTime}>{formatTime(activity.duration)}</Text>
                  </TouchableOpacity>
                </Link>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

function PodiumItem({ activity }: { activity: Activity }) {
  if (!activity || activity.name === '-') {
    return (
      <View style={styles.podiumTouchable}>
        <Text style={styles.activityName}>-</Text>
        <Text style={styles.activityTime}>0s</Text>
      </View>
    );
  }

  return (
    <Link
      href={{ pathname: '/specific_activity/[name]', params: { name: activity.name } }}
      asChild
    >
      <TouchableOpacity style={styles.podiumTouchable}>
        <Text style={styles.activityName}>{activity.name}</Text>
        <Text style={styles.activityTime}>{formatTime(activity.duration)}</Text>
      </TouchableOpacity>
    </Link>
  );
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h > 0 ? `${h}h ` : ''}${m > 0 ? `${m}m ` : ''}${s}s`;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'left',
    color: '#fff',
  },
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 24,
  },
  podiumBlock: {
    width: 80,
    alignItems: 'center',
    marginHorizontal: 8,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    justifyContent: 'flex-end',
  },
  podiumTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  activityName: {
    fontWeight: '600',
    textAlign: 'center',
    color: '#fff',
  },
  activityTime: {
    fontSize: 12,
    color: '#bbb',
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
    backgroundColor: '#222',
    padding: 12,
    borderRadius: 8,
  },
  toggleButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  othersScroll: {
    maxHeight: 300,
  },
  othersContainer: {
    paddingBottom: 8,
  },
  otherItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: '#111',
    borderColor: '#333',
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});