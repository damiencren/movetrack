import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Button, Platform, TouchableOpacity } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import DateTimePicker from '@react-native-community/datetimepicker';
import DatabaseService from '@/services/sqlite';
import { useSensor } from '@/contexts/SensorContext';

const gestureColors: { [key: string]: string } = {
  WALKING: 'red',
  WALKING_UPSTAIRS: 'blue',
  WALKING_DOWNSTAIRS: 'green',
  SITTING: 'orange',
  STANDING: 'purple',
  LAYING: 'brown',
};



function findClosestPosition(gestureTime: string, positions: any[]) {
  const gestureDate = new Date(gestureTime);
  return positions.reduce((prev, curr) =>
    Math.abs(new Date(curr.created_at).getTime() - gestureDate.getTime()) <
      Math.abs(new Date(prev.created_at).getTime() - gestureDate.getTime())
      ? curr
      : prev
  );
}

export default function MapScreen() {
  const [gestures, setGestures] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const { gesture } = useSensor();
  const [gestureData, setGestureData] = useState<{ id: number; gesture: string; created_at: string }[]>([]);

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
  }, [gesture]);


  const filteredGestures = selectedDate
    ? gestures.filter((g) =>
      g.created_at.startsWith(selectedDate.toISOString().split('T')[0])
    )
    : gestures;

  const filteredPositions = selectedDate
    ? positions.filter((p) =>
      p.created_at.startsWith(selectedDate.toISOString().split('T')[0])
    )
    : positions;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 48.4071146,
          longitude: -71.0679955,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Position trail polyline */}
        {filteredPositions.length > 1 && (
          <Polyline
            coordinates={filteredPositions.map((pos) => ({
              latitude: pos.latitude,
              longitude: pos.longitude,
            }))}
            strokeColor="gray"
            strokeWidth={3}
          />
        )}

        {/* Gesture markers */}
        {filteredGestures.map((gesture, index) => {
          const closestPos = findClosestPosition(gesture.created_at, filteredPositions);
          if (!closestPos) return null;
          return (
            <Marker
              key={index}
              coordinate={{
                latitude: closestPos.latitude,
                longitude: closestPos.longitude,
              }}
              pinColor={gestureColors[gesture.gesture] || 'gray'}
              title={gesture.gesture}
              description={new Date(gesture.created_at).toLocaleTimeString()}
            />
          );
        })}
      </MapView>

      {/* Toggle legend */}
      <TouchableOpacity
        style={styles.legendToggle}
        onPress={() => setShowLegend((prev) => !prev)}
      >
        <Text style={styles.legendToggleText}>{showLegend ? 'Hide Legend' : 'Show Legend'}</Text>
      </TouchableOpacity>

      {/* Legend display */}
      {showLegend && (
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>Legend</Text>
          {Object.keys(gestureColors).map((gesture) => (
            <View key={gesture} style={styles.legendItem}>
              <View style={[styles.colorBox, { backgroundColor: gestureColors[gesture] }]} />
              <Text>{gesture}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Date picker */}
      <View style={styles.datePickerContainer}>
        <Button title="Select Date" onPress={() => setShowDatePicker(true)} />
        {selectedDate && <Text>Selected Date: {selectedDate.toDateString()}</Text>}
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  datePickerContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    elevation: 5,
  },
  legendToggle: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    elevation: 6,
    zIndex: 2,
  },
  legendToggleText: {
    fontWeight: 'bold',
    color: 'black',
  },
  legendContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    elevation: 5,
    zIndex: 1,
  },
  legendTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  colorBox: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
});
