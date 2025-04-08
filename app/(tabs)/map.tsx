import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Button, Platform, TouchableOpacity } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import DateTimePicker from '@react-native-community/datetimepicker';
import DatabaseService from '@/services/sqlite';

const gestureColors: { [key: string]: string } = {
  WALKING: 'red',
  WALKING_UPSTAIRS: 'blue',
  WALKING_DOWNSTAIRS: 'green',
  SITTING: 'orange',
  STANDING: 'purple',
  LAYING: 'brown',
};

export default function MapScreen() {
  const [gestures, setGestures] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [gesturePaths, setGesturePaths] = useState<
    { gesture: string; color: string; coordinates: { latitude: number; longitude: number }[] }[]
  >([]);
  const [filteredPaths, setFilteredPaths] = useState<
    { gesture: string; color: string; coordinates: { latitude: number; longitude: number }[] }[]
  >([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date()); // Default to today's date
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showLegend, setShowLegend] = useState(false); // State to toggle legend visibility

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedGestures = await DatabaseService.getGestures();
        const fetchedPositions = await DatabaseService.getAllPositions();

        setGestures(fetchedGestures);
        setPositions(fetchedPositions);

        processGesturePaths(fetchedGestures, fetchedPositions);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    console.log('fetchedGestures:', gestures); // Log the fetched gestures
    console.log('fetchedPositions:', positions); // Log the fetched positions
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      filterPathsByDate(selectedDate);
    } else {
      setFilteredPaths(gesturePaths);
    }
  }, [selectedDate, gesturePaths]);

  const processGesturePaths = (gestures: any[], positions: any[]) => {
    const paths: {
      gesture: string;
      color: string;
      coordinates: { latitude: number; longitude: number }[];
    }[] = [];

    gestures.forEach((gesture, i) => {
      const startTime = new Date(gesture.created_at).getTime();
      const endTime =
        i + 1 < gestures.length
          ? new Date(gestures[i + 1].created_at).getTime()
          : Infinity;

      const gesturePositions = positions.filter((position) => {
        const time = new Date(position.created_at).getTime();
        return time >= startTime && time < endTime;
      });

      if (gesturePositions.length > 1) {
        // Create a separate path for each gesture segment
        for (let j = 0; j < gesturePositions.length - 1; j++) {
          paths.push({
            gesture: gesture.gesture,
            color: gestureColors[gesture.gesture] || 'gray', // Use predefined color or default to gray
            coordinates: [
              {
                latitude: gesturePositions[j].latitude,
                longitude: gesturePositions[j].longitude,
              },
              {
                latitude: gesturePositions[j + 1].latitude,
                longitude: gesturePositions[j + 1].longitude,
              },
            ],
          });
        }
      }
    });

    setGesturePaths(paths);

  };

  const filterPathsByDate = (date: Date) => {
    const formattedDate = date.toISOString().split('T')[0];
    const filtered = gesturePaths.filter((path) =>
      path.coordinates.some((coord) => {
        const position = positions.find(
          (pos) => pos.latitude === coord.latitude && pos.longitude === coord.longitude
        );
        return position && position.created_at.startsWith(formattedDate);
      })
    );
    //log each path and its coordinates pretty
    filtered.forEach((path) => {
      console.log(`Gesture: ${path.gesture}, Coordinates:`, path.coordinates);
    });
    setFilteredPaths(filtered);
  };

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
        {filteredPaths.map((path, index) => (
          <Polyline
            key={index}
            coordinates={path.coordinates}
            strokeColor={path.color}
            strokeWidth={5}
          />
        ))}
      </MapView>

      {/* Legend Toggle */}
      <TouchableOpacity
        style={styles.legendToggle}
        onPress={() => setShowLegend((prev) => !prev)}
      >
        <Text style={styles.legendToggleText}>{showLegend ? 'Hide Legend' : 'Show Legend'}</Text>
      </TouchableOpacity>

      {/* Legend */}
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
    top: 60, // Adjusted to avoid overlap with the legend
    right: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    elevation: 6, // Ensure it appears above the legend
    zIndex: 2, // Higher zIndex to stay clickable
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
    zIndex: 1, // Lower zIndex than the toggle button
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