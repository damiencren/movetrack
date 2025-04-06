import { useEffect } from 'react';
import useSensorPrediction from '../hooks/useSensorPrediction';
import { useSensor } from '../contexts/SensorContext';
import { useModelControl } from '@/contexts/ModelControlContext';
import DatabaseService from '../services/sqlite';

const SensorManager = () => {
  const gestures = [
    'WALKING',
    'WALKING_UPSTAIRS',
    'WALKING_DOWNSTAIRS',
    'SITTING',
    'STANDING',
    'LAYING'
  ];
  
  const { updatePrediction } = useSensor();
  const { predict } = useSensorPrediction({
    modelJson: require('../assets/model/cnn/model.json'),
    modelWeights: require('../assets/model/cnn/group1-shard1of1.bin')
  });
  const { isRunning, startModel } = useModelControl();

  useEffect(() => {
    startModel();
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    
    const interval = setInterval(async () => {
      const prediction = await predict();
      if (prediction !== null) {
        const predictedGesture = gestures[prediction];
        updatePrediction(predictedGesture);
        await DatabaseService.addGesture(predictedGesture); // Add prediction to the database
      }
    }, 2600);

    return () => clearInterval(interval);
  }, [predict, updatePrediction]);

  return null;
};

export default SensorManager;