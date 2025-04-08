import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Button } from 'react-native';
import DatabaseService from '@/services/sqlite';

export default function DatabaseViewer() {
  const [gestures, setGestures] = useState<{ id: number; gesture: string; created_at: string }[]>([]);
  const [positions, setPositions] = useState<{ id: number; latitude: number; longitude: number; created_at: string }[]>([]);

  const fetchData = async () => {
    try {
      const fetchedGestures = await DatabaseService.getGestures();
      const fetchedPositions = await DatabaseService.getAllPositions();

      setGestures(fetchedGestures);
      setPositions(fetchedPositions);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
        <ScrollView style={{ maxHeight: 300 }}>
        <Text style={styles.title}>Gestures</Text>
        {gestures.map((gesture) => (
          <View key={gesture.id} style={styles.item}>
            <Text>ID: {gesture.id}</Text>
            <Text>Gesture: {gesture.gesture}</Text>
            <Text>Created At: {gesture.created_at}</Text>
          </View>
        ))}
        </ScrollView>
        <Text style={styles.title}>Positions</Text>
        <ScrollView style={{ maxHeight: 300 }}>
        {positions.map((position) => (
          <View key={position.id} style={styles.item}>
            <Text>ID: {position.id}</Text>
            <Text>Latitude: {position.latitude}</Text>
            <Text>Longitude: {position.longitude}</Text>
            <Text>Created At: {position.created_at}</Text>
          </View>
        ))}
      </ScrollView>

      <Button title="Refresh Data" onPress={fetchData} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  item: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
});