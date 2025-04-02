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

type Activity = {
  name: string;
  duration: number; // en secondes
};

export default function StatisticsScreen() {
  const [top3, setTop3] = useState<Activity[]>([]);
  const [others, setOthers] = useState<Activity[]>([]);
  const [showOthers, setShowOthers] = useState(false);

  const placeStyles = ['place1', 'place2', 'place3'] as const;

  useEffect(() => {
    const top: Activity[] = [
      { name: 'Marche', duration: 5400 },
      { name: 'Assis', duration: 4200 },
      { name: 'Course', duration: 3000 },
    ];
  
    const other: Activity[] = [
      { name: 'Monte escalier', duration: 1800 },
      { name: 'Descente escalier', duration: 1200 },
      { name: 'Repos', duration: 900 },
      { name: 'Vélo', duration: 800 },
      { name: 'Yoga', duration: 700 },
      { name: 'Natation', duration: 600 },
      { name: 'Musculation', duration: 500 },
      { name: 'Etirements', duration: 400 },
      { name: 'Danse', duration: 300 },
      { name: 'Aviron', duration: 200 },
    ];
  
    // Tri décroissant
    other.sort((a, b) => b.duration - a.duration);
  
    setTop3(top);
    setOthers(other);
  }, []);
  

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Top 3 Activités</Text>

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

        <TouchableOpacity onPress={() => setShowOthers(!showOthers)} style={styles.toggleButton}>
          <Text style={styles.toggleButtonText}>
            {showOthers ? 'Cacher les autres activités' : 'Voir toutes les autres activités'}
          </Text>
        </TouchableOpacity>

        {showOthers && (
          <View style={styles.othersContainer}>
            {others.map((activity, index) => (
              <View key={index} style={styles.otherItem}>
                <Text style={styles.activityName}>{activity.name}</Text>
                <Text style={styles.activityTime}>{formatTime(activity.duration)}</Text>
              </View>
            ))}
          </View>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginTop: 16,
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
    marginTop: 24,
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
  othersContainer: {
    marginTop: 12,
  },
  otherItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});
