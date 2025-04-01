import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSensor } from '../../contexts/SensorContext';

const SensorTab = () => {
  const { gesture } = useSensor();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity Recognition</Text>
      
      {gesture !== null ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>
            Current Activity: {gesture}
          </Text>
        </View>
      ) : (
        <Text style={styles.loadingText}>Initializing sensors...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5fcff',
  },
  title: {
    fontSize: 24,
    marginBottom: 30,
  },
  resultContainer: {
    backgroundColor: '#e0e0e0',
    padding: 20,
    borderRadius: 10,
  },
  resultText: {
    fontSize: 20,
    color: '#333',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
});

export default SensorTab;