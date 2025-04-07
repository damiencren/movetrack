import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import DatabaseService from '@/services/sqlite'; // Import the DatabaseService

export default function MapScreen() {
  const [locations, setLocations] = useState<{ latitude: number; longitude: number; createdAt: string }[]>([]);
  const [aggregatedLocations, setAggregatedLocations] = useState<
    { latitude: number; longitude: number; count: number; timestamps: string[] }[]
  >([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        // Fetch all positions from the database
        const result = await DatabaseService.getAllPositions();

        // Map the result to ensure `createdAt` is always a string
        const sanitizedLocations = result.map((location: { latitude: number; longitude: number; created_at: string }) => ({
          latitude: location.latitude,
          longitude: location.longitude,
          createdAt: location.created_at ?? '', // Default to an empty string if null
        }));

        setLocations(sanitizedLocations); // Update state with sanitized locations
        aggregateLocations(sanitizedLocations); // Aggregate locations
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    fetchLocations();
  }, []);

  // Haversine formula to calculate distance between two points (in meters)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

    const φ1 = toRadians(lat1);
    const φ2 = toRadians(lat2);
    const Δφ = toRadians(lat2 - lat1);
    const Δλ = toRadians(lon2 - lon1);

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Aggregate locations that are close to each other
  const aggregateLocations = (locations: { latitude: number; longitude: number; createdAt: string }[]) => {
    const threshold = 5; // Distance threshold in meters
    const aggregated: { latitude: number; longitude: number; count: number; timestamps: string[] }[] = [];

    locations.forEach((location) => {
      let found = false;

      for (const group of aggregated) {
        const distance = calculateDistance(location.latitude, location.longitude, group.latitude, group.longitude);
        if (distance <= threshold) {
          // Update the group's average latitude and longitude
          group.latitude = (group.latitude * group.count + location.latitude) / (group.count + 1);
          group.longitude = (group.longitude * group.count + location.longitude) / (group.count + 1);
          group.count += 1;
          group.timestamps.push(location.createdAt); // Add the timestamp to the group
          found = true;
          break;
        }
      }

      if (!found) {
        // Create a new group
        aggregated.push({
          latitude: location.latitude,
          longitude: location.longitude,
          count: 1,
          timestamps: [location.createdAt],
        });
      }
    });

    setAggregatedLocations(aggregated);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 48.4071146, // Default latitude
          longitude: -71.0679955, // Default longitude
          latitudeDelta: 0.05, // Zoom level
          longitudeDelta: 0.05, // Zoom level
        }}
      >
        {aggregatedLocations.map((location, index) => (
        <Marker
          key={index}
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title={`Group of ${location.count} points`}
        >
          <Callout style={{ zIndex: 100 }}>
            <ScrollView style={styles.calloutContainer}>
              <Text style={styles.calloutTitle}>Visited {location.count} times</Text>
              {location.timestamps.map((timestamp, idx) => (
                <Text key={idx} style={styles.calloutText}>
                  {timestamp}
                </Text>
              ))}
            </ScrollView>
          </Callout>
        </Marker>
      ))}
      </MapView>
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
  calloutContainer: {
    width: 200, // Fixed width for the Callout
    maxHeight: 150, // Limit the height of the Callout
  },
  calloutTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  calloutText: {
    fontSize: 12,
  },
});